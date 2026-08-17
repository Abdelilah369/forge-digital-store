import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { confirmCheckout } from "@/lib/checkout.functions";
import { ForgeSpark } from "@/components/brand/spark";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search) => z.object({ session_id: z.string().optional() }).parse(search),
  head: () => ({
    meta: [
      { title: "Your files are ready — Forge Digital" },
      { name: "description", content: "Payment cleared. Your files are ready to download." },
      { property: "og:title", content: "Your files are ready — Forge Digital" },
      { property: "og:description", content: "Payment cleared, files ready to download." },
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
        <p className="text-muted-foreground">
          There's no payment to check here. Open your files from your account instead.
        </p>
      ) : isPending ? (
        <p className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Checking with the card processor…
        </p>
      ) : error ? (
        <>
          <h1 className="font-display text-2xl font-semibold">That payment didn't come back clear</h1>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
        </>
      ) : data?.paid ? (
        <>
          <ForgeSpark className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
            Paid. {data.products.length} file{data.products.length === 1 ? "" : "s"} ready.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Nothing else to do — the download links are already waiting on your files page.
          </p>
          <Link to="/library" className="mt-8 inline-block">
            <Button size="lg">Download my files</Button>
          </Link>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold">Payment hasn't cleared yet</h1>
          <p className="mt-2 text-muted-foreground">
            The card processor hasn't confirmed it. Give it a few seconds and refresh this page.
          </p>
        </>
      )}
    </div>
  );
}
