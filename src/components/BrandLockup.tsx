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

  if (onDark) {
    return (
      <span className="flex min-w-0 flex-col">
        <Image
          src="/brand/wordmark-on-dark.webp"
          alt="fishtheflats.com"
          width={910}
          height={487}
          className={compact ? "h-16 w-auto" : "h-24 w-auto md:h-28"}
          unoptimized
        />
        {showTagline ? (
          <span className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-sand/70 [word-spacing:0.28em] md:tracking-[0.22em]">
            {site.brandTagline}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
      <Image
        src="/brand/icon.webp"
        alt=""
        width={512}
        height={512}
        className={compact ? "h-11 w-11 md:h-12 md:w-12" : "h-14 w-14"}
        unoptimized
        priority={compact}
      />
      <span className="flex min-w-0 flex-col">
        <Image
          src="/brand/wordmark-lockup.webp"
          alt="fishtheflats.com"
          width={1000}
          height={214}
          className={compact ? "h-8 w-auto sm:h-9 md:h-10" : "h-11 w-auto md:h-12"}
          unoptimized
          priority={compact}
        />
        {showTagline ? (
          <span className="mt-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-weathered-teal [word-spacing:0.28em] md:tracking-[0.22em]">
            {site.brandTagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}
