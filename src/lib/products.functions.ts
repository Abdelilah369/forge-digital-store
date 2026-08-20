import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { type Product, SAMPLE_PRODUCTS } from "./catalog";

const listInput = z.object({ category: z.string().optional() });

export const listProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) => listInput.parse(data ?? {}))
  .handler(async ({ data }): Promise<Product[]> => {
    try {
      const { createPublicServerClient, PUBLIC_PRODUCT_COLUMNS } = await import(
        "./supabase-public.server"
      );
      const supabase = createPublicServerClient();

      let query = supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("published", true)
        .order("created_at", { ascending: true });

      if (data.category) query = query.eq("category", data.category);

      const { data: rows, error } = await query;
      if (!error && rows && rows.length > 0) {
        return rows as unknown as Product[];
      }
    } catch {
      // Fallback gracefully to rich sample catalog
    }

    let products = SAMPLE_PRODUCTS;
    if (data.category) {
      products = products.filter((p) => p.category === data.category);
    }
    return products;
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<Product | null> => {
    try {
      const { createPublicServerClient, PUBLIC_PRODUCT_COLUMNS } = await import(
        "./supabase-public.server"
      );
      const supabase = createPublicServerClient();

      const { data: row, error } = await supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("slug", data.slug)
        .eq("published", true)
        .maybeSingle();

      if (!error && row) {
        return row as unknown as Product;
      }
    } catch {
      // Fallback gracefully
    }

    const fallback = SAMPLE_PRODUCTS.find((p) => p.slug === data.slug);
    return fallback ?? null;
  });
