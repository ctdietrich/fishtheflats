"use client";

import { useEffect, useRef } from "react";

export function BeehiivSubscribeForm({
  formId,
  loaderSrc,
}: {
  formId: string;
  loaderSrc: string;
}) {
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = slot.current;
    if (!host || !formId) return;

    host.replaceChildren();

    const script = document.createElement("script");
    script.src = loaderSrc;
    script.async = true;
    script.setAttribute("data-beehiiv-form", formId);
    host.appendChild(script);

    return () => {
      host.replaceChildren();
    };
  }, [formId, loaderSrc]);

  return <div ref={slot} className="beehiiv-embed min-h-[240px] w-full" />;
}
