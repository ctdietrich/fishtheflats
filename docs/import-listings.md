# Import listings from CSV

Use this when a curated hero sheet (often 50+ rows in an ops folder) needs to land in Postgres without wiping existing data.

`npm run seed` **deletes** listings, destinations, claims, and openings. Do **not** seed production after a real import.

The owner’s 54-row hero CSV is **not** in this repository. Point the script at that file on the machine that can reach Production `DATABASE_URL`.

## Quick start

```bash
# Preview mapping (no writes). Works even without a database if you only want parse/status checks.
npm run import:listings -- data/hero-seed.sample.csv --dry-run

# Built-in mapping tests (candidate/ready → published, aliases, emails)
npm run import:listings -- --self-test

# Write to the database in DATABASE_URL (local, staging, or Neon production)
npm run import:listings -- /absolute/path/to/hero.csv
```

Production (from a laptop or CoS box that has the real CSV and the **unpooled** Neon URL if the pooler rejects DDL-adjacent sessions):

```bash
export DATABASE_URL="postgresql://…neon.tech/…?sslmode=require"
npm install
npx prisma migrate deploy          # already done on production; safe to re-run
npm run import:listings -- --dry-run /path/to/hero-candidates.csv
npm run import:listings -- /path/to/hero-candidates.csv
```

Then confirm on [fishtheflats.vercel.app](https://fishtheflats.vercel.app) and `/admin`.

## Expected columns

See [`data/hero-seed.sample.csv`](../data/hero-seed.sample.csv) for a complete header row. Headers are matched **case-insensitively**; spaces and hyphens become underscores (`Source URL` → `source_url`).

| Logical field | Prisma | Accepted headers (any one) |
| --- | --- | --- |
| name | `name` | `name`, `listing`, `listing_name`, `business`, `title`, `operator` |
| type | `type` (`guide` \| `lodge`) | `type`, `listing_type`, `kind`, `category` |
| destination | `ListingDestination` | `destination`, `destinations`, `dest`, `location`, `water` |
| species | `species` (JSON) | `species`, `target_species`, `fish` |
| bio | `bio` | `bio`, `description`, `about`, `blurb` |
| contact email | `contactEmail` | `contact_email`, `email`, `contact` (if it looks like an email) |
| website | `website` | `website`, `url`, `web`, `site` |
| source | `sourceUrl` | `source_url`, `source`, `attribution` |
| status | `status` | `status`, `publish_status`, `state` |
| notes | `tagline` if no tagline; also bio fallback | `notes`, `note`, `internal_notes` |
| claimable | `claimable` | `claimable`, `claim`, `can_claim` |
| featured / verified | booleans | `featured`, `hero` / `verified` |
| phone | `phone` | `phone`, `telephone`, `tel` |
| tagline | `tagline` | `tagline`, `subtitle`, `headline` |
| slug | `slug` | `slug`, `permalink` |
| photos | `photos` (JSON) | `photos`, `images`, `photo_urls` |
| region / country | new destinations only | `region`, `country` |

Comma, semicolon, tab, or `|` lists work for species, photos, and destinations. Quoted fields and newlines inside quotes are supported. A UTF-8 BOM is stripped.

There is **no** `notes` column on `Listing`. Notes become the tagline when `tagline` is empty.

### Status → published

These CSV values are stored as **`published`** and appear on the public directory and in `/admin` as published:

`published`, `candidate`, `ready`, `live`, `approved`, `active`, `hero`

These stay **`draft`**:

`draft`, `pending`, `unpublished`, `hidden`, `review`, `hold`

An empty status on import defaults to **published** (this is a curated hero load, not a public submit form). The admin “New listing” form still defaults to draft.

Public queries also treat leftover `candidate` / `ready` rows as published, so a raw sheet dump cannot hide hero listings.

### Type inference

If `type` is blank, names containing lodge / camp / inn / resort / house / club become `lodge`; everything else is `guide`. Values like `charter`, `captain`, or `outfitter` map to `guide`.

### Destinations

The script matches existing `Destination` rows by slug, name, and aliases (`Keys` → Florida Keys, `Andros Island` → Andros, `Sian Ka'an` / `Punta Allen` → Ascension Bay, `Venice` → Louisiana Coast, and similar).

Missing destinations are **created** unless you pass `--no-create-destinations`. Created rows get a slugified name and a short placeholder description — tidy them in `/admin` later if needed.

### Emails

`contactEmail` is required on the model. Rows without a valid email get `{slug}@example.com` and a warning. **Do not invent operator emails for real businesses.** Use `example.com` in sheets and sample data until the operator claims the profile.

## Flags

| Flag | Meaning |
| --- | --- |
| `--dry-run` | Parse, resolve destinations, print create/update. No writes. |
| `--insert-only` | Skip when slug or name already exists (default is upsert). |
| `--no-create-destinations` | Error the row instead of inserting a destination. |
| `--self-test` | Mapping tests; no database. |
| `--help` | Usage. |

Re-runs upsert by **slug** or case-insensitive **name**. An explicit `slug` column may rename; a generated slug will not overwrite an existing listing’s slug.

## Sample vs production sheet

`data/hero-seed.sample.csv` is fictional desk copy. Names are invented; every address is `@example.com`. Swap in the real 54-row file when you run Production — do not commit that file here if it contains personal emails or unpaid-for operator data.
