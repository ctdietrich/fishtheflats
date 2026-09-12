import Image from "next/image";
import Link from "next/link";
import { DestinationCard } from "@/components/DestinationCard";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import { BeehiivEmbed } from "@/components/BeehiivEmbed";
import { site } from "@/lib/config";
import { organizationJsonLd } from "@/lib/jsonld";
import { getDestinations, getPublishedListings, getPublishedOpenings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, destinations, openings] = await Promise.all([
    getPublishedListings({ featured: true }),
    getDestinations(),
    getPublishedOpenings(),
  ]);

  return (
    <main>
      <JsonLd data={organizationJsonLd()} />
      <section className="relative overflow-hidden bg-navy text-sand-light">
        <Image
          src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2000&q=80"
          alt="Tropical flats water"
          fill
          priority
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/40 via-navy/50 to-navy-deep" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
          <p className="text-xs uppercase tracking-[0.28em] text-sea">{site.brandTagline}</p>
          <h1 className="mt-4 max-w-2xl">
            <Image
              src="/brand/wordmark-on-dark.webp"
              alt="fishtheflats.com"
              width={910}
              height={487}
              className="h-auto w-full max-w-xl md:max-w-2xl"
              priority
              unoptimized
            />
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-sand/85">{site.tagline}</p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-sand/70">
            Independent guides and premium lodges across the Keys, Bahamas, Louisiana, and the
            Yucatán / Belize — for anglers, travel agents, clubs, and corporate trips.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/lodges"
              className="rounded-full bg-sand px-5 py-2.5 text-sm text-navy hover:bg-white"
            >
              Browse lodges
            </Link>
            <Link
              href="/guides"
              className="rounded-full border border-sand/40 px-5 py-2.5 text-sm text-sand-light hover:bg-white/10"
            >
              Find a guide
            </Link>
            <Link href="/last-minute" className="rounded-full px-5 py-2.5 text-sm text-sea hover:text-sand">
              Last-Minute Flats →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sea-deep">Featured</p>
            <h2 className="mt-2 font-display text-4xl text-navy">The desk this season</h2>
          </div>
          <Link href="/destinations" className="text-sm text-navy-soft hover:text-sea-deep">
            All destinations
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="bg-sand-light">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-sea-deep">Waters</p>
          <h2 className="mt-2 font-display text-4xl text-navy">Where the flats run</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                slug={destination.slug}
                name={destination.name}
                region={destination.region}
                country={destination.country}
                heroImage={destination.heroImage}
                count={destination.listings.length}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
        <div className="rounded-2xl bg-navy p-8 text-sand-light">
          <p className="text-xs uppercase tracking-[0.2em] text-sea">Demand</p>
          <h2 className="mt-3 font-display text-3xl">For anglers, agents, and clubs</h2>
          <p className="mt-4 text-sm leading-7 text-sand/80">
            Browse verified water, compare lodges and independent guides, then inquire directly.
            No marketplace take-rate. No booking engine. Just the right desk for a serious trip.
          </p>
          <Link href="/about" className="mt-6 inline-block text-sm text-sand hover:text-white">
            How FishTheFlats works →
          </Link>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-sea-deep">Supply</p>
          <h2 className="mt-3 font-display text-3xl text-navy">Guides and lodges</h2>
          <p className="mt-4 text-sm leading-7 text-navy-soft">
            Claim an existing profile or submit a new one. Listings stay editorial — we publish
            what we would send a client to.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/submit" className="rounded-full bg-navy px-4 py-2 text-sm text-sand-light">
              Submit a listing
            </Link>
            <Link href="/claim" className="rounded-full border border-navy/20 px-4 py-2 text-sm">
              Claim yours
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-navy-soft text-sand-light">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sea">Last-Minute Flats · Beehiiv</p>
            <h2 className="mt-2 font-display text-3xl">Lodge openings inside 30 days</h2>
            <p className="mt-2 max-w-xl text-sm text-sand/75">
              {openings.length
                ? `${openings.length} published openings on the board right now.`
                : "The board is quiet this week."}{" "}
              The mailing list lives on Beehiiv. Set destination, species, budget, and party size
              on the Last-Minute page so the desk knows who can move.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/last-minute"
                className="rounded-full bg-sand px-5 py-2.5 text-sm text-navy hover:bg-white"
              >
                See openings & preferences
              </Link>
              <a
                href={site.beehiiv.subscribeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-sand/40 px-5 py-2.5 text-sm text-sand-light hover:bg-white/10"
              >
                Subscribe on Beehiiv
              </a>
            </div>
          </div>
          <BeehiivEmbed compact />
        </div>
      </section>
    </main>
  );
}
