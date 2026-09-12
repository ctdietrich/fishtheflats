/**
 * Import curated listing rows from a CSV into the Prisma Listing model.
 *
 *   npm run import:listings -- data/hero-seed.sample.csv --dry-run
 *   DATABASE_URL="postgresql://…" npm run import:listings -- /path/to/hero.csv
 *
 * See docs/import-listings.md for columns, aliases, and production notes.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import { normalizeListingStatus } from "../src/lib/listing-status";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

export type ListingType = "guide" | "lodge";

export type MappedListing = {
  slug: string;
  slugFromCsv: boolean;
  type: ListingType;
  name: string;
  tagline: string | null;
  bio: string;
  contactEmail: string;
  website: string | null;
  phone: string | null;
  photos: string[];
  species: string[];
  featured: boolean;
  verified: boolean;
  status: "published" | "draft";
  sourceUrl: string | null;
  claimable: boolean;
  destinationNames: string[];
  region?: string;
  country?: string;
  notes?: string;
  warnings: string[];
};

export type ImportFlags = {
  dryRun: boolean;
  insertOnly: boolean;
  createDestinations: boolean;
  help: boolean;
  selfTest: boolean;
  file?: string;
};

const NAME_KEYS = ["name", "listing", "listing_name", "business", "business_name", "title", "operator"];
const TYPE_KEYS = ["type", "listing_type", "kind", "category", "operator_type"];
const DEST_KEYS = ["destination", "destinations", "dest", "location", "water", "waters", "place"];
const SPECIES_KEYS = ["species", "target_species", "fish", "targets"];
const BIO_KEYS = ["bio", "description", "about", "blurb", "summary", "writeup"];
const EMAIL_KEYS = ["contact_email", "contactemail", "email", "e_mail"];
const CONTACT_KEYS = ["contact"];
const WEBSITE_KEYS = ["website", "url", "web", "site", "homepage"];
const PHONE_KEYS = ["phone", "telephone", "tel", "mobile"];
const SOURCE_KEYS = ["source_url", "sourceurl", "source", "sourced_from", "attribution"];
const STATUS_KEYS = ["status", "publish_status", "listing_status", "state"];
const NOTES_KEYS = ["notes", "note", "internal_notes", "ops_notes"];
const CLAIMABLE_KEYS = ["claimable", "claim", "can_claim"];
const FEATURED_KEYS = ["featured", "feature", "hero"];
const VERIFIED_KEYS = ["verified", "verify"];
const SLUG_KEYS = ["slug", "permalink", "handle"];
const TAGLINE_KEYS = ["tagline", "subtitle", "headline"];
const PHOTOS_KEYS = ["photos", "photo", "images", "image", "photo_urls"];
const REGION_KEYS = ["region", "state", "area"];
const COUNTRY_KEYS = ["country"];

/** Common ops-folder names → seed slugs. */
export const DESTINATION_ALIASES: Record<string, string> = {
  "florida keys": "florida-keys",
  keys: "florida-keys",
  "fl keys": "florida-keys",
  "the keys": "florida-keys",
  islamorada: "florida-keys",
  "key west": "florida-keys",
  marathon: "florida-keys",
  "upper keys": "florida-keys",
  andros: "andros",
  "andros island": "andros",
  "andros bahamas": "andros",
  "cargill creek": "andros",
  abaco: "abaco",
  abacos: "abaco",
  "the abacos": "abaco",
  "marsh harbour": "abaco",
  "grand bahama": "grand-bahama",
  "grand bahama island": "grand-bahama",
  freeport: "grand-bahama",
  louisiana: "louisiana",
  "louisiana coast": "louisiana",
  venice: "louisiana",
  "venice la": "louisiana",
  "grand isle": "louisiana",
  "gulf coast": "louisiana",
  "ascension bay": "ascension-bay",
  "punta allen": "ascension-bay",
  "sian kaan": "ascension-bay",
  "sian ka an": "ascension-bay",
  yucatan: "ascension-bay",
  "yucatan mexico": "ascension-bay",
  "quintana roo": "ascension-bay",
  holbox: "holbox",
  "isla holbox": "holbox",
  "holbox mexico": "holbox",
  belize: "belize",
  "belize flats": "belize",
  turneffe: "belize",
  ambergris: "belize",
  "ambergris caye": "belize",
};

