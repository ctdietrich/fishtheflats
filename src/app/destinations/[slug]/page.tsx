import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationCard } from "@/components/DestinationCard";
import { JsonLd } from "@/components/JsonLd";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import { destinationJsonLd } from "@/lib/jsonld";
import { getDestinationBySlug, getDestinations, getPublishedListings } from "@/lib/listings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return { title: "Destination" };
  return {
    title: destination.name,
    description: destination.description,
    alternates: { canonical: `/destinations/${destination.slug}` },
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const listings = await getPublishedListings({ destinationSlug: destination.slug });
  const others = (await getDestinations()).filter((item) => item.id !== destination.id);

  return (
    <main>
      <JsonLd data={destinationJsonLd(destination)} />
      <PageHero
        kicker={`${destination.region}, ${destination.country}`}
        title={destination.name}
        lede={destination.description}
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-display text-3xl text-navy">Guides and lodges</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {!listings.length ? (
          <p className="mt-6 text-muted">No published listings on this water yet.</p>
        ) : null}
        <h3 className="mt-16 font-display text-2xl text-navy">Other waters</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {others.slice(0, 3).map((item) => (
            <DestinationCard
              key={item.id}
              slug={item.slug}
              name={item.name}
              region={item.region}
              country={item.country}
              heroImage={item.heroImage}
              count={item.listings.length}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
