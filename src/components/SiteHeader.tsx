import Link from "next/link";
import { site } from "@/lib/config";

const links = [
  { href: "/destinations", label: "Destinations" },
  { href: "/guides", label: "Guides" },
  { href: "/lodges", label: "Lodges" },
  { href: "/last-minute", label: "Last-Minute" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const onDark = tone === "dark";

  return (
    <header
      className={`relative z-20 border-b ${
        onDark ? "border-white/10 text-sand-light" : "border-navy/10 bg-foam text-navy"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight">
          {site.name}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={onDark ? "hover:text-sand" : "text-navy-soft hover:text-sea-deep"}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className={`rounded-full px-3 py-1.5 text-sm ${
              onDark
                ? "bg-sand text-navy hover:bg-white"
                : "bg-navy text-sand-light hover:bg-navy-soft"
            }`}
          >
            List with us
          </Link>
        </nav>
      </div>
    </header>
  );
}
