import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  const parts = header.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=");
    if (!key || !value) return acc;
    (acc[key.trim()] ??= []).push(value.trim());
    return acc;
  }, {});

  const timestamp = parts["t"]?.[0];
  const signatures = parts["v1"] ?? [];
  if (!timestamp || signatures.length === 0) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return signatures.some((signature) => {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        const signature = request.headers.get("stripe-signature");
        const payload = await request.text();

        if (!secret) {
          console.warn("[Stripe Webhook] Webhook secret not configured. Returning 200 for local development stability.");
          return new Response(JSON.stringify({ warning: "Webhook secret not configured" }), { 
            status: 200, 
            headers: { "content-type": "application/json" } 
          });
        }
        
        if (!signature || !verifyStripeSignature(payload, signature, secret)) {
          console.error("[Stripe Webhook] Invalid signature");
          return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(payload) as {
          type: string;
          data: { object: Record<string, unknown> };
        };

        if (event.type === "checkout.session.completed") {
          const { fulfillSession } = await import("@/lib/fulfillment.server");
          type Session = import("@/lib/stripe.server").StripeCheckoutSession;
          try {
            const result = await fulfillSession(event.data.object as unknown as Session);
            console.log("[Stripe Webhook] Fulfillment result:", result);
          } catch (err) {
            console.error("[Stripe Webhook] Fulfillment error:", err);
            return new Response(
              JSON.stringify({ error: err instanceof Error ? err.message : "Fulfillment failed" }),
              { status: 500, headers: { "content-type": "application/json" } }
            );
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
