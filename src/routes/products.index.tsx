import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ProductCard } from "@/components/site/product-card";
import { CATEGORIES, categoryLabel } from "@/lib/catalog";
import { listProducts } from "@/lib/products.functions";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ category: z.string().optional() });

const productsQuery = (category?: string) =>
  queryOptions({
    queryKey: ["products", category ?? "all"],
    queryFn: () => listProducts({ data: category ? { category } : {} }),
  });

export const Route = createFileRoute("/products/")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(productsQuery(deps.category)),
  head: () => ({
    meta: [
      { title: "Digital product catalog — Forge Digital" },
      {
        name: "description",
        content:
          "Browse Forge Digital templates, printables, courses, ebooks, apps and creative assets.",
      },
      { property: "og:title", content: "Digital product catalog — Forge Digital" },
      {
        property: "og:description",
        content: "Templates, courses, apps and creative assets from an independent workshop.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { category } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQuery(category));

  return (
    <div>
      <section className="border-b border-border bg-ink text-ink-foreground">
        <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
          <Reveal y={16}>
            <span className="eyebrow text-primary">Catalog</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display-lg mt-6 max-w-3xl">
              {category ? categoryLabel(category) : "Everything we've forged."}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              {category
                ? CATEGORIES.find((c) => c.slug === category)?.blurb
                : "Notion systems, printables, courses, small software and texture packs — all made in-house."}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[88rem] px-5 py-14 sm:px-8">
        <div className="flex flex-wrap gap-2">
          <FilterLink label="All" active={!category} />
          {CATEGORIES.map((c) => (
            <FilterLink key={c.slug} label={c.label} slug={c.slug} active={category === c.slug} />
          ))}
        </div>

        {products.length === 0 ? (
          <p className="mt-20 text-muted-foreground">No products in this category yet.</p>
        ) : (
          <RevealGroup className="mt-12 grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3" stagger={0.09}>
            {products.map((product, index) => {
              const large = index % 5 === 0;
              return (
                <RevealItem
                  key={product.id}
                  className={cn("flex", large && "sm:col-span-2 lg:col-span-2")}
                >
                  <ProductCard product={product} size={large ? "lg" : "sm"} className="w-full" />
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}

function FilterLink({
  label,
  slug,
  active,
}: {
  label: string;
  slug?: string;
  active: boolean;
}) {
  return (
    <Link
      to="/products"
      search={slug ? { category: slug } : {}}
      className={cn(
        "rounded-full border px-5 py-2 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
