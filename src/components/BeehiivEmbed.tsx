import { site } from "@/lib/config";

export function BeehiivEmbed({
  compact = false,
  tone = "navy",
}: {
  compact?: boolean;
  tone?: "navy" | "light";
}) {
  const { publicationUrl, subscribeUrl, embedUrl } = site.beehiiv;
  const onNavy = tone === "navy";

  return (
    <div
      className={`overflow-hidden rounded-xl ${
        onNavy ? "border border-white/15 bg-navy-soft/60" : "border border-navy/10 bg-sand-light"
      }`}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Subscribe to Last-Minute Flats on Beehiiv"
          className="w-full bg-white"
          style={{ minHeight: compact ? 240 : 320, border: 0 }}
        />
      ) : (
        <div className={`${compact ? "p-5" : "p-6"}`}>
          <p
            className={`text-xs uppercase tracking-[0.2em] ${onNavy ? "text-sea" : "text-sea-deep"}`}
          >
            Beehiiv · list of record
          </p>
          <p className={`mt-2 font-display ${compact ? "text-2xl" : "text-3xl"} ${onNavy ? "text-sand-light" : "text-navy"}`}>
            Join Last-Minute Flats
          </p>
          <p className={`mt-2 text-sm leading-6 ${onNavy ? "text-sand/75" : "text-navy-soft"}`}>
            The newsletter lives on Beehiiv. Embed a subscribe form here by setting{" "}
            <code className="text-xs">NEXT_PUBLIC_BEEHIIV_EMBED_URL</code>, or subscribe on the
            publication now.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={subscribeUrl}
              target="_blank"
              rel="noreferrer"
              className={`rounded-full px-4 py-2 text-sm ${
                onNavy
                  ? "bg-sand text-navy hover:bg-white"
                  : "bg-navy text-sand-light hover:bg-navy-soft"
              }`}
            >
              Subscribe on Beehiiv
            </a>
            <a
              href={publicationUrl}
              target="_blank"
              rel="noreferrer"
              className={`text-sm ${onNavy ? "text-sand/80 hover:text-sand" : "text-navy-soft hover:text-navy"}`}
            >
              fishtheflats.beehiiv.com →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
