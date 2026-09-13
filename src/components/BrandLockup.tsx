import Image from "next/image";
import { site } from "@/lib/config";

type BrandLockupProps = {
  tone?: "light" | "dark";
  size?: "header" | "footer";
  showTagline?: boolean;
};

export function BrandLockup({
  tone = "light",
  size = "header",
  showTagline = true,
}: BrandLockupProps) {
  const onDark = tone === "dark";
  const compact = size === "header";

  const tagline = showTagline ? (
    <span
      className={`mt-1.5 text-[0.62rem] uppercase tracking-[0.18em] [word-spacing:0.28em] md:tracking-[0.22em] ${
        onDark ? "text-sand/70" : "text-weathered-teal"
      }`}
    >
      {site.brandTagline}
    </span>
  ) : null;

  if (compact) {
    return (
      <span className="flex items-center gap-3">
        <Image
          src="/brand/icon.png"
          alt=""
          width={512}
          height={512}
          className="h-11 w-11 md:h-12 md:w-12"
          unoptimized
          priority
        />
        <span className="flex min-w-0 flex-col">
          <Image
            src="/brand/wordmark-type.png"
            alt="fishtheflats.com"
            width={1200}
            height={145}
            className="h-6 w-auto sm:h-7 md:h-8"
            unoptimized
            priority
          />
          {tagline}
        </span>
      </span>
    );
  }

  const mark = (
    <Image
      src="/brand/wordmark.png"
      alt="fishtheflats.com"
      width={1400}
      height={868}
      className="h-24 w-auto md:h-28"
      unoptimized
    />
  );

  return (
    <span className="flex min-w-0 flex-col">
      {onDark ? (
        <span className="inline-flex w-fit rounded-2xl bg-cream px-4 py-3">{mark}</span>
      ) : (
        mark
      )}
      {tagline}
    </span>
  );
}
