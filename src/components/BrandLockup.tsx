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

  return (
    <span className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
      <Image
        src="/brand/icon.svg"
        alt=""
        width={compact ? 48 : 56}
        height={compact ? 48 : 56}
        className={compact ? "h-12 w-12" : "h-14 w-14"}
        unoptimized
        priority={compact}
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={`font-display whitespace-nowrap leading-none tracking-tight ${
            compact ? "text-[1.65rem] md:text-[1.85rem]" : "text-3xl md:text-4xl"
          }`}
        >
          <span className={onDark ? "text-sand" : "text-weathered-teal"}>fish</span>
          <span className={onDark ? "text-cream" : "text-deep-navy"}>the</span>
          <span className={onDark ? "text-sand" : "text-weathered-teal"}>flats.com</span>
        </span>
        {showTagline ? (
          <span
            className={`mt-1.5 text-[0.62rem] uppercase tracking-[0.18em] [word-spacing:0.28em] md:tracking-[0.22em] ${
              onDark ? "text-sand/70" : "text-weathered-teal"
            }`}
          >
            {site.brandTagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}
