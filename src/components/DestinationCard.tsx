import Image from "next/image";
import Link from "next/link";

export function DestinationCard({
  slug,
  name,
  region,
  country,
  heroImage,
  count,
}: {
  slug: string;
  name: string;
  region: string;
  country: string;
  heroImage?: string | null;
  count: number;
}) {
  return (
    <Link
      href={`/destinations/${slug}`}
      className="group relative block min-h-56 overflow-hidden rounded-2xl bg-navy"
    >
      {heroImage ? (
        <Image
          src={heroImage}
          alt={name}
          fill
          className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
          sizes="(min-width: 1024px) 25vw, 100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-sand-light">
        <p className="text-xs uppercase tracking-[0.18em] text-sand/80">
          {region}, {country}
        </p>
        <h3 className="font-display text-3xl">{name}</h3>
        <p className="mt-1 text-sm text-sand/80">
          {count} {count === 1 ? "listing" : "listings"}
        </p>
      </div>
    </Link>
  );
}
