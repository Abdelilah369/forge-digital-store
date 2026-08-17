import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { categoryLabel, formatPrice, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="aspect-[4/3] overflow-hidden bg-surface">
        {product.cover_url ? (
          <img
            src={product.cover_url}
            alt={`${product.title} cover`}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            No cover yet
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categoryLabel(product.category)}</Badge>
          {product.is_sample && <Badge variant="outline">Sample</Badge>}
        </div>
        <h3 className="font-display text-base font-semibold leading-snug">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        <div className="mt-auto pt-2 text-sm font-semibold">
          {formatPrice(product.price_cents, product.currency)}
        </div>
      </div>
    </Link>
  );
}