const COUNTRY_HINTS = new Set([
  "mexico",
  "belize",
  "bahamas",
  "the bahamas",
  "united states",
  "usa",
  "us",
  "u.s.",
  "u.s.a.",
]);

export function loadDotEnv(root = repoRoot) {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

export function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^\w]/g, "");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function normalizePlace(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectDelimiter(text: string) {
  const line = text.split(/\r?\n/).find((row) => row.trim()) ?? "";
  const counts = { ",": 0, "\t": 0, ";": 0 };
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char in counts) counts[char as keyof typeof counts] += 1;
  }
  const winner = (Object.entries(counts) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
  return winner && winner[1] > 0 ? winner[0] : ",";
}

export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const source = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(source);
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    if (row.some((cell) => cell.trim())) records.push(row);
    row = [];
  };

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      pushField();
      continue;
    }
    if (char === "\n") {
      pushField();
      pushRow();
      continue;
    }
    if (char === "\r") continue;
    field += char;
  }
  if (field.length || row.length) {
    pushField();
    pushRow();
  }

  if (!records.length) return { headers: [], rows: [] };

  const headers = records[0].map(normalizeHeader);
  const rows = records.slice(1).map((record) => {
    const mapped: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (!header) return;
      const value = (record[index] ?? "").trim();
      if (mapped[header] && !value) return;
      mapped[header] = value;
    });
    return mapped;
  });

  return { headers, rows };
}

export function getField(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (value?.trim()) return value.trim();
  }
  return "";
}

