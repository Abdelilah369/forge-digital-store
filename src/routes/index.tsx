import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Magnetic } from "@/components/motion/magnetic";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { HeroBackdrop } from "@/components/site/hero-backdrop";
import { CategoryMarquee } from "@/components/site/marquee";
import { ProductCard } from "@/components/site/product-card";
import { CATEGORIES, formatPrice, categoryLabel } from "@/lib/catalog";
import { listProducts } from "@/lib/products.functions";
import { ProductGridSkeleton } from "@/components/site/product-skeleton";
import { cn } from "@/lib/utils";

/** Stable production host — used only for absolute social-share image URLs. */
const SITE_URL = "https://project--69a76b6b-0891-4c75-85e0-5cd4159733bf.lovable.app";

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
      {
        property: "og:image",
        content: `${SITE_URL}/og-image.jpg`,
      },
      { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  pendingComponent: HomePending,
  component: Home,
});

function HomePending() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32">
      <div className="skeleton h-4 w-40 rounded-full" />
      <div className="skeleton mt-8 h-24 w-full max-w-4xl" />
      <div className="skeleton mt-4 h-24 w-full max-w-2xl" />
      <div className="mt-20">
        <ProductGridSkeleton count={3} />
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Browse",
    body: "Move through four tight categories. Every product is made in-house — no resold marketplace filler.",
  },
  {
    title: "Buy",
    body: "Secure Stripe checkout, no account gymnastics. One card, one receipt, done in under a minute.",
  },
  {
    title: "Download",
    body: "Files appear in your library immediately, behind verified purchase links that expire on their own.",
  },
];

