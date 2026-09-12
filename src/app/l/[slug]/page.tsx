import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { listingPath, typeLabel } from "@/lib/config";
import { listingJsonLd } from "@/lib/jsonld";
import { asStringArray, getListingBySlug } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Listing" };
  return {
    title: listing.name,
    description: listing.tagline ?? listing.bio.slice(0, 160),
    alternates: { canonical: listingPath(listing.slug) },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const photos = asStringArray(listing.photos);
  const species = asStringArray(listing.species);
  const destinations = listing.destinations.map((item) => item.destination);

  return (
    <main>
      <JsonLd data={listingJsonLd(listing)} />
      <section className="bg-navy text-sand-light">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-xs uppercase tracking-[0.2em] text-sea">
            {typeLabel(listing.type)}
            {listing.verified ? " · Verified" : ""}
            {listing.featured ? " · Featured" : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">{listing.name}</h1>
          {listing.tagline ? (
            <p className="mt-4 max-w-2xl text-lg text-sand/80">{listing.tagline}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-sand/70">
            {destinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.slug}`}
                className="rounded-full border border-white/15 px-3 py-1 hover:bg-white/10"
              >
                {destination.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {photos[0] ? (
        <div className="relative mx-auto mt-8 max-w-6xl overflow-hidden rounded-2xl px-5">
          <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-navy">
            <Image
              src={photos[0]}
              alt={listing.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <p className="text-base leading-8 text-navy-soft">{listing.bio}</p>
          <div className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Species</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {species.map((item) => (
                <span key={item} className="rounded-full bg-sand-light px-3 py-1 text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
          {photos.length > 1 ? (
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {photos.slice(1).map((photo) => (
                <div key={photo} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-navy">
                  <Image src={photo} alt="" fill className="object-cover" sizes="50vw" />
                </div>
              ))}
            </div>
          ) : null}
        </article>
        <aside className="h-fit rounded-2xl border border-navy/10 bg-white p-6">
          <h2 className="font-display text-2xl text-navy">Inquire directly</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            FishTheFlats is a directory. Reach the operator on their terms — we do not book or
            take a commission.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted">Email</dt>
              <dd>
                <a className="text-sea-deep hover:underline" href={`mailto:${listing.contactEmail}`}>
                  {listing.contactEmail}
                </a>
              </dd>
            </div>
            {listing.website ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Website</dt>
                <dd>
                  <a
                    className="text-sea-deep hover:underline"
                    href={listing.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {listing.website.replace(/^https?:\/\//, "")}
                  </a>
                </dd>
              </div>
            ) : null}
            {listing.phone ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Phone</dt>
                <dd>{listing.phone}</dd>
              </div>
            ) : null}
            {listing.sourceUrl ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Source</dt>
                <dd className="break-all text-muted">{listing.sourceUrl}</dd>
              </div>
            ) : null}
          </dl>
          {listing.claimable ? (
            <Link
              href={`/claim?listing=${listing.id}`}
              className="mt-6 inline-block text-sm text-navy hover:text-sea-deep"
            >
              Claim this listing →
            </Link>
          ) : (
            <p className="mt-6 text-xs uppercase tracking-[0.16em] text-sea-deep">Claimed</p>
          )}
        </aside>
      </section>
    </main>
  );
}
