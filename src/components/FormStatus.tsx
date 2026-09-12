"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/app/actions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  className,
  submitLabel = "Submit",
  variant = "navy",
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
  variant?: "navy" | "sand";
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const buttonClass =
    variant === "sand"
      ? "rounded-full bg-sand px-5 py-2.5 text-sm text-navy hover:bg-white disabled:opacity-60"
      : "rounded-full bg-navy px-5 py-2.5 text-sm text-sand-light hover:bg-navy-soft disabled:opacity-60";

  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error ? (
        <p className={variant === "sand" ? "text-sm text-sand" : "text-sm text-red-700"}>
          {state.error}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className={variant === "sand" ? "text-sm text-sea" : "text-sm text-sea-deep"}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