function Home() {
  const { data: products } = useSuspenseQuery(featuredQuery);
  const bento = products.slice(0, 6);
  const spotlights = products.slice(0, 2);

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative -mt-20 flex min-h-[88svh] items-end overflow-hidden bg-background pt-32">
        <HeroBackdrop />
        <div className="relative mx-auto w-full max-w-[88rem] px-5 pb-20 sm:px-8 sm:pb-28">
          <Reveal y={16}>
            <span className="eyebrow text-brand-ink">Independent digital workshop</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="display-xl mt-6 max-w-[16em]">
              Handcrafted digital <em className="italic text-brand-ink">tools</em> for people who
              make things.
            </h1>
          </Reveal>
          <div className="mt-10 flex flex-col gap-8 border-t border-border pt-8 lg:flex-row lg:items-center lg:justify-between">
            <Reveal delay={0.16}>
              <p className="max-w-md text-lg text-muted-foreground">
                Templates, courses, software and design assets — sold direct, delivered the second
                you buy.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="flex flex-wrap items-center gap-4">
                <Magnetic>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground"
                  >
                    Browse the catalog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Magnetic>
                <Link
                  to="/products"
                  search={{ category: "templates-printables" }}
                  className="text-sm font-medium underline decoration-border decoration-2 underline-offset-8 transition-colors hover:decoration-primary"
                >
                  Start with templates
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CategoryMarquee />

      {/* ---------------- Bento catalog ---------------- */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="display-lg max-w-xl">Fresh from the forge</h2>
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-brand-ink"
            >
              View the full catalog
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </Reveal>

        {bento.length > 0 && (
          <RevealGroup
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.1}
          >
            {bento.map((product, index) => {
              // Asymmetric rhythm: a wide tile at the head of alternating rows.
              const large = index % 5 === 0 || index % 5 === 4;
              return (
                <RevealItem
                  key={product.id}
                  className={cn("flex", large && "lg:col-span-2 sm:col-span-2")}
                >
                  <ProductCard product={product} size={large ? "lg" : "sm"} className="w-full" />
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </section>

      {/* ---------------- Spotlights ---------------- */}
      {spotlights.map((product, index) => (
        <section
          key={product.id}
          className={cn(
            "overflow-hidden",
            index % 2 === 0 ? "bg-ink text-ink-foreground" : "bg-surface",
          )}
        >
          <div className="mx-auto grid max-w-[88rem] items-center gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:gap-20">
            <Reveal className={cn(index % 2 === 1 && "lg:order-2")}>
              <div className="art-frame group rounded-tl-[3rem]">
                {product.cover_url ? (
                  <img
                    src={product.cover_url}
                    alt={`${product.title} cover`}
                    loading="lazy"
                    width={1400}
                    height={1000}
                    className="aspect-[5/4] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                ) : (
                  <div className="grid aspect-[5/4] place-items-center bg-muted text-sm">
                    No cover yet
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <span
                className={cn(
                  "eyebrow",
                  index % 2 === 0 ? "text-primary" : "text-brand-ink",
                )}
              >
                {index === 0 ? "Bestseller" : "Also worth your time"} — {categoryLabel(product.category)}
              </span>
              <h2 className="display-lg mt-5">{product.title}</h2>
              <p
                className={cn(
                  "mt-6 max-w-lg text-lg",
                  index % 2 === 0 ? "text-ink-muted" : "text-muted-foreground",
                )}
              >
                {product.short_description}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <span className="font-display text-4xl tabular-nums">
                  {formatPrice(product.price_cents, product.currency)}
                </span>
                <Magnetic>
                  <Link
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-base font-medium text-primary-foreground"
                  >
                    View product
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* ---------------- Categories ---------------- */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <h2 className="display-lg max-w-2xl">Four categories, nothing filler.</h2>
        </Reveal>
        <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <RevealItem key={category.slug} className="bg-background">
              <Link
                to="/products"
                search={{ category: category.slug }}
                className="group flex h-full flex-col justify-between gap-8 bg-background p-8 transition-colors hover:bg-surface sm:p-12"
              >
                <div>
                  <h3 className="font-display text-3xl leading-tight sm:text-4xl">
                    {category.label}
                  </h3>
                  <p className="mt-4 max-w-sm text-muted-foreground">{category.blurb}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-ink">
                  Explore
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ---------------- Pull quote ---------------- */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32">
          <Reveal className="grid gap-10 lg:grid-cols-12">
            <span className="eyebrow text-muted-foreground lg:col-span-3">From the workshop</span>
            <blockquote className="lg:col-span-9">
              <p className="pull-quote max-w-4xl">
                “A good template should feel like it was made for one person, then quietly shared
                with everyone else.”
              </p>
              <footer className="mt-10 text-sm text-muted-foreground">
                Abdelilah Karroumi — founder, Forge Digital
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-36">
          <Reveal>
            <span className="eyebrow text-primary">How it works</span>
            <h2 className="display-lg mt-6 max-w-2xl">
              Browse, buy, download — <em className="italic">instantly</em>.
            </h2>
          </Reveal>

          <RevealGroup className="mt-20 grid gap-16 lg:grid-cols-3 lg:gap-12" stagger={0.14}>
            {STEPS.map((step, index) => (
              <RevealItem key={step.title}>
                <div className="border-t border-ink-foreground/20 pt-8">
                  <span className="font-display text-6xl text-primary sm:text-7xl">
                    0{index + 1}
                  </span>
                  <h3 className="mt-8 font-display text-3xl">{step.title}</h3>
                  <p className="mt-4 max-w-sm text-ink-muted">{step.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------- Stats band ---------------- */}
      <section className="border-b border-border bg-surface">
        <RevealGroup
          className="mx-auto grid max-w-[88rem] gap-12 px-5 py-20 sm:grid-cols-2 sm:px-8 sm:py-28 lg:grid-cols-4"
          stagger={0.12}
        >
          {[
            { to: 500, suffix: "+", label: "Creators in the workshop" },
            { to: 10000, suffix: "+", label: "Files downloaded" },
            { to: 4, suffix: ".9", label: "Average product rating" },
            { to: 12, suffix: " yrs", label: "Making tools for makers" },
          ].map((stat) => (
            <RevealItem key={stat.label}>
              <CountUp
                to={stat.to}
                suffix={stat.suffix}
                className="block font-display text-6xl tracking-tight tabular-nums sm:text-7xl"
              />
              <p className="mt-4 text-sm text-muted-foreground">{stat.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </div>
  );
}
