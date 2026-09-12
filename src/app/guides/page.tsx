import type { Metadata } from "next";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import { getDestinations, getPublishedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Independent saltwater fly fishing guides across the Keys, Bahamas, Louisiana, Yucatán, and Belize.",
};

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; destination?: string; species?: string }>;
}) {
  const filters = await searchParams;
  const [listings, destinations] = await Promise.all([
    getPublishedListings({
      type: "guide",
      query: filters.q,
      destinationSlug: filters.destination,
      species: filters.species,
    }),
    getDestinations(),
  ]);

  return (
    <main>
      <PageHero
        kicker="Independent operators"
        title="Guides"
        lede="Single-skiff outfits and small cooperatives. Inquire directly — FishTheFlats does not take a booking fee."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <FilterBar
          action="/guides"
          destinations={destinations}
          current={filters}
        />
        <p className="mt-6 text-sm text-muted">{listings.length} published guides</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </main>
  );
}
