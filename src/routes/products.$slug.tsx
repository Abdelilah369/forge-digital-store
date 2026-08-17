import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabel, formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { getProduct } from "@/lib/products.functions";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const product = await getProduct({ data: { slug } });
      if (!product) throw notFound();
      return product;
    },
  });

export const Route = createFileRoute("/products/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — Forge Digital" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} — Forge Digital`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.short_description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.short_description },
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: ProductMissing,
});

function ProductMissing() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">We couldn't find that product</h1>
      <p className="mt-2 text-muted-foreground">It may have been unpublished or renamed.</p>
      <Link to="/products" className="mt-6 inline-block">
        <Button variant="subtle">Back to catalog</Button>
      </Link>
    </div>
  );
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { addItem, has } = useCart();
  const gallery = [product.cover_url, ...product.preview_urls].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const inCart = has(product.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <nav className="text-sm text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">
          Catalog
        </Link>
        <span className="mx-2">/</span>
        <Link
          to="/products"
          search={{ category: product.category }}
          className="hover:text-foreground"
        >
          {categoryLabel(product.category)}
        </Link>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {gallery[active] ? (
              <img
                src={gallery[active]}
                alt={`${product.title} preview`}
                width={1200}
                height={900}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center text-muted-foreground">
                No preview available
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Preview ${index + 1}`}
                  className={
                    "h-16 w-20 overflow-hidden rounded-md border-2 transition-colors " +
                    (index === active ? "border-primary" : "border-border")
                  }
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{categoryLabel(product.category)}</Badge>
            {product.is_sample && <Badge variant="outline">Sample product</Badge>}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">{product.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{product.short_description}</p>
          <p className="mt-6 font-display text-3xl font-semibold">
            {formatPrice(product.price_cents, product.currency)}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                addItem(product);
                toast.success(inCart ? "Already in your cart" : `${product.title} added to cart`);
              }}
            >
              {inCart ? <Check /> : <ShoppingBag />}
              {inCart ? "In cart" : "Add to cart"}
            </Button>
            <Link
              to="/cart"
              onClick={() => {
                if (!inCart) addItem(product);
              }}
            >
              <Button variant="subtle" size="lg">
                Buy now
              </Button>
            </Link>
          </div>

          <div className="mt-10 space-y-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </div>

          <p className="mt-8 rounded-lg border border-border bg-surface p-4 text-xs text-muted-foreground">
            Digital download. After checkout your files appear in your library, gated behind
            purchase verification — no public links.
          </p>
        </div>
      </div>
    </div>
  );
}
