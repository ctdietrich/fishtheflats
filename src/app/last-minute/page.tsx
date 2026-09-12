import type { Metadata } from "next";
import Link from "next/link";
import { subscribeNewsletter } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { PageHero } from "@/components/PageHero";
import { listingPath, typeLabel } from "@/lib/config";
import { getPublishedOpenings } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Last-Minute Flats",
  description:
    "Lodge openings inside 30 days for flexible saltwater fly anglers. Subscribe to the Last-Minute Flats newsletter.",
};

const field =
  "mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 outline-none focus:border-sea";

function formatRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

export default async function LastMinutePage() {
  const openings = await getPublishedOpenings();

  return (
    <main>
      <PageHero
        kicker="Newsletter"
        title="Last-Minute Flats"
        lede="Lodge rooms and skiffs that come free inside 30 days. For flexible anglers — not for people who need a year of calendar theater."
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
        <aside className="h-fit rounded-2xl bg-navy p-6 text-sand-light lg:col-span-2">
          <h2 className="font-display text-3xl">Get the list</h2>
          <p className="mt-3 text-sm leading-6 text-sand/75">
            One email when a lodge releases space. No booking engine, no drip campaign — just the
            openings.
          </p>
          <ActionForm
            action={subscribeNewsletter}
            className="mt-6 space-y-4"
            submitLabel="Join Last-Minute Flats"
            variant="sand"
          >
            <label className="block text-sm">
              Name
              <input name="name" className={field} />
            </label>
            <label className="block text-sm">
              Email
              <input name="email" type="email" required className={field} />
            </label>
          </ActionForm>
        </aside>
      </section>
    </main>
  );
}
