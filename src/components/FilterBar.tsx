import { site } from "@/lib/config";

type DestinationOption = { slug: string; name: string };

export function FilterBar({
  action,
  destinations,
  current,
}: {
  action: string;
  destinations: DestinationOption[];
  current: { q?: string; destination?: string; species?: string };
}) {
  return (
    <form
      action={action}
      className="grid gap-3 rounded-2xl border border-navy/10 bg-white p-4 md:grid-cols-4"
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Search</span>
        <input
          name="q"
          defaultValue={current.q}
          placeholder="Name or water"
          className="w-full rounded-lg border border-navy/15 bg-foam px-3 py-2 outline-none focus:border-sea"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">
          Destination
        </span>
        <select
          name="destination"
          defaultValue={current.destination ?? ""}
          className="w-full rounded-lg border border-navy/15 bg-foam px-3 py-2 outline-none focus:border-sea"
        >
          <option value="">All waters</option>
          {destinations.map((destination) => (
            <option key={destination.slug} value={destination.slug}>
              {destination.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Species</span>
        <select
          name="species"
          defaultValue={current.species ?? ""}
          className="w-full rounded-lg border border-navy/15 bg-foam px-3 py-2 outline-none focus:border-sea"
        >
          <option value="">All species</option>
          {site.species.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm text-sand-light hover:bg-navy-soft"
        >
          Filter
        </button>
      </div>
    </form>
  );
}
