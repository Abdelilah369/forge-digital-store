import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { CATEGORIES } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink text-ink-foreground">
      <div className="mx-auto max-w-[88rem] px-5 pt-24 pb-14 sm:px-8 sm:pt-32">
        <Reveal>
          <div className="grid gap-10 border-b border-ink-foreground/15 pb-16 lg:grid-cols-[1.4fr_auto] lg:items-end">
            <h2 className="display-lg max-w-3xl">
              Find the one tool that makes <em className="italic text-primary">this</em> project
              easier.
            </h2>
            <Magnetic>
              <Link
                to="/products"
                className="inline-flex items-center gap-4 rounded-full bg-primary px-8 py-5 text-base font-medium text-primary-foreground"
              >
                Browse the catalog
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </Magnetic>
          </div>
        </Reveal>

        <div className="grid gap-10 pt-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-base font-semibold text-primary-foreground">
                F
              </span>
              <span className="font-display text-xl">Forge Digital</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              Handcrafted digital tools and assets, made in small batches and sold direct.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="eyebrow text-ink-muted">Catalog</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    to="/products"
                    search={{ category: category.slug }}
                    className="text-sm text-ink-muted transition-colors hover:text-ink-foreground"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-ink-muted">Account</h3>
            <ul className="mt-4 grid gap-2">
              <li>
                <Link
                  to="/library"
                  className="text-sm text-ink-muted transition-colors hover:text-ink-foreground"
                >
                  My downloads
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-ink-muted transition-colors hover:text-ink-foreground"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-sm text-ink-muted transition-colors hover:text-ink-foreground"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-foreground/15 px-5 py-6 text-center text-xs text-ink-muted sm:px-8">
        © {new Date().getFullYear()} Forge Digital. Payments run in Stripe test mode.
      </div>
    </footer>
  );
}
