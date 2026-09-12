# FishTheFlats

**[fishtheflats.com](https://fishtheflats.com)** is a saltwater fly fishing **directory / two-sided marketplace**.

- **Supply:** independent saltwater fly fishing guides and premium lodges
- **Demand:** affluent anglers, travel agents, clubs, and corporate trips
- **Last-Minute Flats:** [Beehiiv](https://fishtheflats.beehiiv.com/) newsletter + landing page for lodge openings inside 30 days

This repository is the directory application. It is **not** a catch logger, booking engine, or WordPress site.

Interim brand: typographic wordmark **FishTheFlats**, tide navy / sand / sea-glass, premium outdoor travel aesthetic.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (`DATABASE_URL`)

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Featured listings, destinations, demand/supply desk |
| `/destinations` | Waters we cover |
| `/destinations/[slug]` | Guides and lodges on one water |
| `/guides` | Independent guides + filters |
| `/lodges` | Premium lodges + filters |
| `/l/[slug]` | Listing detail + JSON-LD |
| `/submit` | Operator submission |
| `/claim` | Claim a sourced profile |
| `/last-minute` | Openings ≤30 days + Beehiiv subscribe + trip preferences |
| `/about` | What the product is (and is not) |
| `/admin` | Password-gated CRUD (`ADMIN_PASSWORD`) |
| `/admin/import` | Signed-in CSV upsert (same logic as `npm run import:listings`) |

## Local setup

Postgres must be running and reachable at `DATABASE_URL` (local Postgres, Neon, Vercel Postgres, or similar).

```bash
cp .env.example .env
# Create the database, then point DATABASE_URL at it
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
Default local password is `change-me` (set `ADMIN_PASSWORD` in `.env`).

Seed data uses **@example.com** addresses only and includes 19 sample listings across the Keys, Bahamas, Louisiana, and Yucatán / Belize.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | **Required.** Postgres connection string |
| `ADMIN_PASSWORD` | **Required** in production. Shared password for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Optional. Canonical site URL for metadata, sitemap, and JSON-LD |
| `NEXT_PUBLIC_BEEHIIV_URL` | Beehiiv publication (default `https://fishtheflats.beehiiv.com`) |
| `NEXT_PUBLIC_BEEHIIV_SUBSCRIBE_URL` | Subscribe deep-link (default `…/subscribe`) |
| `NEXT_PUBLIC_BEEHIIV_EMBED_URL` / `BEEHIIV_EMBED_URL` | Publication homepage default (`https://fishtheflats.beehiiv.com`) |
| `NEXT_PUBLIC_BEEHIIV_FORM_ID` | Official subscribe form id (`1ee62311-bba2-433a-aecc-2518b838ac08`) |

## Deploy on Vercel

Set these project environment variables (Production, and Preview if you want those deploys to hit a database):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres URL from Vercel Postgres, Neon, Supabase, or any host. Use a pooled URL for the app if the provider offers one. |
| `ADMIN_PASSWORD` | Yes | Shared `/admin` password |
| `NEXT_PUBLIC_SITE_URL` | No | e.g. `https://fishtheflats.com`. If unset, the app falls back to `VERCEL_URL` or `https://fishtheflats.com` |

Build already runs `prisma generate && next build`. Database pages are `force-dynamic`, so Next does not prerender them at build time. `DATABASE_URL` must still be present so Prisma can generate the client; a missing or invalid database fails at **runtime**, not during compile.

Do **not** run migrations during the Vercel build. After the first deploy (and after later schema changes), apply migrations against production:

```bash
# From a machine that can reach the production database
npx prisma migrate deploy
# or: npm run db:deploy
```

If `migrate deploy` fails on a pooled host (PgBouncer / Neon pooler), rerun it with the provider’s **direct / unpooled** connection string as `DATABASE_URL` for that command only.

Then optionally load **sample** data (dev / empty staging only — this **wipes** listing tables):

```bash
npm run seed
```

To load a curated hero CSV **without** wiping (production or staging), upload it at **`/admin/import`** while signed in with `ADMIN_PASSWORD`. That path uses the production `DATABASE_URL` already on Vercel — do not copy the URL off the project. The real ops-folder sheet is not in git; [`data/hero-seed.sample.csv`](./data/hero-seed.sample.csv) shows the expected columns. Status values `candidate` and `ready` publish.

The CLI still works on a machine that already has the database URL:

```bash
npm run import:listings -- --dry-run data/hero-seed.sample.csv
DATABASE_URL="postgresql://…" npm run import:listings -- /path/to/hero.csv
```

See [docs/import-listings.md](./docs/import-listings.md).

## Newsletter (Beehiiv)

Beehiiv is the **list of record**. The directory still stores subscriber **preferences** locally (`NewsletterSignup`) so the desk knows destination, species, budget band, party size, and ≤30-day flexibility.

Map those to Beehiiv custom fields on the publication:

| Local column | Beehiiv custom field |
| --- | --- |
| `destination` | `destination` |
| `species` | `species` |
| `budgetBand` | `budget_band` |
| `partySize` | `party_size` |
| `flexible30` | `flexible_30` |

`/last-minute` and the homepage newsletter CTA load the official Beehiiv subscribe form:

```html
<script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="1ee62311-bba2-433a-aecc-2518b838ac08"></script>
```

Deep-link fallback: [fishtheflats.beehiiv.com](https://fishtheflats.beehiiv.com/).

## Scripts

```bash
npm run dev         # Next.js dev server
npm run build       # prisma generate + production build
npm run start       # serve the production build
npm run db:deploy         # prisma migrate deploy (production)
npm run seed              # reset sample destinations, listings, openings (destructive)
npm run import:listings   # upsert listings from a CSV (see docs/import-listings.md)
npm run lint
```

## Product boundaries

- No Stripe
- No booking engine
- No WordPress
- No catch logging

Operators inquire directly. FishTheFlats publishes the desk.

## Clone this for another niche

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how the directory kit is structured and how to retarget it (e.g. steelhead lodges, upland outfitters, yacht captains).
