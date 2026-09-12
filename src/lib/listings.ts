import type { Destination, Listing, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type ListingWithDestinations = Listing & {
  destinations: { destination: Destination }[];
};

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function listingCover(listing: Pick<Listing, "photos">) {
  return asStringArray(listing.photos)[0] ?? null;
}

const published = { status: "published" };

export async function getPublishedListings(filters?: {
  type?: string;
  destinationSlug?: string;
  species?: string;
  query?: string;
  featured?: boolean;
}) {
  const where: Prisma.ListingWhereInput = { ...published };

  if (filters?.type) where.type = filters.type;
  if (filters?.featured) where.featured = true;
  if (filters?.destinationSlug) {
    where.destinations = {
      some: { destination: { slug: filters.destinationSlug } },
    };
  }
  if (filters?.query) {
    where.OR = [
      { name: { contains: filters.query, mode: "insensitive" } },
      { tagline: { contains: filters.query, mode: "insensitive" } },
      { bio: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    include: { destinations: { include: { destination: true } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  if (!filters?.species) return listings;

  const needle = filters.species.toLowerCase();
  return listings.filter((listing) =>
    asStringArray(listing.species).some((item) => item.toLowerCase() === needle),
  );
}

export async function getListingBySlug(slug: string, includeDraft = false) {
  return prisma.listing.findFirst({
    where: includeDraft ? { slug } : { slug, ...published },
    include: { destinations: { include: { destination: true } } },
  });
}

export async function getDestinations() {
  return prisma.destination.findMany({
    include: {
      listings: {
        where: { listing: published },
        include: { listing: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getDestinationBySlug(slug: string) {
  return prisma.destination.findUnique({
    where: { slug },
    include: {
      listings: {
        where: { listing: published },
        include: { listing: true },
      },
    },
  });
}

export async function getPublishedOpenings() {
  const now = new Date();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 30);

  return prisma.lastMinuteOpening.findMany({
    where: {
      published: true,
      startDate: { lte: horizon },
      endDate: { gte: now },
    },
    include: {
      listing: {
        include: { destinations: { include: { destination: true } } },
      },
    },
    orderBy: { startDate: "asc" },
  });
}

export async function getClaimableListings() {
  return prisma.listing.findMany({
    where: { claimable: true, status: "published" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, type: true, slug: true },
  });
}
