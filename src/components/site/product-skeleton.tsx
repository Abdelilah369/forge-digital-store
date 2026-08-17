import { cn } from "@/lib/utils";

/** Placeholder tile that mirrors ProductCard's proportions while data loads. */
export function ProductCardSkeleton({
  size = "sm",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const large = size === "lg";
  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden border border-border bg-card",
        large ? "rounded-tl-[2.5rem]" : "rounded-br-[1.75rem]",
        className,
      )}
      aria-hidden="true"
    >
      <div className={cn("skeleton", large ? "aspect-[16/10]" : "aspect-[4/3]")} />
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-7 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <div className="skeleton h-6 w-16" />
          <div className="skeleton h-11 w-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Bento-rhythm grid of skeleton tiles. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => {
        const large = index % 5 === 0;
        return (
          <div key={index} className={cn("flex", large && "sm:col-span-2 lg:col-span-2")}>
            <ProductCardSkeleton size={large ? "lg" : "sm"} />
          </div>
        );
      })}
    </div>
  );
}
