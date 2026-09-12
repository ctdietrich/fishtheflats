# FishTheFlats

**[fishtheflats.com](https://fishtheflats.com)** is a saltwater fly fishing **directory / two-sided marketplace**.

- **Supply:** independent saltwater fly fishing guides and premium lodges
- **Demand:** affluent anglers, travel agents, clubs, and corporate trips
- **Last-Minute Flats:** newsletter + landing page for lodge openings inside 30 days

This repository is the directory application. It is **not** a catch logger, booking engine, or WordPress site.

Interim brand: typographic wordmark **FishTheFlats**, tide navy / sand / sea-glass, premium outdoor travel aesthetic.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + SQLite (Postgres-ready — change the Prisma `provider` and `DATABASE_URL`)

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
| `/last-minute` | Openings ≤30 days + newsletter signup |
| `/about` | What the product is (and is not) |
| `/admin` | Password-gated CRUD (`ADMIN_PASSWORD`) |

## Local setup

```bash
cp .env.example .env
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
| `DATABASE_URL` | SQLite file locally, e.g. `file:./dev.db`. Use a Postgres URL in production. |
| `ADMIN_PASSWORD` | Shared password for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata, sitemap, and JSON-LD |

## Scripts

```bash
npm run dev      # Next.js dev server
npm run build    # prisma generate + production build
npm run start    # serve the production build
npm run seed     # reset sample destinations, listings, openings
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
