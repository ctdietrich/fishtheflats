import type { Destination } from "@prisma/client";
import { absoluteUrl, listingPath, site, typeLabel } from "./config";
import { asStringArray, type ListingWithDestinations } from "./listings";

export function listingJsonLd(listing: ListingWithDestinations) {
  const destinations = listing.destinations.map((item) => item.destination.name);
  const photos = asStringArray(listing.photos);
  const type =
    listing.type === "lodge" ? "LodgingBusiness" : "SportsActivityLocation";

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: listing.name,
    description: listing.tagline ?? listing.bio,
    url: absoluteUrl(listingPath(listing.slug)),
    email: listing.contactEmail,
    image: photos,
    telephone: listing.phone ?? undefined,
    sameAs: listing.website ? [listing.website] : undefined,
    areaServed: destinations,
    additionalType: typeLabel(listing.type),
    identifier: listing.slug,
  };
}

export function destinationJsonLd(destination: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: destination.name,
    description: destination.description,
    url: absoluteUrl(`/destinations/${destination.slug}`),
    image: destination.heroImage ?? undefined,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `${destination.region}, ${destination.country}`,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
  };
}
