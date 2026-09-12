export const site = {
  name: "FishTheFlats",
  domain: "fishtheflats.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fishtheflats.com",
  tagline: "The directory for saltwater fly fishing guides and lodges.",
  description:
    "A curated two-sided directory of independent saltwater fly fishing guides and premium lodges — for affluent anglers, travel agents, clubs, and corporate trips.",
  listingTypes: [
    { key: "guide" as const, label: "Guide", plural: "Guides", path: "/guides" },
    { key: "lodge" as const, label: "Lodge", plural: "Lodges", path: "/lodges" },
  ],
  species: [
    "Bonefish",
    "Permit",
    "Tarpon",
    "Redfish",
    "Black drum",
    "Speckled trout",
    "Snook",
    "Barracuda",
    "Jacks",
  ],
};

export type ListingTypeKey = (typeof site.listingTypes)[number]["key"];

export function listingPath(slug: string) {
  return `/l/${slug}`;
}

export function absoluteUrl(path = "") {
  return `${site.url.replace(/\/$/, "")}${path}`;
}

export function typeLabel(type: string) {
  return site.listingTypes.find((item) => item.key === type)?.label ?? type;
}
