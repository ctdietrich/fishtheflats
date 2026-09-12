"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import {
  ADMIN_COOKIE,
  adminToken,
  isValidAdminPassword,
  requireAdmin,
} from "@/lib/admin";
import { normalizeListingStatus } from "@/lib/listing-status";
import { prisma } from "@/lib/prisma";

export type ActionState = { ok: boolean; error?: string; message?: string } | null;

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = readString(formData, "email").toLowerCase();
  const name = readString(formData, "name") || null;
  const destination = readString(formData, "destination") || null;
  const species = readString(formData, "species") || null;
  const budgetBand = readString(formData, "budgetBand") || null;
  const partySize = readString(formData, "partySize") || null;
  const source = readString(formData, "source") || "last-minute";
  const flexible30 = formData.get("flexible30") === "on";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const preferences = {
    name,
    destination,
    species,
    budgetBand,
    partySize,
    flexible30,
    source,
  };

  try {
    await prisma.newsletterSignup.upsert({
      where: { email },
      update: preferences,
      create: { email, ...preferences },
    });
  } catch {
    return { ok: false, error: "We could not save those preferences. Try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/last-minute");
  return {
    ok: true,
    message:
      "Preferences saved. Confirm on Beehiiv so you are on the Last-Minute Flats list.",
  };
}

export async function submitListing(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const type = readString(formData, "type");
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const website = readString(formData, "website");
  const destinations = readString(formData, "destinations");
  const species = readString(formData, "species");
  const bio = readString(formData, "bio");

  if (!["guide", "lodge"].includes(type)) {
    return { ok: false, error: "Choose whether this is a guide or a lodge." };
  }
  if (name.length < 2 || bio.length < 20) {
    return { ok: false, error: "Add a name and a short bio (at least 20 characters)." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid contact email." };
  }

  await prisma.submission.create({
    data: {
      type,
      name,
      email,
      website: website || null,
      destinations,
      species,
      bio,
    },
  });

  revalidatePath("/admin");
  return {
    ok: true,
    message: "Received. We review submissions before they appear in the directory.",
  };
}

export async function submitClaim(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const listingId = readString(formData, "listingId");
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const message = readString(formData, "message");

  if (!listingId || name.length < 2 || message.length < 10) {
    return { ok: false, error: "Choose a listing and tell us how you are connected." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email." };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.claimable) {
    return { ok: false, error: "That listing is not available to claim." };
  }

  await prisma.claimRequest.create({
    data: { listingId, name, email, message },
  });

  revalidatePath("/admin");
  return {
    ok: true,
    message: "Claim received. We will write back from the editorial desk.",
  };
}

export async function loginAdmin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = readString(formData, "password");
  const next = readString(formData, "next") || "/admin";

  if (!isValidAdminPassword(password)) {
    return { ok: false, error: "That password is not correct." };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next.startsWith("/") ? next : "/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

function listingPayload(formData: FormData) {
  const type = readString(formData, "type");
  const status = readString(formData, "status");
  const photos = parseList(readString(formData, "photos"));
  const species = parseList(readString(formData, "species"));
  const destinationIds = formData.getAll("destinationIds").map(String).filter(Boolean);

  return {
    type: type === "lodge" ? "lodge" : "guide",
    status: normalizeListingStatus(status, "draft"),
    name: readString(formData, "name"),
    slug: readString(formData, "slug"),
    tagline: readString(formData, "tagline") || null,
    bio: readString(formData, "bio"),
    contactEmail: readString(formData, "contactEmail"),
    website: readString(formData, "website") || null,
    phone: readString(formData, "phone") || null,
    photos,
    species,
    sourceUrl: readString(formData, "sourceUrl") || null,
    featured: formData.get("featured") === "on",
    verified: formData.get("verified") === "on",
    claimable: formData.get("claimable") === "on",
    destinationIds,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function saveListing(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = readString(formData, "id");
  const payload = listingPayload(formData);

  if (payload.name.length < 2 || payload.bio.length < 10) {
    return { ok: false, error: "Name and bio are required." };
  }

  const slug = payload.slug || slugify(payload.name);
  if (!slug) return { ok: false, error: "A URL slug is required." };

  const data = {
    type: payload.type,
    status: payload.status,
    name: payload.name,
    slug,
    tagline: payload.tagline,
    bio: payload.bio,
    contactEmail: payload.contactEmail,
    website: payload.website,
    phone: payload.phone,
    photos: payload.photos,
    species: payload.species,
    sourceUrl: payload.sourceUrl,
    featured: payload.featured,
    verified: payload.verified,
    claimable: payload.claimable,
  };

  try {
    if (id) {
      await prisma.listing.update({
        where: { id },
        data: {
          ...data,
          destinations: {
            deleteMany: {},
            create: payload.destinationIds.map((destinationId) => ({ destinationId })),
          },
        },
      });
    } else {
      await prisma.listing.create({
        data: {
          ...data,
          destinations: {
            create: payload.destinationIds.map((destinationId) => ({ destinationId })),
          },
        },
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "That slug is already in use." };
    }
    return { ok: false, error: "Could not save the listing." };
  }

  revalidatePath("/");
  revalidatePath("/guides");
  revalidatePath("/lodges");
  revalidatePath("/destinations");
  revalidatePath("/admin");
  revalidatePath(`/l/${slug}`);
  redirect("/admin");
}

export async function deleteListing(formData: FormData) {
  await requireAdmin();
  const id = readString(formData, "id");
  if (!id) return;
  await prisma.listing.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateInboxStatus(formData: FormData) {
  await requireAdmin();
  const kind = readString(formData, "kind");
  const id = readString(formData, "id");
  const status = readString(formData, "status") || "reviewed";

  if (kind === "submission") {
    await prisma.submission.update({ where: { id }, data: { status } });
  }
  if (kind === "claim") {
    await prisma.claimRequest.update({ where: { id }, data: { status } });
  }
  revalidatePath("/admin");
}
