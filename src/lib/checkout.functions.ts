import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const checkoutInput = z.object({
  productIds: z.array(z.string().uuid()).min(1),
  origin: z.string().url(),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => checkoutInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: products, error } = await supabase
      .from("products")
      .select("id, title, short_description, price_cents, currency, cover_url")
      .in("id", data.productIds)
      .eq("published", true);

    if (error) throw new Error(error.message);
    if (!products || products.length === 0) throw new Error("No purchasable products selected.");

    const { stripePost, type: _t } = { stripePost: (await import("./stripe.server")).stripePost };
    void _t;

    const params: Record<string, string | number> = {
      mode: "payment",
      client_reference_id: userId,
      "metadata[product_ids]": products.map((p) => p.id).join(","),
      success_url: `${data.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/cart`,
      "payment_method_types[0]": "card",
    };

    const email = (claims as { email?: string } | undefined)?.email;
    if (email) params["customer_email"] = email;

    products.forEach((product, index) => {
      params[`line_items[${index}][quantity]`] = 1;
      params[`line_items[${index}][price_data][currency]`] = product.currency || "usd";
      params[`line_items[${index}][price_data][unit_amount]`] = product.price_cents;
      params[`line_items[${index}][price_data][product_data][name]`] = product.title;
      if (product.short_description) {
        params[`line_items[${index}][price_data][product_data][description]`] =
          product.short_description.slice(0, 300);
      }
    });

    const session = await stripePost<{ id: string; url?: string }>("/checkout/sessions", params);
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url, id: session.id };
  });

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ sessionId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
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
