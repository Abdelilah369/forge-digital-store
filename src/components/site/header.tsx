import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/use-session";
import { checkIsAdmin } from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { items } = useCart();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const adminCheck = useServerFn(checkIsAdmin);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { scrollY } = useScroll();
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = lastY.current;
    lastY.current = y;
    setSolid(y > 80);
    if (open) return;
    setHidden(y > 160 && y > previous);
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const overHero = pathname === "/" && !solid;

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
    <motion.header
      initial={false}
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid || open
          ? "border-b border-border bg-background"
          : "border-b border-transparent bg-transparent",
      )}

    >
      <div className="mx-auto flex h-20 max-w-[88rem] items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-display text-base font-semibold text-primary-foreground">
            F
          </span>
          <span className="truncate font-display text-xl tracking-tight">Forge Digital</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            to="/products"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Catalog
          </Link>
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to="/products"
              search={{ category: category.slug }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {category.label.split(" & ")[0]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full">
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
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Library
                  </Button>
                </Link>
                {admin?.isAdmin && (
                  <Link to="/admin">
                    <Button variant="subtle" size="sm" className="rounded-full">
                      Seller area
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-full">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="h-[calc(100svh-5rem)] overflow-y-auto border-t border-border bg-background px-5 pb-10 pt-6 lg:hidden">
          <span className="eyebrow text-muted-foreground">Catalog</span>
          <div className="mt-4 flex flex-col">
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center border-b border-border font-display text-3xl tracking-tight"
            >
              Everything
            </Link>
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to="/products"
                search={{ category: category.slug }}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center border-b border-border font-display text-3xl tracking-tight"
              >
                {category.label.split(" & ")[0]}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {user ? (
              <>
                <Link to="/library" onClick={() => setOpen(false)}>
                  <Button variant="subtle" size="lg" className="w-full rounded-full">
                    My library
                  </Button>
                </Link>
                {admin?.isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    <Button variant="subtle" size="lg" className="w-full rounded-full">
                      Seller area
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full"
                  onClick={signOut}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button size="lg" className="w-full rounded-full">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}


      {/* keeps the hero readable while the bar is transparent */}
      {overHero && (
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/60 to-transparent" />
      )}
    </motion.header>
  );
}
