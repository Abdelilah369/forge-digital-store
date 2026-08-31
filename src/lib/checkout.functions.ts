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

    const { data: products, error } = await supabase
      .from("products")
      .select("id, title, short_description, price_cents, currency, cover_url")
      .in("id", data.productIds)
      .eq("published", true);

    if (error) throw new Error(error.message);
    if (!products || products.length === 0) throw new Error("No purchasable products selected.");

    const { stripePost } = await import("./stripe.server");

    const params: Record<string, string | number> = {
      mode: "payment",
      client_reference_id: userId,
      "metadata[product_ids]": products.map((p) => p.id).join(","),
