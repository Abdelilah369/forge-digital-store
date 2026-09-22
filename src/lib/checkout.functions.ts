import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const checkoutInput = z.object({
  productIds: z.array(z.string().uuid()).min(1),
  origin: z.string().url(),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => checkoutInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: products } = await supabase
      .from("products")
      .select("id, title, short_description, price_cents, currency, cover_url")
      .in("id", data.productIds)
      .eq("published", true);

    const targetProducts = products ?? [];
    if (targetProducts.length === 0) {
      throw new Error("None of the selected items are available for purchase anymore.");
    }

    const { isStripeConfigured, stripePost } = await import("./stripe.server");

    if (!isStripeConfigured()) {
      // No Stripe secret key in this environment (local/preview) — issue an
      // instant simulated checkout so the rest of the storefront flow stays
      // testable end-to-end without real payment credentials.
      console.warn(
        "[Checkout] STRIPE_SECRET_KEY is not set — issuing a simulated checkout session instead of a real one.",
      );
      return {
        url: `${data.origin}/checkout/success?session_id=demo_session_${Date.now()}`,
        id: "demo_session",
      };
    }

    const params: Record<string, string | number> = {
      mode: "payment",
      client_reference_id: userId,
      "metadata[product_ids]": targetProducts.map((p) => p.id).join(","),
      success_url: `${data.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/cart`,
      "payment_method_types[0]": "card",
    };

    const email = (claims as { email?: string } | undefined)?.email;
    if (email) params["customer_email"] = email;

    targetProducts.forEach((product, index) => {
      params[`line_items[${index}][quantity]`] = 1;
      params[`line_items[${index}][price_data][currency]`] = product.currency || "usd";
      params[`line_items[${index}][price_data][unit_amount]`] = product.price_cents;
      params[`line_items[${index}][price_data][product_data][name]`] = product.title;
      if (product.short_description) {
        params[`line_items[${index}][price_data][product_data][description]`] =
          product.short_description.slice(0, 300);
      }
    });

    // Real Stripe errors (bad request, network failure, declined config, etc.)
    // must propagate to the customer as a real failure — never silently
    // succeed. The cart page already surfaces thrown errors via a toast.
    const session = await stripePost<{ id: string; url?: string }>("/checkout/sessions", params);
    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL. Please try again.");
    }
    return { url: session.url, id: session.id };
  });

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ sessionId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    if (data.sessionId.startsWith("demo_session")) {
      const { SAMPLE_PRODUCTS } = await import("./catalog");
      return { paid: true as const, products: SAMPLE_PRODUCTS.slice(0, 2) };
    }

    // Real Stripe session: verify ownership and payment status against
    // Stripe/Supabase directly. Any failure here (network error, ownership
    // mismatch, fulfillment error) must surface as a real error to the
    // customer rather than being papered over with a fake "paid" result —
    // faking success would grant free product access on any transient error.
    const { stripeGet } = await import("./stripe.server");
    const { fulfillSession } = await import("./fulfillment.server");
    type Session = import("./stripe.server").StripeCheckoutSession;

    const session = await stripeGet<Session>(`/checkout/sessions/${data.sessionId}`);
    if (session.client_reference_id !== context.userId) {
      throw new Error("This order belongs to a different account.");
    }

    const result = await fulfillSession(session);
    if (!result.fulfilled) {
      return { paid: false as const, products: [] };
    }

    const { data: products } = await context.supabase
      .from("products")
      .select("id, slug, title, cover_url")
      .in("id", result.productIds);

    return { paid: true as const, products: products ?? [] };
  });
