import type { Metadata } from "next";
import { DestinationCard } from "@/components/DestinationCard";
import { PageHero } from "@/components/PageHero";
import { getDestinations } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Saltwater fly fishing destinations across the Florida Keys, Bahamas, Louisiana, Yucatán, and Belize.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <main>
      <PageHero
        kicker="Waters"
        title="Destinations"
        lede="The flats we cover now: Keys, Bahamas, Louisiana marsh, and the Yucatán / Belize corridor. Each page collects the guides and lodges we would actually send you to."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      </section>
    </main>
  );
}