export function parseBoolean(value: string, fallback: boolean) {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

export function parseList(value: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    /* comma / semicolon list */
  }
  return value
    .split(/[;|]/)
    .flatMap((part) => part.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function inferListingType(raw: string, name: string): ListingType {
  const value = raw.trim().toLowerCase();
  if (["lodge", "camp", "inn", "hotel", "resort", "club"].includes(value) || value.includes("lodge")) {
    return "lodge";
  }
  if (["guide", "charter", "captain", "outfitter", "skiff"].includes(value) || value.includes("guide")) {
    return "guide";
  }
  if (/\b(lodge|camp|inn|resort|house|club)\b/i.test(name)) return "lodge";
  return "guide";
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeWebsite(value: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function splitDestinations(value: string): string[] {
  if (!value) return [];
  const full = value.trim();
  if (DESTINATION_ALIASES[normalizePlace(full)]) return [full];

  const primary = full
    .split(/\s*;\s*|\s*\|\s*|\s+&\s+|\s+and\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
  if (primary.length > 1) return primary;

  const comma = full.split(",").map((part) => part.trim()).filter(Boolean);
  if (comma.length > 1 && comma.every((part) => part.length < 48)) {
    const places = comma.filter((part) => !COUNTRY_HINTS.has(normalizePlace(part)));
    return places.length ? places : [full];
  }
  return [full];
}

export function mapRow(row: Record<string, string>, index: number): MappedListing | { error: string } {
  const warnings: string[] = [];
  const name = getField(row, NAME_KEYS);
  if (!name) return { error: `Row ${index + 2}: missing name` };

  const type = inferListingType(getField(row, TYPE_KEYS), name);
  const csvSlug = getField(row, SLUG_KEYS);
  const slug = slugify(csvSlug || name);
  if (!slug) return { error: `Row ${index + 2}: could not build a slug for "${name}"` };

  const destinationValue = getField(row, DEST_KEYS);
  const destinationNames = splitDestinations(destinationValue);
  if (!destinationNames.length) warnings.push(`No destination for "${name}"`);

  const notes = getField(row, NOTES_KEYS);
  const tagline = getField(row, TAGLINE_KEYS) || notes || null;
  const species = parseList(getField(row, SPECIES_KEYS));
  const photos = parseList(getField(row, PHOTOS_KEYS));
  const bio =
    getField(row, BIO_KEYS) ||
    notes ||
    `${name} is a saltwater fly fishing ${type}${destinationNames[0] ? ` in ${destinationNames[0]}` : ""}.`;

  if (!getField(row, BIO_KEYS)) warnings.push(`Generated bio for "${name}"`);

  const emailField = getField(row, EMAIL_KEYS);
  const contactField = getField(row, CONTACT_KEYS);
  let contactEmail = "";
  if (looksLikeEmail(emailField)) contactEmail = emailField.toLowerCase();
  else if (looksLikeEmail(contactField)) contactEmail = contactField.toLowerCase();
  else if (emailField) warnings.push(`Ignored invalid email "${emailField}"`);

  if (!contactEmail) {
    contactEmail = `${slug.replace(/-/g, ".")}@example.com`;
    warnings.push(`No contact email for "${name}"; using ${contactEmail}`);
  }

  const website = normalizeWebsite(getField(row, WEBSITE_KEYS));
  const sourceUrl = normalizeWebsite(getField(row, SOURCE_KEYS)) || website;
  const phone = getField(row, PHONE_KEYS) || (!looksLikeEmail(contactField) ? contactField : "") || null;

  return {
    slug,
    slugFromCsv: Boolean(csvSlug),
    type,
    name,
    tagline,
    bio,
    contactEmail,
    website,
    phone,
    photos,
    species,
    featured: parseBoolean(getField(row, FEATURED_KEYS), false),
    verified: parseBoolean(getField(row, VERIFIED_KEYS), false),
    status: normalizeListingStatus(getField(row, STATUS_KEYS), "published"),
    sourceUrl,
    claimable: parseBoolean(getField(row, CLAIMABLE_KEYS), true),
    destinationNames,
    region: getField(row, REGION_KEYS) || undefined,
    country: getField(row, COUNTRY_KEYS) || undefined,
    notes: notes || undefined,
    warnings,
  };
}

export function parseArgs(argv: string[]): ImportFlags {
  const flags: ImportFlags = {
    dryRun: false,
    insertOnly: false,
    createDestinations: true,
    help: false,
    selfTest: false,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") flags.dryRun = true;
    else if (arg === "--insert-only") flags.insertOnly = true;
    else if (arg === "--no-create-destinations") flags.createDestinations = false;
    else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg === "--self-test") flags.selfTest = true;
    else if (!arg.startsWith("-")) flags.file = arg;
    else throw new Error(`Unknown flag: ${arg}`);
  }
  return flags;
}

export function helpText() {
  return `Import curated listings from a CSV into Postgres (Prisma Listing).

Usage:
  npm run import:listings -- <file.csv> [--dry-run] [--insert-only] [--no-create-destinations]

Options:
  --dry-run                 Parse and report without writing
  --insert-only             Skip rows whose slug or name already exists
  --no-create-destinations  Fail the row if a destination cannot be matched
  --self-test               Run built-in mapping tests
  --help                    Show this message

Hero-ops statuses candidate and ready are stored as published.
Do not run npm run seed against production after an import (seed wipes listings).
`;
}

type DestinationRecord = { id: string; slug: string; name: string };

export function matchDestination(
  name: string,
  destinations: DestinationRecord[],
): DestinationRecord | undefined {
  const needle = normalizePlace(name);
  if (!needle) return undefined;

  const aliasSlug = DESTINATION_ALIASES[needle];
  if (aliasSlug) {
    const byAlias = destinations.find((destination) => destination.slug === aliasSlug);
    if (byAlias) return byAlias;
  }

  return destinations.find((destination) => {
    const slug = normalizePlace(destination.slug.replace(/-/g, " "));
    const label = normalizePlace(destination.name);
    return slug === needle || label === needle;
  });
}

async function resolveDestination(
  prisma: PrismaClient,
  cache: DestinationRecord[],
  listing: MappedListing,
  name: string,
  createDestinations: boolean,
  dryRun: boolean,
) {
  const existing = matchDestination(name, cache);
  if (existing) return existing;
  if (!createDestinations) return undefined;

  const slug = DESTINATION_ALIASES[normalizePlace(name)] || slugify(name);
  const already = cache.find((destination) => destination.slug === slug);
  if (already) return already;
  if (dryRun) {
    const preview = {
      id: `dry-${slug}`,
      slug,
      name,
    };
    cache.push(preview);
    return preview;
  }

  const created = await prisma.destination.create({
    data: {
      slug,
      name,
      region: listing.region || name,
      country: listing.country || "Unknown",
      description: `${name} — added from listing import.`,
    },
    select: { id: true, slug: true, name: true },
  });
  cache.push(created);
  return created;
}

function listingFields(listing: MappedListing) {
  return {
    type: listing.type,
    name: listing.name,
    tagline: listing.tagline,
    bio: listing.bio,
    contactEmail: listing.contactEmail,
    website: listing.website,
    phone: listing.phone,
    photos: listing.photos,
    species: listing.species,
    featured: listing.featured,
    verified: listing.verified,
    status: listing.status,
    sourceUrl: listing.sourceUrl,
    claimable: listing.claimable,
  };
}

export async function importListings(filePath: string, flags: ImportFlags) {
  if (!process.env.DATABASE_URL && !flags.dryRun) {
    throw new Error("DATABASE_URL is not set. Point it at the target Postgres database.");
  }

  const absolute = resolve(filePath);
  if (!existsSync(absolute)) throw new Error(`CSV not found: ${absolute}`);

  const { rows } = parseCsv(readFileSync(absolute, "utf8"));
  if (!rows.length) throw new Error("CSV has a header but no data rows.");

  const prisma = new PrismaClient();
  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const destinations = flags.dryRun && !process.env.DATABASE_URL
      ? []
      : await prisma.destination.findMany({ select: { id: true, slug: true, name: true } });

    for (let index = 0; index < rows.length; index += 1) {
      const mapped = mapRow(rows[index], index);
      if ("error" in mapped) {
        errors.push(mapped.error);
        continue;
      }
      warnings.push(...mapped.warnings);

      const destinationIds: string[] = [];
      for (const destName of mapped.destinationNames) {
        const destination = await resolveDestination(
          prisma,
          destinations,
          mapped,
          destName,
          flags.createDestinations,
          flags.dryRun,
        );
        if (!destination) {
          errors.push(`Row "${mapped.name}": unknown destination "${destName}"`);
          continue;
        }
        destinationIds.push(destination.id);
      }

      if (mapped.destinationNames.length && !destinationIds.length) continue;

      const existing = flags.dryRun && !process.env.DATABASE_URL
        ? null
        : await prisma.listing.findFirst({
            where: {
              OR: [
                { slug: mapped.slug },
                { name: { equals: mapped.name, mode: "insensitive" } },
              ],
            },
            select: { id: true, slug: true, name: true },
          });

      if (existing && flags.insertOnly) {
        skipped.push(`${mapped.name} (${existing.slug})`);
        continue;
      }

      if (flags.dryRun) {
        const action = existing ? "update" : "create";
        console.log(
          `[dry-run] ${action} ${mapped.type} "${mapped.name}" → ${mapped.slug} (${mapped.status}) [${mapped.destinationNames.join(", ") || "no destination"}]`,
        );
        if (existing) updated.push(mapped.name);
        else created.push(mapped.name);
        continue;
      }

      const uniqueDestIds = [...new Set(destinationIds)];
      if (existing) {
        await prisma.listing.update({
          where: { id: existing.id },
          data: {
            ...listingFields(mapped),
            slug: mapped.slugFromCsv ? mapped.slug : existing.slug,
            destinations: {
              deleteMany: {},
              create: uniqueDestIds.map((destinationId) => ({ destinationId })),
            },
          },
        });
        updated.push(mapped.name);
      } else {
        let slug = mapped.slug;
        let suffix = 2;
        while (await prisma.listing.findUnique({ where: { slug }, select: { id: true } })) {
          slug = `${mapped.slug}-${suffix}`;
          suffix += 1;
        }
        await prisma.listing.create({
          data: {
            ...listingFields(mapped),
            slug,
            destinations: {
              create: uniqueDestIds.map((destinationId) => ({ destinationId })),
            },
          },
        });
        created.push(mapped.name);
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  return { created, updated, skipped, errors, warnings, total: rows.length };
}

export function runSelfTests() {
  const csv = `name,type,destination,species,bio,contact_email,website,source_url,status,notes,claimable
"Cayo Verde Skiff Co.",guide,"Florida Keys","Tarpon, Permit","A two-rod Islamorada skiff.","desk@example.com",https://example.com/cayo-verde,https://example.com/source,candidate,"Sight-fishing first.",yes
Marls House,lodge,Andros Island,"Bonefish; Permit",,stay@example.com,example.com/marls,,ready,"Quiet creek lodge.",true
Birdfoot Draft,guide,Venice LA,Redfish,"Winter marsh program.",not-an-email,,,draft,,
`;
  const { rows } = parseCsv(csv);
  if (rows.length !== 3) throw new Error(`expected 3 rows, got ${rows.length}`);

  const candidate = mapRow(rows[0], 0);
  if ("error" in candidate) throw new Error(candidate.error);
  if (candidate.status !== "published") throw new Error("candidate should publish");
  if (candidate.type !== "guide") throw new Error("expected guide");
  if (candidate.claimable !== true) throw new Error("claimable yes");
  if (!candidate.destinationNames.includes("Florida Keys")) throw new Error("destination");

  const ready = mapRow(rows[1], 1);
  if ("error" in ready) throw new Error(ready.error);
  if (ready.status !== "published") throw new Error("ready should publish");
  if (ready.type !== "lodge") throw new Error("lodge inferred");
  if (ready.website !== "https://example.com/marls") throw new Error("website protocol");
  if (ready.tagline !== "Quiet creek lodge.") throw new Error("notes → tagline");
  if (!ready.bio.includes("Quiet creek lodge.")) throw new Error("notes → bio fallback");
  if (ready.species.join(",") !== "Bonefish,Permit") throw new Error(`species ${ready.species}`);

  const draft = mapRow(rows[2], 2);
  if ("error" in draft) throw new Error(draft.error);
  if (draft.status !== "draft") throw new Error("draft should stay draft");
  if (!draft.contactEmail.endsWith("@example.com")) throw new Error("example.com fallback email");
  if (!draft.warnings.some((warning) => warning.includes("No contact email"))) {
    throw new Error("missing email warning");
  }

  const alt = parseCsv(`Listing Name\tKind\tLocation\tStatus
Alias Guide\tcharter\tKeys\tREADY
`);
  const mappedAlt = mapRow(alt.rows[0], 0);
  if ("error" in mappedAlt) throw new Error(mappedAlt.error);
  if (mappedAlt.name !== "Alias Guide") throw new Error("tab alias name");
  if (mappedAlt.type !== "guide") throw new Error("charter → guide");
  if (mappedAlt.status !== "published") throw new Error("READY → published");

  if (!matchDestination("Sian Ka'an", [{ id: "1", slug: "ascension-bay", name: "Ascension Bay" }])) {
    throw new Error("alias Sian Ka'an");
  }

  const samplePath = resolve(repoRoot, "data/hero-seed.sample.csv");
  const sample = parseCsv(readFileSync(samplePath, "utf8"));
  if (sample.rows.length < 5) throw new Error("sample CSV is too short");
  const statuses = sample.rows.map((row, index) => {
    const mapped = mapRow(row, index);
    if ("error" in mapped) throw new Error(mapped.error);
    return mapped.status;
  });
  if (!statuses.includes("published") || !statuses.includes("draft")) {
    throw new Error("sample CSV should include published and draft rows");
  }
  const candidateRow = sample.rows.find((row) => /candidate/i.test(row.status ?? ""));
  if (!candidateRow) throw new Error("sample CSV should include a candidate row");
  const candidateMapped = mapRow(candidateRow, 0);
  if ("error" in candidateMapped || candidateMapped.status !== "published") {
    throw new Error("sample candidate row must publish");
  }
  if (sample.rows.some((row) => {
    const email = (row.contact_email || row.email || "").toLowerCase();
    return email && !email.endsWith("@example.com");
  })) {
    throw new Error("sample CSV must use example.com emails only");
  }

  console.log("import-listings self-test: ok");
}

async function main() {
  loadDotEnv();
  let flags: ImportFlags;
  try {
    flags = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  if (flags.selfTest) {
    runSelfTests();
    return;
  }
  if (flags.help || !flags.file) {
    console.log(helpText());
    if (!flags.file && !flags.help) process.exitCode = 1;
    return;
  }

  const result = await importListings(flags.file, flags);
  console.log(
    [
      flags.dryRun ? "Dry run complete." : "Import complete.",
      `${result.total} rows`,
      `${result.created.length} created`,
      `${result.updated.length} updated`,
      `${result.skipped.length} skipped`,
      `${result.errors.length} errors`,
    ].join(" · "),
  );
  if (result.warnings.length) {
    console.log("Warnings:");
    for (const warning of result.warnings) console.log(`  - ${warning}`);
  }
  if (result.errors.length) {
    console.error("Errors:");
    for (const error of result.errors) console.error(`  - ${error}`);
    process.exitCode = 1;
  }
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
