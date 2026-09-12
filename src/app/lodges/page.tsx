import type { Metadata } from "next";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import { getDestinations, getPublishedListings } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Lodges",
  description:
    "Premium saltwater fly fishing lodges in the Keys, Bahamas, Louisiana, Yucatán, and Belize.",
};

export default async function LodgesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; destination?: string; species?: string }>;
}) {
  const filters = await searchParams;
  const [listings, destinations] = await Promise.all([
    getPublishedListings({
      type: "lodge",
      query: filters.q,
      destinationSlug: filters.destination,
      species: filters.species,
    }),
    getDestinations(),
  ]);

  return (
    <main>
      <PageHero
        kicker="Stay on the water"
        title="Lodges"
        lede="House-scale camps and classic flats lodges. Built for serious weeks, club takeovers, and the occasional corporate incentive trip."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <FilterBar
          action="/lodges"
          destinations={destinations}
          current={filters}
        />
        <p className="mt-6 text-sm text-muted">{listings.length} published lodges</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </main>
  );
}
