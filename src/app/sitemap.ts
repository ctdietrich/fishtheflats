import type { MetadataRoute } from "next";
import { absoluteUrl, listingPath } from "@/lib/config";
import { publishedListingWhere } from "@/lib/listing-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, destinations] = await Promise.all([
    prisma.listing.findMany({
      where: publishedListingWhere,
      select: { slug: true, updatedAt: true },
    }),
    prisma.destination.findMany({ select: { slug: true } }),
  ]);

  const staticRoutes = [
    "",
    "/destinations",
    "/guides",
    "/lodges",
    "/submit",
    "/claim",
    "/last-minute",
    "/about",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...destinations.map((destination) => ({
      url: absoluteUrl(`/destinations/${destination.slug}`),
      lastModified: new Date(),
    })),
    ...listings.map((listing) => ({
      url: absoluteUrl(listingPath(listing.slug)),
      lastModified: listing.updatedAt,
    })),
  ];
}
