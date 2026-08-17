import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Forge Digital brand motif — a four-point spark struck off an anvil, with a
 * trailing ember. Used as the logo mark, section divider, list bullet and
 * empty-state character so the brand reads consistently instead of relying on
 * stock icons.
 */
export function ForgeSpark({
  className,
  ember = true,
}: {
  className?: string;
  ember?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
    >
      <path
        d="M12 0.8 14.35 9.65 23.2 12 14.35 14.35 12 23.2 9.65 14.35 0.8 12 9.65 9.65Z"
        fill="currentColor"
      />
      {ember && <circle cx="19.6" cy="4.4" r="1.7" fill="currentColor" opacity="0.55" />}
    </svg>
  );
}

/** Logo badge: the spark inside the accent disc. */
export function SparkMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground",
        className,
      )}
    >
      <ForgeSpark className="h-4.5 w-4.5" />
    </span>
  );
}

/** Rule with the motif struck through the middle. */
export function SparkDivider({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "ink";
}) {
  const line = tone === "ink" ? "bg-ink-foreground/20" : "bg-border";
  return (
    <div className={cn("flex items-center gap-4", className)} aria-hidden="true">
      <span className={cn("h-px flex-1", line)} />
      <ForgeSpark className="h-3.5 w-3.5 text-primary" ember={false} />
      <span className={cn("h-px flex-1", line)} />
    </div>
  );
}

/** Empty state built around the motif rather than a generic icon. */
export function SparkEmpty({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-border bg-card px-8 py-14 text-center rounded-tl-[2rem] rounded-br-[2rem]",
        className,
      )}
    >
      <span className="relative mx-auto grid h-14 w-14 place-items-center">
        <ForgeSpark className="h-10 w-10 text-primary" />
        <ForgeSpark className="absolute -right-1 -top-1 h-3.5 w-3.5 text-primary/50" ember={false} />
      </span>
      <h2 className="mt-6 font-display text-2xl tracking-tight">{title}</h2>
      {body && <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}
