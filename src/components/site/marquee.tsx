import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ForgeSpark } from "@/components/brand/spark";

/** Infinite horizontal ticker of category names. Pure CSS, reduced-motion safe. */
export function CategoryMarquee({ className }: { className?: string }) {
  const words = CATEGORIES.map((c) => c.label.split(" & ")[0]);
  const strip = [...words, ...words, ...words, ...words];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-border/60 bg-ink py-6 text-ink-foreground select-none",
        className,
      )}
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {strip.map((word, index) => (
          <span key={`${word}-${index}`} className="flex items-center gap-10">
            <span className="font-display text-3xl italic tracking-tight sm:text-5xl">{word}</span>
            <ForgeSpark className="h-4 w-4 text-primary sm:h-5 sm:w-5" ember={false} />
          </span>
        ))}
      </div>
    </div>
  );
}
