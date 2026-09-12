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
  budgetBands: [
    { key: "under-3k", label: "Under $3,000 / rod" },
    { key: "3-6k", label: "$3,000–6,000 / rod" },
    { key: "6-10k", label: "$6,000–10,000 / rod" },
    { key: "10k-plus", label: "$10,000+ / rod" },
    { key: "flexible", label: "Flexible / not sure" },
  ],
  partySizes: [
    { key: "1", label: "Solo" },
    { key: "2", label: "Two anglers" },
    { key: "3-4", label: "3–4" },
    { key: "5-plus", label: "Club / 5+" },
  ],
  beehiiv: {
    publicationUrl:
      process.env.NEXT_PUBLIC_BEEHIIV_URL ?? "https://fishtheflats.beehiiv.com",
    subscribeUrl:
      process.env.NEXT_PUBLIC_BEEHIIV_SUBSCRIBE_URL ??
      "https://fishtheflats.beehiiv.com/subscribe",
    embedUrl: process.env.NEXT_PUBLIC_BEEHIIV_EMBED_URL ?? "",
    customFields: [
      { local: "destination", beehiiv: "destination", label: "Destination" },
      { local: "species", beehiiv: "species", label: "Species" },
      { local: "budgetBand", beehiiv: "budget_band", label: "Budget band" },
      { local: "partySize", beehiiv: "party_size", label: "Party size" },
      { local: "flexible30", beehiiv: "flexible_30", label: "≤30-day flexible" },
    ],
  },
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
