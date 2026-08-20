import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminProduct = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price_cents: number;
  currency: string;
  category: string;
  cover_url: string | null;
  preview_urls: string[];
  file_path: string | null;
  file_name: string | null;
  is_sample: boolean;
  published: boolean;
};

type RoleCheckClient = {
  rpc: (
    fn: "has_role",
    args: { _user_id: string; _role: "admin" },
  ) => PromiseLike<{ data: unknown }>;
};

async function assertAdmin(supabase: RoleCheckClient, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data !== true) throw new Error("Admin access required.");
}


export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminProduct[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminProduct[];
  });

const productInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only."),
  title: z.string().min(2),
  short_description: z.string().default(""),
  description: z.string().default(""),
  price_cents: z.number().int().min(0),
  category: z.enum(["templates-printables", "courses-ebooks", "software-apps", "design-assets"]),
  cover_url: z.string().nullable().default(null),
  preview_urls: z.array(z.string()).default([]),
  file_path: z.string().nullable().default(null),
  file_name: z.string().nullable().default(null),
  published: z.boolean().default(true),
  is_sample: z.boolean().default(false),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => productInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { id, ...fields } = data;
    const row = { ...fields, currency: "usd" };
    const { data: saved, error } = id
      ? await supabaseAdmin.from("products").update(row).eq("id", id).select("id, slug").single()
      : await supabaseAdmin.from("products").insert(row).select("id, slug").single();


    if (error) throw new Error(error.message);
    return saved;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Uploads a cover image or a downloadable file. Admin only. */
export const uploadProductAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Expected a file upload.");
    const file = data.get("file");
    const kind = String(data.get("kind") ?? "");
    if (!(file instanceof File)) throw new Error("No file provided.");
    if (kind !== "cover" && kind !== "download") throw new Error("Unknown upload type.");
    return { file, kind };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const bucket = data.kind === "cover" ? "product-covers" : "product-files";
    const safeName = data.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${crypto.randomUUID()}/${safeName}`;

    const { error } = await supabaseAdmin.storage.from(bucket).upload(path, data.file, {
      contentType: data.file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw new Error(error.message);

    return {
      path,
      fileName: data.file.name,
      url: data.kind === "cover" ? `/api/public/cover/${path}` : null,
    };
  });
