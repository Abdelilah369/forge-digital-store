import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/use-session";
import { checkIsAdmin } from "@/lib/admin.functions";

export function SiteHeader() {
  const { items } = useCart();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const adminCheck = useServerFn(checkIsAdmin);

  const { data: admin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => adminCheck({}),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
            F
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Forge Digital</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/products"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            All products
          </Link>
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to="/products"
              search={{ category: category.slug }}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {category.label.split(" & ")[0]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon">
              <ShoppingBag />
            </Button>
            {items.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                {items.length}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link to="/library">
                  <Button variant="ghost" size="sm">
                    Library
                  </Button>
                </Link>
                {admin?.isAdmin && (
                  <Link to="/admin">
                    <Button variant="subtle" size="sm">
                      Seller area
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/products" onClick={() => setOpen(false)} className="py-2 text-sm">
              All products
            </Link>
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to="/products"
                search={{ category: category.slug }}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted-foreground"
              >
                {category.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? (
                <>
                  <Link to="/library" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="subtle" size="sm" className="w-full">
                      Library
                    </Button>
                  </Link>
                  {admin?.isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="flex-1">
                      <Button variant="subtle" size="sm" className="w-full">
                        Seller
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
