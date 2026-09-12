"use client";

import { useActionState } from "react";
import { saveListing, type ActionState } from "@/app/actions";
import { site } from "@/lib/config";
import { asStringArray } from "@/lib/listings";
import type { Destination, Listing } from "@prisma/client";

const field =
  "mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 outline-none focus:border-sea";

type ListingWithIds = Listing & { destinations: { destinationId: string }[] };

export function ListingForm({
  listing,
  destinations,
}: {
  listing?: ListingWithIds;
  destinations: Destination[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveListing, null);
  const selected = new Set(listing?.destinations.map((item) => item.destinationId) ?? []);

  return (
    <form action={action} className="space-y-5">
      {listing ? <input type="hidden" name="id" value={listing.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Name
          <input name="name" required defaultValue={listing?.name} className={field} />
        </label>
        <label className="text-sm">
          Slug
          <input name="slug" defaultValue={listing?.slug} className={field} />
        </label>
        <label className="text-sm">
          Type
          <select name="type" defaultValue={listing?.type ?? "guide"} className={field}>
            {site.listingTypes.map((type) => (
              <option key={type.key} value={type.key}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Status
          <select name="status" defaultValue={listing?.status ?? "draft"} className={field}>
            <option value="draft">draft — hidden from the directory</option>
            <option value="published">published</option>
            <option value="candidate">candidate — publishes (hero import)</option>
            <option value="ready">ready — publishes (hero import)</option>
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          Tagline
          <input name="tagline" defaultValue={listing?.tagline ?? ""} className={field} />
        </label>
        <label className="text-sm md:col-span-2">
          Bio
          <textarea name="bio" required rows={6} defaultValue={listing?.bio} className={field} />
        </label>
        <label className="text-sm">
          Contact email
          <input
            name="contactEmail"
            type="email"
            required
            defaultValue={listing?.contactEmail}
            className={field}
          />
        </label>
        <label className="text-sm">
          Website
          <input name="website" defaultValue={listing?.website ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Phone
          <input name="phone" defaultValue={listing?.phone ?? ""} className={field} />
        </label>
        <label className="text-sm">
          Source URL
          <input name="sourceUrl" defaultValue={listing?.sourceUrl ?? ""} className={field} />
        </label>
        <label className="text-sm md:col-span-2">
          Photos (comma-separated URLs)
          <textarea
            name="photos"
            rows={3}
            defaultValue={asStringArray(listing?.photos).join(", ")}
            className={field}
          />
        </label>
        <label className="text-sm md:col-span-2">
          Species (comma-separated)
          <input
            name="species"
            defaultValue={asStringArray(listing?.species).join(", ")}
            className={field}
          />
        </label>
      </div>
      <fieldset>
        <legend className="text-sm">Destinations</legend>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {destinations.map((destination) => (
            <label key={destination.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="destinationIds"
                value={destination.id}
                defaultChecked={selected.has(destination.id)}
              />
              {destination.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={listing?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="verified" defaultChecked={listing?.verified} />
          Verified
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="claimable" defaultChecked={listing?.claimable ?? true} />
          Claimable
        </label>
      </div>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-navy px-5 py-2.5 text-sm text-sand-light disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save listing"}
      </button>
    </form>
  );
}
