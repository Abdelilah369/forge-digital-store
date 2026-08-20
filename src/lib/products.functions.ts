import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { type Product, SAMPLE_PRODUCTS } from "./catalog";

const FALLBACK_PRODUCT_IMAGES: Record<string, string> = {
  "notion-os.jpg": "/products/second-brain.jpg",
  "planner.jpg": "/products/prompt-os.jpg",
  "course.jpg": "/products/ai-masterclass.jpg",
  "ebook.jpg": "/products/growth-playbook.jpg",
  "app.jpg": "/products/saas-ui-kit.jpg",
  "textures.jpg": "/products/analog-grain.jpg",
  "sample-notion-life-os": "/products/second-brain.jpg",
  "sample-minimal-planner-pack": "/products/prompt-os.jpg",
  "sample-design-systems-course": "/products/ai-masterclass.jpg",
  "sample-freelance-handbook": "/products/growth-playbook.jpg",
  "sample-focusflow-app": "/products/saas-ui-kit.jpg",
  "sample-grain-grit-textures": "/products/analog-grain.jpg",
  "second-brain-notion-os": "/products/second-brain.jpg",
  "fullstack-ai-engineering-masterclass": "/products/ai-masterclass.jpg",
  "analog-grain-and-film-texture-pack": "/products/analog-grain.jpg",
  "prompt-forge-desktop-app": "/products/prompt-os.jpg",
  "forge-ui-design-system-figma": "/products/saas-ui-kit.jpg",
  "zero-to-10k-mrr-growth-playbook": "/products/growth-playbook.jpg",
};

export function sanitizeProduct(p: Product): Product {
  let cover = p.cover_url;
  if (!cover || cover.startsWith("/__l5e/")) {
    cover =
      FALLBACK_PRODUCT_IMAGES[p.slug] ||
      Object.entries(FALLBACK_PRODUCT_IMAGES).find(([k]) => cover?.includes(k))?.[1] ||
      "/products/second-brain.jpg";
  }

  const rawPreviews = p.preview_urls || [];
  const previews = rawPreviews.map((url) => {
    if (url.startsWith("/__l5e/")) {
      return (
        Object.entries(FALLBACK_PRODUCT_IMAGES).find(([k]) => url.includes(k))?.[1] || cover
      );
    }
    return url;
  });

  return {
    ...p,
    cover_url: cover,
    preview_urls: previews.length > 0 ? previews : [cover],
  };
}

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
        return (rows as unknown as Product[]).map(sanitizeProduct);
      }
    } catch {
      // Fallback gracefully to rich sample catalog
    }

    let products = SAMPLE_PRODUCTS.map(sanitizeProduct);
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
        return sanitizeProduct(row as unknown as Product);
      }
    } catch {
      // Fallback gracefully
    }

    const fallback = SAMPLE_PRODUCTS.find((p) => p.slug === data.slug);
    return fallback ? sanitizeProduct(fallback) : null;
  });
