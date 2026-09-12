import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { site } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-navy/10 bg-navy text-sand-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" aria-label="FishTheFlats home">
            <BrandLockup tone="dark" size="footer" />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-sand/80">
            A two-sided directory for independent saltwater fly fishing guides and
            premium lodges. Built for anglers, travel agents, clubs, and corporate trips.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sea">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/destinations">Destinations</Link>
            </li>
            <li>
              <Link href="/guides">Guides</Link>
            </li>
            <li>
              <Link href="/lodges">Lodges</Link>
            </li>
            <li>
              <Link href="/last-minute">Last-Minute Flats</Link>
            </li>
            <li>
              <a href={site.beehiiv.subscribeUrl} target="_blank" rel="noreferrer">
                Beehiiv newsletter
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sea">Operators</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/submit">Submit a listing</Link>
            </li>
            <li>
              <Link href="/claim">Claim a listing</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl justify-between px-5 py-4 text-xs text-sand/60">
          <span>{site.domain}</span>
          <span>Directory — not a booking engine.</span>
        </div>
      </div>
    </footer>
  );
}
