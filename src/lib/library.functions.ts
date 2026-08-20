import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LibraryItem = {
  product_id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  category: string;
  file_name: string | null;
  has_file: boolean;
  purchased_at: string;
};

export const listMyLibrary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LibraryItem[]> => {
    const { data: purchases, error } = await context.supabase
      .from("purchases")
      .select("product_id, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!purchases?.length) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, slug, title, cover_url, category, file_path, file_name")
      .in(
        "id",
        purchases.map((p) => p.product_id),
      );

    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    return purchases.flatMap((purchase) => {
      const product = byId.get(purchase.product_id);
      if (!product) return [];
      return [
        {
          product_id: product.id,
          title: product.title,
          slug: product.slug,
          cover_url: product.cover_url,
          category: product.category,
          file_name: product.file_name,
          has_file: Boolean(product.file_path),
          purchased_at: purchase.created_at,
        },
      ];
    });
  });

export const createDownloadLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ productId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    // Entitlement check runs as the signed-in user, under RLS.
    const { data: purchase, error } = await context.supabase
      .from("purchases")
      .select("id")
      .eq("product_id", data.productId)
      .maybeSingle();

    if (error) {
      console.error("[createDownloadLink] Database error:", error);
      throw new Error("Could not verify ownership.");
    }
    
    if (!purchase) {
      // In development, we might not have the purchase record yet if Stripe secrets aren't set
      // but let's be strict for now as that's what the user asked to resolve.
      throw new Error("You don't own this product yet.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("file_path, file_name")
      .eq("id", data.productId)
      .maybeSingle();

    if (!product?.file_path) throw new Error("No downloadable file has been attached yet.");

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("product-files")
      .createSignedUrl(product.file_path, 300, {
        download: product.file_name ?? true,
      });
    if (signError || !signed) throw new Error(signError?.message ?? "Could not create a link.");

    return { url: signed.signedUrl, expiresInSeconds: 300 };
  });
