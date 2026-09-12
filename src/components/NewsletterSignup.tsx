"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type ActionState } from "@/app/actions";
import { site } from "@/lib/config";

const field =
  "mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-ink outline-none focus:border-sea";

type DestinationOption = { slug: string; name: string };

export function NewsletterSignupForm({
  destinations,
  source = "last-minute",
  defaultFlexible = true,
  variant = "navy",
}: {
  destinations: DestinationOption[];
  source?: string;
  defaultFlexible?: boolean;
  variant?: "navy" | "light";
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    subscribeNewsletter,
    null,
  );
  const onNavy = variant === "navy";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="source" value={source} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          Name
          <input name="name" className={field} autoComplete="name" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className={field} autoComplete="email" />
        </label>
        <label className="block text-sm">
          Destination
          <select name="destination" className={field} defaultValue="">
            <option value="">Any water</option>
            {destinations.map((destination) => (
              <option key={destination.slug} value={destination.slug}>
                {destination.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Species
          <select name="species" className={field} defaultValue="">
            <option value="">Any species</option>
            {site.species.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Budget band
          <select name="budgetBand" className={field} defaultValue="">
            <option value="">Prefer not to say</option>
            {site.budgetBands.map((band) => (
              <option key={band.key} value={band.key}>
                {band.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Party size
          <select name="partySize" className={field} defaultValue="">
            <option value="">—</option>
            {site.partySizes.map((size) => (
              <option key={size.key} value={size.key}>
                {size.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="flexible30"
          defaultChecked={defaultFlexible}
          className="mt-1"
        />
        <span>I can travel within 30 days when a lodge and a skiff come free.</span>
      </label>
      {state?.error ? (
        <p className={onNavy ? "text-sm text-sand" : "text-sm text-red-700"}>{state.error}</p>
      ) : null}
      {state?.ok && state.message ? (
        <p className={onNavy ? "text-sm text-sea" : "text-sm text-sea-deep"}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={`rounded-full px-5 py-2.5 text-sm disabled:opacity-60 ${
          onNavy
            ? "bg-sand text-navy hover:bg-white"
            : "bg-navy text-sand-light hover:bg-navy-soft"
        }`}
      >
        {pending ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
