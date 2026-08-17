import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { categoryLabel, formatPrice, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  size = "sm",
  className,
}: {
  product: Product;
  /** "lg" tiles span two columns in the bento grid and use a wider crop. */
  size?: "sm" | "lg";
  className?: string;
}) {
  const large = size === "lg";

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-shadow duration-500 hover:shadow-lift",
        large && "lg:col-span-2",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-surface",
          large ? "aspect-[16/10]" : "aspect-[4/3]",
        )}
      >
        {product.cover_url ? (
          <img
            src={product.cover_url}
            alt={`${product.title} cover`}
            loading="lazy"
            width={1400}
            height={900}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            No cover yet
          </div>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col gap-3 p-6", large && "sm:p-8")}>
        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span>{categoryLabel(product.category)}</span>
          {product.is_sample && (
            <span className="rounded-full border border-border px-2 py-0.5">Sample</span>
          )}
        </div>

        <h3
          className={cn(
            "font-display leading-[1.05] tracking-tight",
            large ? "text-3xl sm:text-4xl" : "text-2xl",
          )}
        >
          {product.title}
        </h3>

        <p
          className={cn(
            "text-sm text-muted-foreground",
            large ? "max-w-xl line-clamp-3 text-base" : "line-clamp-2",
          )}
        >
          {product.short_description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-semibold tabular-nums">
            {formatPrice(product.price_cents, product.currency)}
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-all duration-500 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
