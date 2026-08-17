import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

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
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {category ? categoryLabel(category) : "The full catalog"}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {category
          ? CATEGORIES.find((c) => c.slug === category)?.blurb
          : "Everything currently for sale, from Notion systems to texture packs."}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterLink label="All" active={!category} />
        {CATEGORIES.map((c) => (
          <FilterLink
            key={c.slug}
            label={c.label}
            slug={c.slug}
            active={category === c.slug}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-muted-foreground">No products in this category yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
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
        "rounded-full border px-4 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
