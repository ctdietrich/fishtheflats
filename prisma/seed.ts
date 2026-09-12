import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const img = (id: string, extra = "") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80${extra}`;

async function main() {
  await prisma.lastMinuteOpening.deleteMany();
  await prisma.claimRequest.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.newsletterSignup.deleteMany();
  await prisma.listingDestination.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.destination.deleteMany();

  const destinations = await Promise.all(
    [
      {
        slug: "florida-keys",
        name: "Florida Keys",
        region: "Florida",
        country: "United States",
        description:
          "The island chain from Key Largo to the Dry Tortugas — the most famous tarpon, permit, and bonefish fishery in the continental United States. Islamorada, Marathon, and Key West remain the heart of the American flats.",
        heroImage: img("photo-1500375592092-40eb2168fd21"),
      },
      {
        slug: "andros",
        name: "Andros",
        region: "Andros",
        country: "Bahamas",
        description:
          "The largest Bahamian island and the spiritual home of bonefishing. Endless west-side marls, creek systems, and ocean-side flats produce silver kings and professional-grade permit.",
        heroImage: img("photo-1559827260-dc66d52bef19"),
      },
      {
        slug: "abaco",
        name: "Abaco",
        region: "Abaco",
        country: "Bahamas",
        description:
          "Creek country and ocean flats around Marsh Harbour, Cherokee, and the Marls. A classic Bahamas destination for bonefish with a growing permit reputation.",
        heroImage: img("photo-1468413253725-0d5181091126"),
      },
      {
        slug: "grand-bahama",
        name: "Grand Bahama",
        region: "Grand Bahama",
        country: "Bahamas",
        description:
          "North-shore creeks and south-side ocean flats a short hop from Florida. Convenient, fishy, and well suited to first-time Bahamas weeks.",
        heroImage: img("photo-1473496169904-658ba7c44d8a"),
      },
      {
        slug: "louisiana",
        name: "Louisiana Coast",
        region: "Louisiana",
        country: "United States",
        description:
          "The marsh coast from Venice to Grand Isle — redfish on the fly in skinny water, black drum on crab patterns, and a distinctly Gulf character. Ideal for winter and spring travel.",
        heroImage: img("photo-1445053023192-8d45cb66099d"),
      },
      {
        slug: "ascension-bay",
        name: "Ascension Bay",
        region: "Quintana Roo",
        country: "Mexico",
        description:
          "The Yucatán's premier permit fishery. Sian Ka'an Biosphere Reserve flats, turtle-grass banks, and professional Mexican guides who have spent a lifetime on these waters.",
        heroImage: img("photo-1544551763-46a013bb70d5"),
      },
      {
        slug: "holbox",
        name: "Holbox",
        region: "Yucatán",
        country: "Mexico",
        description:
          "A sandbar island on the Yucatán's north coast. Permit, juvenile tarpon, and a slower island rhythm — close to Cancún, far from the resort corridor.",
        heroImage: img("photo-1573843981267-be1999ff37cd"),
      },
      {
        slug: "belize",
        name: "Belize Flats",
        region: "Belize",
        country: "Belize",
        description:
          "Turneffe, Ambergris, and the southern atolls — a grand-slam fishery where permit, tarpon, and bonefish share the same week. English-speaking, well hosted, and year-round.",
        heroImage: img("photo-1516426122078-c23e76319801"),
      },
    ].map((d) => prisma.destination.create({ data: d })),
  );

  const bySlug = Object.fromEntries(destinations.map((d) => [d.slug, d.id]));

  type SeedListing = {
    slug: string;
    type: "guide" | "lodge";
    name: string;
    tagline: string;
    bio: string;
    contactEmail: string;
    website: string;
    phone?: string;
    photos: string[];
    species: string[];
    featured: boolean;
    verified: boolean;
    status: "published" | "draft";
    sourceUrl: string;
    claimable: boolean;
    claimedAt?: Date;
    destinationSlugs: string[];
  };

  const listings: SeedListing[] = [
    {
      slug: "tide-line-outfitters",
      type: "guide",
      name: "Tide Line Outfitters",
      tagline: "Islamorada tarpon, permit, and bonefish — one skiff, one tide.",
      bio: "Captain Elena Voss has fished the Islamorada chain for twenty-two seasons. Tide Line runs a single-skiff day, limited to two anglers, with an emphasis on sight-fishing the oceanside and backcountry rather than packing a box score. Winter permit and spring tarpon are the house specialties; summer bonefish mornings keep the calendar honest.",
      contactEmail: "elena@example.com",
      website: "https://example.com/tide-line",
      phone: "+1-305-555-0142",
      photos: [img("photo-1524704654690-b56c05c78a00"), img("photo-1437482078695-73f5ca6c96e2")],
      species: ["Tarpon", "Permit", "Bonefish"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/tide-line",
      claimable: false,
      claimedAt: new Date("2024-11-02"),
      destinationSlugs: ["florida-keys"],
    },
    {
      slug: "marquesa-moon-charters",
      type: "guide",
      name: "Marquesa Moon Charters",
      tagline: "Key West nights and Marquesas mornings.",
      bio: "Based in Key West, Marquesa Moon runs west to the Marquesas and north into the lakes for migratory tarpon and resident permit. Captain Jonah Hale keeps the program small — two boats, a tight fly shop partnership, and a preference for experienced casters who want to hunt rather than prospect.",
      contactEmail: "jonah@example.com",
      website: "https://example.com/marquesa-moon",
      photos: [img("photo-1476514525535-07fb3b4ae5f1"), img("photo-1507525428034-b723cf961d3e")],
      species: ["Tarpon", "Permit", "Barracuda"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/marquesa-moon",
      claimable: true,
      destinationSlugs: ["florida-keys"],
    },
    {
      slug: "ghost-tail-guides",
      type: "guide",
      name: "Ghost Tail Guides",
      tagline: "Marathon backcountry, unhurried.",
      bio: "A Marathon-based pair who split time between oceanside permit and the Keys backcountry. Ghost Tail is the quieter alternative to the Islamorada circuit — later launches, longer poling runs, and a clientele of repeat anglers who book a year out.",
      contactEmail: "guides@example.com",
      website: "https://example.com/ghost-tail",
      photos: [img("photo-1501785888041-af3ef285b470")],
      species: ["Bonefish", "Permit", "Snook"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/ghost-tail",
      claimable: true,
      destinationSlugs: ["florida-keys"],
    },
    {
      slug: "andros-silver-king",
      type: "guide",
      name: "Andros Silver King",
      tagline: "West-side marls and ocean flats with Andros-born guides.",
      bio: "Independent Andros guides who work the west-side creeks and the ocean flats out of Cargill Creek and Behring Point. Not a lodge program — you stay where you like and meet the skiff at first light. Bonefish are the daily bread; permit and seasonal tarpon are treated as the prize they are.",
      contactEmail: "andros@example.com",
      website: "https://example.com/andros-silver-king",
      photos: [img("photo-1559827260-dc66d52bef19"), img("photo-1469474968028-56623f02e42e")],
      species: ["Bonefish", "Permit", "Tarpon"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/andros-silver-king",
      claimable: true,
      destinationSlugs: ["andros"],
    },
    {
      slug: "abaco-creek-guides",
      type: "guide",
      name: "Abaco Creek Guide Service",
      tagline: "The Marls, Cherokee Sound, and ocean-side tails.",
      bio: "A three-guide cooperative covering the Abaco Marls and Cherokee Sound. Ideal for anglers who want local knowledge without a full lodge package — they will arrange skiff meet-ups from Marsh Harbour and recommend the right week for wind and tides.",
      contactEmail: "abaco@example.com",
      website: "https://example.com/abaco-creek",
      photos: [img("photo-1468413253725-0d5181091126")],
      species: ["Bonefish", "Permit"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/abaco-creek",
      claimable: true,
      destinationSlugs: ["abaco"],
    },
    {
      slug: "marshline-outfitters",
      type: "guide",
      name: "Marshline Outfitters",
      tagline: "Venice and the birdfoot — redfish on the fly.",
      bio: "Captain Rhett Landry runs the lower Mississippi birdfoot and the marsh south of Venice. Winter and early spring are the program: copper-reds on shrimp and crab patterns, black drum on the edges, and the occasional jack that ruins a six-weight. Corporate and club groups are welcome on a two-skiff pairing.",
      contactEmail: "rhett@example.com",
      website: "https://example.com/marshline",
      phone: "+1-504-555-0190",
      photos: [img("photo-1445053023192-8d45cb66099d"), img("photo-1498654200943-1088dd4438ae")],
      species: ["Redfish", "Black drum", "Speckled trout"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/marshline",
      claimable: false,
      claimedAt: new Date("2025-03-14"),
      destinationSlugs: ["louisiana"],
    },
    {
      slug: "chenier-flats-guides",
      type: "guide",
      name: "Chenier Flats Guides",
      tagline: "Grand Isle to the chenier plain.",
      bio: "A west-of-the-river alternative to the Venice circuit. Chenier Flats fishes the skinny marsh and the beaches when the wind allows, with a reputation for large redfish and unhurried days. Best from November through April.",
      contactEmail: "chenier@example.com",
      website: "https://example.com/chenier",
      photos: [img("photo-1500534314209-a25ddb2bd429")],
      species: ["Redfish", "Black drum"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/chenier",
      claimable: true,
      destinationSlugs: ["louisiana"],
    },
    {
      slug: "sian-kaan-permit-co",
      type: "guide",
      name: "Sian Ka'an Permit Co.",
      tagline: "Ascension Bay specialists. Permit first.",
      bio: "A Punta Allen-based guide company built around permit. The team grew up poling the Sian Ka'an Biosphere and treats bonefish and juvenile tarpon as honest secondary shots, never as filler. English-speaking, camera-friendly, and booked through a tight winter-spring window.",
      contactEmail: "siankaan@example.com",
      website: "https://example.com/sian-kaan-permit",
      photos: [img("photo-1544551763-46a013bb70d5"), img("photo-1473496169904-658ba7c44d8a")],
      species: ["Permit", "Bonefish", "Tarpon"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/sian-kaan-permit",
      claimable: true,
      destinationSlugs: ["ascension-bay"],
    },
    {
      slug: "turneffe-flats-guide",
      type: "guide",
      name: "Turneffe Flats Guide",
      tagline: "Independent days on the atoll.",
      bio: "For anglers staying on Ambergris or the mainland who want Turneffe without a lodge lock-in. Early boat, long run, and a guide who knows which cays hold permit on a falling tide. Grand-slam weeks are possible; they will not promise one.",
      contactEmail: "turneffe.guide@example.com",
      website: "https://example.com/turneffe-guide",
      photos: [img("photo-1516426122078-c23e76319801")],
      species: ["Permit", "Tarpon", "Bonefish"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/turneffe-guide",
      claimable: true,
      destinationSlugs: ["belize"],
    },
    {
      slug: "holbox-windward-guides",
      type: "guide",
      name: "Holbox Windward Guides",
      tagline: "North-Yucatán permit and baby tarpon.",
      bio: "A two-skiff operation on Isla Holbox. Mornings on the windward banks for permit; afternoons in the lagoon for juvenile tarpon when the wind goes east. Easy logistics from Cancún and a good add-on to an Ascension Bay week.",
      contactEmail: "holbox@example.com",
      website: "https://example.com/holbox-windward",
      photos: [img("photo-1573843981267-be1999ff37cd")],
      species: ["Permit", "Tarpon", "Bonefish"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/holbox-windward",
      claimable: true,
      destinationSlugs: ["holbox"],
    },
    {
      slug: "tradewind-andros-lodge",
      type: "lodge",
      name: "Tradewind Andros Lodge",
      tagline: "Twelve rooms on the Cargill Creek shoreline.",
      bio: "A small, adults-oriented lodge on the east side of Andros. Tradewind runs a classic Bahamas week: guided flats in the morning, a quiet dock in the afternoon, and a dining room that still feels like a private house. The guide roster is Andros-born; the flats program covers both the west-side marls and the ocean side.",
      contactEmail: "stay@example.com",
      website: "https://example.com/tradewind-andros",
      photos: [
        img("photo-1540541338287-41700207dee6"),
        img("photo-1559827260-dc66d52bef19"),
        img("photo-1573843981267-be1999ff37cd"),
      ],
      species: ["Bonefish", "Permit", "Tarpon"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/tradewind-andros",
      claimable: false,
      claimedAt: new Date("2024-08-20"),
      destinationSlugs: ["andros"],
    },
    {
      slug: "abaco-bonefish-club",
      type: "lodge",
      name: "Abaco Bonefish Club",
      tagline: "Creek lodge living on the Marls edge.",
      bio: "Eight cottages and a working dock on the Abaco Marls. The Club is deliberately un-resort: ceiling fans, a honor-bar sundown, and guides who grew up in Cherokee and Marsh Harbour. Strong for first-time Bahamas travelers and for clubs that want the whole property.",
      contactEmail: "club@example.com",
      website: "https://example.com/abaco-bonefish-club",
      photos: [img("photo-1540541338287-41700207dee6"), img("photo-1468413253725-0d5181091126")],
      species: ["Bonefish", "Permit"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/abaco-bonefish-club",
      claimable: true,
      destinationSlugs: ["abaco"],
    },
    {
      slug: "grand-bahama-lodge",
      type: "lodge",
      name: "Grand Bahama Lodge",
      tagline: "A short hop from Florida. A full Bahamas week.",
      bio: "North-shore access and a south-side ocean-flats program, thirty minutes from the Grand Bahama airport. The lodge is the convenient Bahamas option for long-weekend anglers and for travel agents building a first international flats trip.",
      contactEmail: "grandbahama@example.com",
      website: "https://example.com/grand-bahama-lodge",
      photos: [img("photo-1473496169904-658ba7c44d8a")],
      species: ["Bonefish", "Permit"],
      featured: false,
      verified: false,
      status: "published",
      sourceUrl: "https://example.com/grand-bahama-lodge",
      claimable: true,
      destinationSlugs: ["grand-bahama"],
    },
    {
      slug: "islamorada-tide-house",
      type: "lodge",
      name: "Islamorada Tide House",
      tagline: "A Keys house, not a hotel — with a guide desk.",
      bio: "A restored waterfront house on Upper Matecumbe that books as a whole-property stay. The Tide House pairs lodging with a rotating desk of Islamorada guides and is built for families, clubs, and corporate groups who want the Keys without a marina motel.",
      contactEmail: "tidehouse@example.com",
      website: "https://example.com/islamorada-tide-house",
      photos: [img("photo-1507525428034-b723cf961d3e"), img("photo-1500375592092-40eb2168fd21")],
      species: ["Tarpon", "Permit", "Bonefish", "Snook"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/islamorada-tide-house",
      claimable: true,
      destinationSlugs: ["florida-keys"],
    },
    {
      slug: "ascension-bay-lodge",
      type: "lodge",
      name: "Ascension Bay Lodge",
      tagline: "Permit water, Sian Ka'an, twelve anglers at most.",
      bio: "The Yucatán lodge for anglers who came for permit. Located on the edge of the biosphere, the program is skiff-first: experienced Mexican guides, a serious fly shop, and a dining room that understands early breakfasts. Shoulder-season weeks are the last-minute opportunity; peak winter is spoken for a year ahead.",
      contactEmail: "ascension@example.com",
      website: "https://example.com/ascension-bay-lodge",
      photos: [
        img("photo-1544551763-46a013bb70d5"),
        img("photo-1540541338287-41700207dee6"),
        img("photo-1516426122078-c23e76319801"),
      ],
      species: ["Permit", "Bonefish", "Tarpon"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/ascension-bay-lodge",
      claimable: false,
      claimedAt: new Date("2025-01-09"),
      destinationSlugs: ["ascension-bay"],
    },
    {
      slug: "casa-permit-holbox",
      type: "lodge",
      name: "Casa d'Permit Holbox",
      tagline: "Six rooms, two skiffs, one sandbar island.",
      bio: "A house-scale lodge on Holbox for anglers who want Yucatán permit without the Punta Allen transfer. Casual, design-forward, and serious about the morning tide. Pairs well with a Cancún arrival and a long weekend.",
      contactEmail: "casa@example.com",
      website: "https://example.com/casa-permit",
      photos: [img("photo-1573843981267-be1999ff37cd"), img("photo-1540541338287-41700207dee6")],
      species: ["Permit", "Tarpon"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/casa-permit",
      claimable: true,
      destinationSlugs: ["holbox"],
    },
    {
      slug: "turneffe-atoll-lodge",
      type: "lodge",
      name: "Turneffe Atoll Lodge",
      tagline: "Grand-slam water, atoll quiet, Belize done properly.",
      bio: "A classic atoll lodge on Turneffe: guided flats, reef days when the wind demands it, and the legitimate chance at permit, tarpon, and bonefish in a single week. The lodge hosts couples, clubs, and the occasional corporate incentive trip. English-speaking staff, fly-shop on site, and a transfers desk from Belize City.",
      contactEmail: "atoll@example.com",
      website: "https://example.com/turneffe-atoll",
      photos: [img("photo-1516426122078-c23e76319801"), img("photo-1559827260-dc66d52bef19")],
      species: ["Permit", "Tarpon", "Bonefish", "Barracuda"],
      featured: true,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/turneffe-atoll",
      claimable: true,
      destinationSlugs: ["belize"],
    },
    {
      slug: "venice-marsh-camp",
      type: "lodge",
      name: "Venice Marsh Camp",
      tagline: "A working camp at the end of the road.",
      bio: "Not a spa. Venice Marsh Camp is a six-room camp at the birdfoot with a cook who understands gumbo and guides who understand the tide. Built for winter redfish weeks, club takeovers, and anyone who would rather hear the marsh than a lobby.",
      contactEmail: "camp@example.com",
      website: "https://example.com/venice-marsh-camp",
      photos: [img("photo-1445053023192-8d45cb66099d"), img("photo-1500534314209-a25ddb2bd429")],
      species: ["Redfish", "Black drum", "Speckled trout"],
      featured: false,
      verified: true,
      status: "published",
      sourceUrl: "https://example.com/venice-marsh-camp",
      claimable: true,
      destinationSlugs: ["louisiana"],
    },
    {
      slug: "reef-house-draft",
      type: "lodge",
      name: "Reef House Belize",
      tagline: "Ambergris-side draft listing — awaiting photos and claim.",
      bio: "A placeholder lodge listing sourced from public materials. Awaiting operator claim, verified photos, and a current guide roster before it is featured.",
      contactEmail: "reefhouse@example.com",
      website: "https://example.com/reef-house",
      photos: [img("photo-1473496169904-658ba7c44d8a")],
      species: ["Permit", "Bonefish", "Tarpon"],
      featured: false,
      verified: false,
      status: "draft",
      sourceUrl: "https://example.com/reef-house",
      claimable: true,
      destinationSlugs: ["belize"],
    },
  ];

  for (const listing of listings) {
    const { destinationSlugs, ...data } = listing;
    await prisma.listing.create({
      data: {
        ...data,
        destinations: {
          create: destinationSlugs.map((slug) => ({
            destinationId: bySlug[slug],
          })),
        },
      },
    });
  }

  const publishedLodges = await prisma.listing.findMany({
    where: { type: "lodge", status: "published" },
    select: { id: true, slug: true },
  });

  const openingBySlug = Object.fromEntries(publishedLodges.map((l) => [l.slug, l.id]));

  const openings = [
    {
      listingId: openingBySlug["ascension-bay-lodge"],
      startDate: daysFromNow(8),
      endDate: daysFromNow(13),
      notes: "One double room + skiff after a late cancellation. Permit-focused week.",
    },
    {
      listingId: openingBySlug["tradewind-andros-lodge"],
      startDate: daysFromNow(16),
      endDate: daysFromNow(21),
      notes: "Two rooms released. West-side marls program, shared or private skiff.",
    },
    {
      listingId: openingBySlug["venice-marsh-camp"],
      startDate: daysFromNow(5),
      endDate: daysFromNow(8),
      notes: "Three-night camp takeover remnant — two rods, one guide.",
    },
    {
      listingId: openingBySlug["casa-permit-holbox"],
      startDate: daysFromNow(22),
      endDate: daysFromNow(26),
      notes: "Shoulder-season house room. Easy Cancún connection.",
    },
  ].filter((o) => o.listingId);

  await prisma.lastMinuteOpening.createMany({ data: openings });

  await prisma.newsletterSignup.create({
    data: { email: "angler@example.com", name: "Sample Angler" },
  });

  console.log(
    `Seeded ${destinations.length} destinations, ${listings.length} listings, ${openings.length} last-minute openings.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
