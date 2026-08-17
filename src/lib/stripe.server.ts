const STRIPE_API = "https://api.stripe.com/v1";

export function getStripeKey(): string {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) {
    throw new Error(
      "Stripe is not connected yet. Add STRIPE_SECRET_KEY (your test-mode secret key) in Project Settings → Secrets.",
    );
  }
  return key;
}

function encode(params: Record<string, string | number | undefined>): string {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) body.append(key, String(value));
  }
  return body.toString();
}

export async function stripePost<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getStripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encode(params),
  });
  const json = (await response.json()) as { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(json.error?.message ?? "Stripe request failed");
  }
  return json as T;
}

export async function stripeGet<T>(path: string): Promise<T> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${getStripeKey()}` },
  });
  const json = (await response.json()) as { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(json.error?.message ?? "Stripe request failed");
  }
  return json as T;
}

export type StripeCheckoutSession = {
  id: string;
  url?: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  client_reference_id: string | null;
  metadata?: Record<string, string>;
};
