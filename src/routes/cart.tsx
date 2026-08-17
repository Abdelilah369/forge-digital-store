import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { createCheckoutSession } from "@/lib/checkout.functions";
import { useSession } from "@/lib/use-session";
import { SparkEmpty } from "@/components/brand/spark";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Forge Digital" },
      { name: "description", content: "Check your files and pay by card. Downloads unlock the moment payment clears." },
      { property: "og:title", content: "Your cart — Forge Digital" },
      { property: "og:description", content: "Pay by card, download straight after." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, totalCents } = useCart();
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const startCheckout = useServerFn(createCheckoutSession);
  const [pending, setPending] = useState(false);

  async function checkout() {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/cart" } });
      return;
    }
    setPending(true);
    try {
      const { url } = await startCheckout({
        data: { productIds: items.map((i) => i.id), origin: window.location.origin },
      });
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight">Your cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pay by card and the files unlock on the next screen.
      </p>

      {items.length === 0 ? (
        <SparkEmpty
          className="mt-10"
          title="Nothing in the cart yet"
          body="Add a template, course or asset pack and it shows up here."
          action={
            <Link to="/products">
              <Button>Browse every product</Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-10 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="h-16 w-20 overflow-hidden rounded-md bg-surface">
                {item.cover_url && (
                  <img src={item.cover_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to="/products/$slug"
                  params={{ slug: item.slug }}
                  className="font-medium hover:underline"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground">Digital download</p>
              </div>
              <span className="font-semibold">{formatPrice(item.price_cents, item.currency)}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.title}`}
                onClick={() => remove(item.id)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
            <Button
              size="lg"
              className="mt-6 w-full"
              disabled={pending || loading}
              onClick={checkout}
            >
              {pending && <Loader2 className="animate-spin" />}
              {user ? `Pay ${formatPrice(totalCents)} by card` : "Sign in, then pay by card"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Test mode: pay with 4242 4242 4242 4242 and any future expiry date.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
