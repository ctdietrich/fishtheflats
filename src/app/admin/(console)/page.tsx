import Link from "next/link";
import { updateInboxStatus } from "@/app/actions";
import { listingPath, site, typeLabel } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [listings, submissions, claims, signups, openings] = await Promise.all([
    prisma.listing.findMany({
      include: { destinations: { include: { destination: true } } },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    }),
    prisma.submission.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.claimRequest.findMany({
      include: { listing: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.newsletterSignup.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lastMinuteOpening.findMany({
      include: { listing: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-14 px-5 py-10">
      <header>
        <h1 className="font-display text-4xl text-navy">Directory desk</h1>
        <p className="mt-2 text-sm text-muted">
          {listings.length} listings · {signups.length} newsletter signups · {submissions.length}{" "}
          submissions · {claims.length} claims
        </p>
        <p className="mt-2 text-xs text-muted">
          Bulk hero CSV:{" "}
          <Link href="/admin/import" className="text-sea-deep hover:underline">
            /admin/import
          </Link>{" "}
          (same mapping as <code>npm run import:listings</code>). Status{" "}
          <code>candidate</code> / <code>ready</code> publish to the public directory.
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-navy">Listings</h2>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/import" className="text-sea-deep hover:underline">
              Import CSV
            </Link>
            <Link href="/admin/listings/new" className="text-sea-deep hover:underline">
              New listing
            </Link>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-sand-light text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t border-navy/10">
                  <td className="px-4 py-3">
                    <Link href={listingPath(listing.slug)} className="font-medium text-navy">
                      {listing.name}
                    </Link>
                    <div className="text-xs text-muted">
                      {listing.destinations.map((item) => item.destination.name).join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-3">{typeLabel(listing.type)}</td>
                  <td className="px-4 py-3">{listing.status}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {[
                      listing.featured ? "featured" : null,
                      listing.verified ? "verified" : null,
                      listing.claimable ? "claimable" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="text-sea-deep hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <Inbox
          title="Submissions"
          empty="No listing submissions."
          rows={submissions.map((item) => ({
            id: item.id,
            kind: "submission" as const,
            title: `${item.name} · ${item.type}`,
            detail: item.email,
            status: item.status,
            body: item.bio,
          }))}
        />
        <Inbox
          title="Claims"
          empty="No claim requests."
          rows={claims.map((item) => ({
            id: item.id,
            kind: "claim" as const,
            title: item.listing.name,
            detail: `${item.name} · ${item.email}`,
            status: item.status,
            body: item.message,
          }))}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-navy">Subscriber preferences</h2>
          <p className="mt-1 text-xs text-muted">
            Local desk copy. The mailing list of record is{" "}
            <a href={site.beehiiv.publicationUrl} className="underline" target="_blank" rel="noreferrer">
              Beehiiv
            </a>
            .
          </p>
          <ul className="mt-4 divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
            {signups.map((signup) => (
              <li key={signup.id} className="px-4 py-3 text-sm">
                <span className="font-medium text-navy">{signup.email}</span>
                {signup.name ? <span className="text-muted"> · {signup.name}</span> : null}
                <div className="mt-1 text-xs text-muted">
                  {[
                    signup.destination,
                    signup.species,
                    site.budgetBands.find((band) => band.key === signup.budgetBand)?.label ??
                      signup.budgetBand,
                    site.partySizes.find((size) => size.key === signup.partySize)?.label ??
                      signup.partySize,
                    signup.flexible30 ? "≤30-day flexible" : "not 30-day flexible",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </li>
            ))}
            {!signups.length ? (
              <li className="px-4 py-3 text-sm text-muted">No preference rows yet.</li>
            ) : null}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl text-navy">Last-minute openings</h2>
          <ul className="mt-4 divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
            {openings.map((opening) => (
              <li key={opening.id} className="px-4 py-3 text-sm">
                <span className="font-medium text-navy">{opening.listing.name}</span>
                <div className="text-muted">
                  {opening.startDate.toLocaleDateString()} – {opening.endDate.toLocaleDateString()}
                  {opening.published ? "" : " · hidden"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Inbox({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: {
    id: string;
    kind: "submission" | "claim";
    title: string;
    detail: string;
    status: string;
    body: string;
  }[];
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-navy">{title}</h2>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-navy/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-navy">{row.title}</p>
                <p className="text-xs text-muted">{row.detail}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.14em] text-sea-deep">{row.status}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-navy-soft">{row.body}</p>
            <form action={updateInboxStatus} className="mt-3">
              <input type="hidden" name="kind" value={row.kind} />
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="status" value="reviewed" />
              <button type="submit" className="text-sm text-sea-deep hover:underline">
                Mark reviewed
              </button>
            </form>
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-muted">{empty}</li> : null}
      </ul>
    </div>
  );
}
