import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { StripeCheckoutSession } from "./stripe.server";

/**
 * Grants download entitlements for a paid Stripe Checkout session.
 * Idempotent: safe to run from both the webhook and the success page.
 */
export async function fulfillSession(session: any) {
  if (session.payment_status !== "paid") {
    return { fulfilled: false as const, reason: "unpaid" };
  }

  const userId = session.client_reference_id;
  const metadata = session.metadata || {};
  const productIds = (metadata.product_ids || metadata["product_ids"] || "")
    .split(",")
    .map((id: string) => id.trim())
    .filter(Boolean);

  if (!userId || productIds.length === 0) {
    return { fulfilled: false as const, reason: "missing_metadata" };
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .upsert(
      {
        user_id: userId,
        stripe_session_id: session.id,
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: "paid",
      },
      { onConflict: "stripe_session_id" },
    )
    .select("id")
    .maybeSingle();

  if (orderError) {
    console.error("[Fulfillment] Order upsert error:", orderError);
    throw new Error(`Failed to record order: ${orderError.message}`);
  }

  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, price_cents")
    .in("id", productIds);

  if (order && products?.length) {
    const { data: existingItems } = await supabaseAdmin
      .from("order_items")
      .select("product_id")
      .eq("order_id", order.id);
    const already = new Set((existingItems ?? []).map((i) => i.product_id));

    const newItems = products
      .filter((p) => !already.has(p.id))
      .map((p) => ({
        order_id: order.id,
        product_id: p.id,
        unit_price_cents: p.price_cents,
      }));
    if (newItems.length > 0) {
      await supabaseAdmin.from("order_items").insert(newItems);
    }
  }

  const { error: purchaseError } = await supabaseAdmin.from("purchases").upsert(
    productIds.map((productId: string) => ({
      user_id: userId,
      product_id: productId,
      order_id: order?.id ?? null,
    })),
    { onConflict: "user_id,product_id", ignoreDuplicates: true },
  );

  if (purchaseError) {
    console.error("[Fulfillment] Purchase upsert error:", purchaseError);
    throw new Error(`Failed to grant purchases: ${purchaseError.message}`);
  }

  return { fulfilled: true as const, productIds };
}
