import type { Metadata } from "next";
import Link from "next/link";
import { BeehiivEmbed } from "@/components/BeehiivEmbed";
import { NewsletterSignupForm } from "@/components/NewsletterSignup";
import { PageHero } from "@/components/PageHero";
import { listingPath, typeLabel } from "@/lib/config";
import { getDestinations, getPublishedOpenings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Last-Minute Flats",
  description:
    "Lodge openings inside 30 days for flexible saltwater fly anglers. Subscribe to Last-Minute Flats on Beehiiv.",
};

function formatRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

export default async function LastMinutePage() {
  const [openings, destinations] = await Promise.all([
    getPublishedOpenings(),
    getDestinations(),
  ]);

  return (
    <main>
      <PageHero
        kicker="Beehiiv newsletter"
        title="Last-Minute Flats"
        lede="Lodge rooms and skiffs that come free inside 30 days. The list of record is Beehiiv. Trip preferences stay on the desk so we know which water, species, and party you can move for."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-3xl text-navy">Openings on the board</h2>
          <div className="mt-6 space-y-4">
            {openings.map((opening) => (
              <article
                key={opening.id}
                className="rounded-2xl border border-navy/10 bg-white p-5"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-sea-deep">
                  {typeLabel(opening.listing.type)} ·{" "}
                  {opening.listing.destinations.map((item) => item.destination.name).join(", ")}
                </p>
                <h3 className="mt-1 font-display text-2xl text-navy">
                  <Link href={listingPath(opening.listing.slug)} className="hover:text-sea-deep">
                    {opening.listing.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-navy-soft">
                  {formatRange(opening.startDate, opening.endDate)}
                </p>
                {opening.notes ? (
                  <p className="mt-3 text-sm leading-6 text-muted">{opening.notes}</p>
                ) : null}
              </article>
            ))}
            {!openings.length ? (
              <p className="text-muted">No published openings inside the 30-day window right now.</p>
            ) : null}
          </div>
        </div>
        <aside className="h-fit space-y-6 lg:col-span-2">
          <BeehiivEmbed />
          <div className="rounded-2xl bg-navy p-6 text-sand-light">
            <h2 className="font-display text-3xl">Trip preferences</h2>
            <p className="mt-3 text-sm leading-6 text-sand/75">
              Stored on the directory desk (and mapped to Beehiiv custom fields when you add them
              on the publication). Beehiiv remains the mailing list.
            </p>
            <div className="mt-6">
              <NewsletterSignupForm
                destinations={destinations}
                source="last-minute"
                defaultFlexible
                variant="navy"
              />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
