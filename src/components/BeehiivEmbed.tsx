import { BeehiivSubscribeForm } from "@/components/BeehiivSubscribeForm";
import { site } from "@/lib/config";

export function BeehiivEmbed({
  compact = false,
  tone = "navy",
}: {
  compact?: boolean;
  tone?: "navy" | "light";
}) {
  const { publicationUrl, subscribeUrl, formId, loaderSrc } = site.beehiiv;
  const onNavy = tone === "navy";

  return (
    <div
      className={`overflow-hidden rounded-xl ${
        onNavy ? "border border-white/15 bg-white" : "border border-navy/10 bg-white"
      }`}
    >
      <div className={`${compact ? "p-4" : "p-5"}`}>
        <p className="text-xs uppercase tracking-[0.2em] text-sea-deep">Beehiiv · list of record</p>
        <p className={`mt-2 font-display text-navy ${compact ? "text-2xl" : "text-3xl"}`}>
          Join Last-Minute Flats
        </p>
        <p className="mt-2 text-sm leading-6 text-navy-soft">
          Subscribe on{" "}
          <a
            href={publicationUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-navy"
          >
            fishtheflats.beehiiv.com
          </a>
          . Trip preferences on this site stay with the desk.
        </p>
        <div className="mt-4">
          <BeehiivSubscribeForm formId={formId} loaderSrc={loaderSrc} />
        </div>
        <p className="mt-3 text-sm">
          <a
            href={subscribeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sea-deep hover:underline"
          >
            Or open the Beehiiv subscribe page →
          </a>
        </p>
      </div>
    </div>
  );
}
