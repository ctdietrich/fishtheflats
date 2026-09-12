import Link from "next/link";
import { ListingForm } from "@/components/admin/ListingForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "New listing" };

export default async function NewListingPage() {
  const destinations = await prisma.destination.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-4xl text-navy">New listing</h1>
      <p className="mt-2 text-sm text-muted">
        Drafts stay off the public directory until published. Curated CSV imports use{" "}
        <Link href="/admin/import" className="text-sea-deep hover:underline">
          /admin/import
        </Link>{" "}
        or <code className="text-navy">npm run import:listings</code>; status values{" "}
        <code className="text-navy">candidate</code> and <code className="text-navy">ready</code>{" "}
        publish immediately.
      </p>
      <div className="mt-8">
        <ListingForm destinations={destinations} />
      </div>
    </main>
  );
}
