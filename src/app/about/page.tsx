import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

export default function AboutPage() {
  return (
    <main>
      <PageHero
        kicker={site.domain}
        title="A directory, not a catch logger."
        lede="FishTheFlats is a two-sided marketplace for saltwater fly fishing travel: independent guides on one side, premium lodges on the other, and a demand desk of affluent anglers, agents, clubs, and corporate trips."
      />
      <section className="mx-auto max-w-3xl space-y-8 px-5 py-14 text-base leading-8 text-navy-soft">
        <p>
          The interim brand is typographic — <span className="font-display text-navy">FishTheFlats</span>{" "}
          in a tide-navy, sand, and sea-glass palette. No custom mark required. The product is the
          desk: curated water, honest bios, and a direct inquire path.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-sand-light p-6">
            <h2 className="font-display text-2xl text-navy">What we publish</h2>
            <p className="mt-3 text-sm leading-7">
              Guides and lodges with destinations, species, photos, and a way to reach them.
              Featured and verified flags are editorial. Drafts stay off the public site.
            </p>
          </div>
          <div className="rounded-2xl bg-sand-light p-6">
            <h2 className="font-display text-2xl text-navy">What we do not do</h2>
            <p className="mt-3 text-sm leading-7">
              No Stripe. No booking engine. No WordPress. No catch logging. If a room comes free
              inside 30 days, that is a{" "}
              <Link href="/last-minute" className="underline">
                Last-Minute Flats
              </Link>{" "}
              story on Beehiiv — not a checkout flow.
            </p>
          </div>
        </div>
        <p>
          Operators can{" "}
          <Link href="/submit" className="underline">
            submit
          </Link>{" "}
          or{" "}
          <Link href="/claim" className="underline">
            claim
          </Link>{" "}
          a profile. The public pages are the directory. The rest is a small admin for the people
          who keep the desk honest.
        </p>
      </section>
    </main>
  );
}
