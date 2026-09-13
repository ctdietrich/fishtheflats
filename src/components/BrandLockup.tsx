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
      className={`mt-1 text-[0.58rem] uppercase tracking-[0.16em] [word-spacing:0.24em] md:tracking-[0.2em] ${
        onDark ? "text-sand/70" : "text-weathered-teal"
      }`}
    >
      {site.brandTagline}
    </span>
  ) : null;

  if (compact) {
    return (
      <span className="flex items-center gap-2.5">
        <Image
          src="/brand/icon.png"
          alt=""
          width={512}
          height={512}
          className="h-9 w-9 shrink-0 object-contain md:h-10 md:w-10"
          unoptimized
          priority
        />
        <span className="flex min-w-0 flex-col">
          <Image
            src="/brand/wordmark-type.png"
            alt="fishtheflats.com"
            width={2352}
            height={372}
            className="h-5 w-auto max-w-[11rem] object-contain object-left sm:h-6 sm:max-w-[14rem] md:h-7 md:max-w-[16rem]"
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
      width={2352}
      height={812}
      className="h-16 w-auto max-w-[14rem] object-contain md:h-20 md:max-w-[18rem]"
      unoptimized
    />
  );

  return (
    <span className="flex min-w-0 flex-col">
      {onDark ? (
        <span className="inline-flex w-fit rounded-2xl bg-cream px-3 py-2 md:px-4 md:py-3">{mark}</span>
      ) : (
        mark
      )}
      {tagline}
    </span>
  );
}
