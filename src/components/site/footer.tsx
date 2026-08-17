import { Link } from "@tanstack/react-router";

import { CATEGORIES } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
              F
            </span>
            <span className="font-display text-base font-semibold">Forge Digital</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Handcrafted digital tools and assets, made in small batches and sold direct.
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold">Catalog</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  to="/products"
                  search={{ category: category.slug }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Account</h3>
          <ul className="mt-3 grid gap-2">
            <li>
              <Link to="/library" className="text-sm text-muted-foreground hover:text-foreground">
                My downloads
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-sm text-muted-foreground hover:text-foreground">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Forge Digital. Payments run in Stripe test mode.
      </div>
    </footer>
  );
}
