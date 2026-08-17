import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Product } from "./catalog";

const listInput = z.object({ category: z.string().optional() });

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listInput.parse(data ?? {}))
  .handler(async ({ data }): Promise<Product[]> => {
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
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as Product[];
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<Product | null> => {
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

    if (error) throw new Error(error.message);
    return (row ?? null) as unknown as Product | null;
  });
