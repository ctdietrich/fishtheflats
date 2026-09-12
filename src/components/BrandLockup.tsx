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
          className="h-auto w-[240px] max-w-full md:w-[300px]"
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
    <span className={`flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
      <Image
        src="/brand/icon.webp"
        alt=""
        width={512}
        height={512}
        className={compact ? "h-10 w-10 md:h-11 md:w-11" : "h-12 w-12"}
        unoptimized
        priority={compact}
      />
      <span className="flex min-w-0 flex-col">
        <Image
          src="/brand/wordmark-type.webp"
          alt="fishtheflats.com"
          width={525}
          height={80}
          className={compact ? "h-6 w-auto md:h-7" : "h-8 w-auto"}
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
