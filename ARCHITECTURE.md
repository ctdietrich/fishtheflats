# Architecture — niche directory kit

FishTheFlats is a **vertical directory**: two listing types, a destination taxonomy, editorial publishing, inbound claim/submit, and a last-minute inventory newsletter. The same skeleton can be cloned for another travel or outdoor niche.

## Mental model

```
Demand  →  browse destinations / types / species  →  inquire on the listing
Supply  →  submit or claim  →  editorial review in /admin  →  published listing
Ops     →  last-minute openings (≤30 days) + Beehiiv list + local preference rows
```

There is no payments layer and no availability engine. The product is the catalog and the desk.

## Stack map

| Layer | Choice | Why it clones cleanly |
| --- | --- | --- |
| App | Next.js App Router | File-based pages; metadata + sitemap live next to routes |
| UI | Tailwind + a small component set | Brand tokens live in `globals.css` |
| Data | Prisma | PostgreSQL via `DATABASE_URL` (local or hosted) |
| Auth | Shared `ADMIN_PASSWORD` cookie | Enough for a one-desk editorial tool |

## Domain objects

Defined in `prisma/schema.prisma`:

- **Destination** — place taxonomy (`slug`, region, country, hero)
- **Listing** — `guide` or `lodge` (or whatever types you configure)
  - `species[]`, `photos[]` (JSON)
  - `featured`, `verified`, `status` (`draft` \| `published`)
  - CSV / admin aliases `candidate` and `ready` normalize to `published` (`src/lib/listing-status.ts`)
  - `sourceUrl`, `claimable`, `contactEmail` / `website`
- **ListingDestination** — many-to-many
- **Submission** / **ClaimRequest** — inbound supply
- **NewsletterSignup** — local subscriber preferences (destination, species, budget, party, ≤30-day flexible). Beehiiv is the mailing list of record.
- **LastMinuteOpening** — dated lodge (or analog) inventory

To retarget the vertical, you rarely need new tables. You change **labels, types, and seed content**.

## Where to change a clone

1. **Brand** — `src/lib/config.ts` (`name`, `domain`, `tagline`, `listingTypes`, filter vocabulary) and `src/app/globals.css` (palette + fonts in `src/app/layout.tsx`).
2. **Types** — `site.listingTypes` plus the `/guides` and `/lodges` pages (rename or add a third type page). Listing URLs stay `/l/[slug]` so cards do not care.
3. **Taxonomy** — destinations in `prisma/seed.ts` (or rename Destination to Region / Mountain / Coast).
4. **Copy** — `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/last-minute/page.tsx`.
5. **SEO** — `src/lib/jsonld.ts` (schema.org types), `src/app/sitemap.ts`, `src/app/robots.ts`.
6. **Admin** — already generic CRUD. Inbox tables follow submissions and claims.

## Request flow

```
Public pages (RSC)
  → src/lib/listings.ts (published-only queries)
  → Prisma / PostgreSQL

Forms (submit, claim, newsletter preferences, admin)
  → src/app/actions.ts (server actions)
  → Prisma
  → revalidatePath / redirect

Last-Minute / newsletter CTAs
  → Beehiiv publication or embed (`NEXT_PUBLIC_BEEHIIV_*`)
  → plus local NewsletterSignup preference rows
```

`/admin` is a route group (`admin/(console)`) gated by `src/lib/admin.ts`. Login lives at `/admin/login` and is public.

## Postgres (Vercel)

The schema provider is `postgresql`. Local and production both use `DATABASE_URL`.

1. Set `DATABASE_URL` (and `ADMIN_PASSWORD`) on Vercel. `NEXT_PUBLIC_SITE_URL` is optional.
2. Deploy. Build is `prisma generate && next build`. Data routes are `force-dynamic` so prerender does not query the database.
3. Post-deploy: `npx prisma migrate deploy` (or `npm run db:deploy`). Then seed only if you want sample data.

JSON columns (`photos`, `species`) map to `JSONB`.

## Intentionally out of scope

- Payments (Stripe)
- Real-time booking / room inventory beyond a dated opening row
- WordPress or a headless CMS
- Catch logging, leaderboards, or angler social features
- Multi-user operator accounts (claims are an inbox, not auth)

Add those only when the directory is earning its keep.

## File guide

```
prisma/schema.prisma          models
prisma/seed.ts                15–20 sample listings (destructive)
scripts/import-listings.ts    CLI wrapper around the shared importer
src/lib/import-listings.ts    shared CSV parse + upsert (CLI + /admin/import)
src/app/admin/(console)/import  ADMIN_PASSWORD-gated CSV upload
data/hero-seed.sample.csv     expected import columns
docs/import-listings.md       column aliases + production runbook
src/lib/config.ts             brand + types (clone here first)
src/lib/listings.ts           public queries
src/lib/listing-status.ts     published aliases (candidate/ready)
src/lib/admin.ts              password cookie
src/app/actions.ts            mutations
src/app/l/[slug]/page.tsx     listing + JSON-LD
src/app/admin/(console)/      CRUD + inbox + CSV import
src/components/               cards, header, filters, Beehiiv embed
```
