import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { ArrowRight, Download, ShieldCheck, Sparkles } from "lucide-react";

import heroAsset from "@/assets/hero.jpg.asset.json";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalog";
import { listProducts } from "@/lib/products.functions";

const featuredQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(featuredQuery),
  head: () => ({
    meta: [
      { title: "Forge Digital — Handcrafted digital tools & assets" },
      {
        name: "description",
        content:
          "Templates, courses, apps and design assets built in small batches and delivered instantly.",
      },
      { property: "og:title", content: "Forge Digital — Handcrafted digital tools & assets" },
      {
        property: "og:description",
        content: "Templates, courses, apps and design assets, delivered instantly.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products } = useSuspenseQuery(featuredQuery);
  const featured = products.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroAsset.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
              Independent digital workshop
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Handcrafted digital tools &amp; assets, forged for people who make things.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Every template, course, app and asset here is built in-house, sold direct, and
              delivered to your library the moment you buy.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg">
                  Browse the catalog
                  <ArrowRight />
                </Button>
              </Link>
              <Link to="/products" search={{ category: "templates-printables" }}>
                <Button variant="subtle" size="lg">
                  Start with templates
                </Button>
              </Link>
            </div>

            <dl className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Download, term: "Instant delivery", desc: "Files land in your library." },
                { icon: ShieldCheck, term: "Gated downloads", desc: "Verified purchases only." },
                { icon: Sparkles, term: "Made in-house", desc: "No resold marketplace filler." },
              ].map(({ icon: Icon, term, desc }) => (
                <div key={term}>
                  <dt className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-accent-foreground" />
                    {term}
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Shop by category
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to="/products"
              search={{ category: category.slug }}
              className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <h3 className="font-display text-base font-semibold">{category.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{category.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-foreground">
                Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Fresh from the forge
            </h2>
            <Link
              to="/products"
              className="text-sm font-medium text-accent-foreground hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
