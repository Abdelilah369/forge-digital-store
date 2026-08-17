import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ProductCard } from "@/components/site/product-card";
import { CATEGORIES, categoryLabel } from "@/lib/catalog";
import { listProducts } from "@/lib/products.functions";
import { ProductGridSkeleton } from "@/components/site/product-skeleton";
import { cn } from "@/lib/utils";
import { ForgeSpark, SparkEmpty } from "@/components/brand/spark";

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
      { title: "Every product — Forge Digital" },
      {
        name: "description",
        content:
          "Templates, printables, courses, small apps and texture packs. Pay once, download in seconds.",
      },
      { property: "og:title", content: "Every product — Forge Digital" },
      {
        property: "og:description",
        content: "Pay once, download in seconds, keep the files forever.",
      },
    ],
  }),
  pendingComponent: ProductsPending,
  component: ProductsPage,
});

function ProductsPending() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      <div className="skeleton h-4 w-28 rounded-full" />
      <div className="skeleton mt-6 h-16 w-full max-w-2xl" />
      <div className="mt-12">
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}

function ProductsPage() {
  const { category } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQuery(category));

  return (
    <div>
      <section className="border-b border-border bg-ink text-ink-foreground">
        <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
          <Reveal y={16}>
            <span className="eyebrow inline-flex items-center gap-2 text-primary">
              <ForgeSpark className="h-3 w-3" ember={false} />
              {products.length} product{products.length === 1 ? "" : "s"}, all made here
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display-lg mt-6 max-w-3xl">
              {category ? categoryLabel(category) : "Everything on the shelf."}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              {category
                ? CATEGORIES.find((c) => c.slug === category)?.blurb
                : "Notion systems, printables, courses, small software and texture packs. Pick one, pay, download it in the next minute."}
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
          <SparkEmpty
            className="mt-16 mb-24"
            title="Nothing on this shelf yet"
            body="This category is still being built. The other three have products ready to download."
          />
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
        "inline-flex min-h-11 items-center rounded-full border px-5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
