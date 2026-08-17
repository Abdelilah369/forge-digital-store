import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { ForgeSpark } from "@/components/brand/spark";
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
        meta: [
          { title: "Product unavailable — Forge Digital" },
          { name: "robots", content: "noindex" },
        ],
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
    <div className="mx-auto max-w-2xl px-5 py-32 text-center">
      <ForgeSpark className="mx-auto h-10 w-10 text-primary" />
      <h1 className="display-lg mt-6">That product isn't on the shelf</h1>
      <p className="mt-4 text-muted-foreground">
        It was renamed or taken down. The rest of the catalog is a click away.
      </p>
      <Link to="/products" className="mt-8 inline-block">
        <Button variant="subtle" className="rounded-full">
          Browse every product
        </Button>
      </Link>
    </div>
  );
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { add, has } = useCart();
  const gallery = Array.from(
    new Set([product.cover_url, ...product.preview_urls].filter(Boolean) as string[]),
  );
  const [active, setActive] = useState(0);
  const inCart = has(product.id);

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-14 sm:px-8">
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

      <div className="mt-10 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <Reveal>
          <div className="art-frame group rounded-tl-[3rem] border border-border">
            {gallery[active] ? (
              <img
                src={gallery[active]}
                alt={`${product.title} preview`}
                width={1400}
                height={1050}
                className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center text-muted-foreground">
                No preview available
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Preview ${index + 1}`}
                  className={
                    "art-frame h-16 w-20 rounded-br-lg border-2 transition-colors " +
                    (index === active ? "border-primary" : "border-border")
                  }
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span>{categoryLabel(product.category)}</span>
            {product.is_sample && (
              <span className="rounded-full border border-border px-2 py-0.5">Sample product</span>
            )}
          </div>
          <h1 className="display-lg mt-6">{product.title}</h1>
          <p className="mt-6 text-lg text-muted-foreground">{product.short_description}</p>
          <p className="mt-8 font-display text-5xl tabular-nums">
            {formatPrice(product.price_cents, product.currency)}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={() => {
                  add(product);
                  toast.success(inCart ? "Already in your cart" : `${product.title} added to cart`);
                }}
              >
                {inCart ? <Check /> : <ShoppingBag />}
                {inCart ? "Already in cart" : "Add to cart"}
              </Button>
            </Magnetic>
            <Link
              to="/cart"
              onClick={() => {
                if (!inCart) add(product);
              }}
              className="text-sm font-medium underline decoration-border decoration-2 underline-offset-8 transition-colors hover:decoration-primary"
            >
              Buy it now and download
            </Link>
          </div>

          <div className="mt-12 space-y-4 whitespace-pre-line leading-relaxed text-muted-foreground">
            {product.description}
          </div>

          <p className="mt-10 border-l-2 border-primary bg-surface p-5 text-xs text-muted-foreground">
            Instant download, no shipping. After payment the file shows up on your files page,
            behind a link tied to your purchase — nothing public, nothing emailed as an attachment.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
