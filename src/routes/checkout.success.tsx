import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { confirmCheckout } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search) => z.object({ session_id: z.string().optional() }).parse(search),
  head: () => ({
    meta: [
      { title: "Purchase complete — Forge Digital" },
      { name: "description", content: "Your Forge Digital downloads are ready." },
      { property: "og:title", content: "Purchase complete — Forge Digital" },
      { property: "og:description", content: "Your downloads are ready." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  const { session_id: sessionId } = Route.useSearch();
  const { clear } = useCart();
  const confirm = useServerFn(confirmCheckout);

  const { data, isPending, error } = useQuery({
    queryKey: ["checkout-confirm", sessionId],
    queryFn: () => confirm({ data: { sessionId: sessionId! } }),
    enabled: Boolean(sessionId),
    retry: 2,
  });

  useEffect(() => {
    if (data?.paid) clear();
  }, [data?.paid, clear]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      {!sessionId ? (
        <p className="text-muted-foreground">No checkout session to confirm.</p>
      ) : isPending ? (
        <p className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Confirming your payment…
        </p>
      ) : error ? (
        <>
          <h1 className="font-display text-2xl font-semibold">We couldn't confirm that payment</h1>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
        </>
      ) : data?.paid ? (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-accent-foreground" />
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Thank you!</h1>
          <p className="mt-3 text-muted-foreground">
            {data.products.length} item{data.products.length === 1 ? "" : "s"} unlocked. Your files
            are waiting in your library.
          </p>
          <Link to="/library" className="mt-8 inline-block">
            <Button size="lg">Go to my downloads</Button>
          </Link>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold">Payment not completed yet</h1>
          <p className="mt-2 text-muted-foreground">
            Stripe hasn't marked this session as paid. Refresh in a moment.
          </p>
        </>
      )}
    </div>
  );
}
