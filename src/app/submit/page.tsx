import type { Metadata } from "next";
import { submitListing } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Submit a listing",
  description: "Propose a saltwater fly fishing guide or lodge for the FishTheFlats directory.",
};

const field =
  "mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 outline-none focus:border-sea";

export default function SubmitPage() {
  return (
    <main>
      <PageHero
        kicker="Supply side"
        title="Submit a listing"
        lede="Guides and lodges can propose a profile. We review for fit — editorial, not paid placement — before anything is published."
      />
      <section className="mx-auto max-w-2xl px-5 py-12">
        <ActionForm action={submitListing} className="space-y-5" submitLabel="Send for review">
          <label className="block text-sm">
            Type
            <select name="type" required className={field}>
              <option value="guide">Independent guide</option>
              <option value="lodge">Lodge</option>
            </select>
          </label>
          <label className="block text-sm">
            Name
            <input name="name" required className={field} />
          </label>
          <label className="block text-sm">
            Contact email
            <input name="email" type="email" required className={field} />
          </label>
          <label className="block text-sm">
            Website
            <input name="website" type="url" className={field} />
          </label>
          <label className="block text-sm">
            Destinations
            <input
              name="destinations"
              placeholder="Islamorada, Andros…"
              className={field}
            />
          </label>
          <label className="block text-sm">
            Species
            <input
              name="species"
              placeholder={site.species.slice(0, 4).join(", ")}
              className={field}
            />
          </label>
          <label className="block text-sm">
            Bio
            <textarea name="bio" required rows={6} className={field} />
          </label>
        </ActionForm>
      </section>
    </main>
  );
}
