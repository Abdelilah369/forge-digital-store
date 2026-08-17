import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminListProducts,
  saveProduct,
  uploadProductAsset,
  type AdminProduct,
} from "@/lib/admin.functions";
import { CATEGORIES, type CategorySlug } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/$productId")({
  head: () => ({
    meta: [
      { title: "Edit product — Forge Digital" },
      { name: "description", content: "Create or edit a Forge Digital product listing." },
      { property: "og:title", content: "Edit product — Forge Digital" },
      { property: "og:description", content: "Create or edit a product listing." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProductEditor,
});

type FormState = {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price: string;
  category: CategorySlug;
  cover_url: string | null;
  file_path: string | null;
  file_name: string | null;
  published: boolean;
  is_sample: boolean;
};

const EMPTY: FormState = {
  slug: "",
  title: "",
  short_description: "",
  description: "",
  price: "19.00",
  category: "templates-printables",
  cover_url: null,
  file_path: null,
  file_name: null,
  published: true,
  is_sample: false,
};

function fromProduct(product: AdminProduct): FormState {
  return {
    slug: product.slug,
    title: product.title,
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    price: (product.price_cents / 100).toFixed(2),
    category: product.category as CategorySlug,
    cover_url: product.cover_url,
    file_path: product.file_path,
    file_name: product.file_name,
    published: product.published,
    is_sample: product.is_sample,
  };
}

function ProductEditor() {
  const { productId } = Route.useParams();
  const isNew = productId === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const listFn = useServerFn(adminListProducts);
  const saveFn = useServerFn(saveProduct);
  const uploadFn = useServerFn(uploadProductAsset);

  const { data: products, isPending } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listFn({}),
    enabled: !isNew,
  });

  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"cover" | "download" | null>(null);

  const existing = products?.find((p) => p.id === productId);

  useEffect(() => {
    if (existing) setForm(fromProduct(existing));
  }, [existing]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function upload(kind: "cover" | "download", file: File) {
    setUploading(kind);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", kind);
      const result = await uploadFn({ data: body });
      if (kind === "cover") {
        update("cover_url", result.url);
      } else {
        update("file_path", result.path);
        update("file_name", result.fileName);
      }
      toast.success("Upload complete");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const priceCents = Math.round(Number(form.price) * 100);
      if (!Number.isFinite(priceCents) || priceCents < 0) throw new Error("Enter a valid price.");

      await saveFn({
        data: {
          ...(isNew ? {} : { id: productId }),
          slug: form.slug.trim(),
          title: form.title.trim(),
          short_description: form.short_description,
          description: form.description,
          price_cents: priceCents,
          category: form.category,
          cover_url: form.cover_url,
          preview_urls: existing?.preview_urls ?? [],
          file_path: form.file_path,
          file_name: form.file_name,
          published: form.published,
          is_sample: form.is_sample,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(isNew ? "Product created" : "Product updated");
      navigate({ to: "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && isPending) {
    return (
      <p className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-20 text-muted-foreground">
        <Loader2 className="animate-spin" /> Loading product…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to seller area
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
        {isNew ? "New product" : "Edit product"}
      </h1>

      <form onSubmit={submit} className="mt-10 grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={form.title}
            onChange={(e) => {
              update("title", e.target.value);
              if (isNew && !form.slug) return;
            }}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">URL slug</Label>
          <Input
            id="slug"
            required
            placeholder="notion-second-brain"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              inputMode="decimal"
              required
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => update("category", e.target.value as CategorySlug)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="short">Short description</Label>
          <Input
            id="short"
            value={form.short_description}
            onChange={(e) => update("short_description", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Full description</Label>
          <Textarea
            id="description"
            rows={8}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Cover image</Label>
            {form.cover_url && (
              <img
                src={form.cover_url}
                alt=""
                className="h-24 w-full rounded-md object-cover"
              />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-accent-foreground">
              {uploading === "cover" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload("cover", file);
                }}
              />
            </label>
          </div>

          <div className="grid gap-2">
            <Label>Downloadable file</Label>
            <p className="text-sm text-muted-foreground">
              {form.file_name ?? "No file attached yet"}
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-accent-foreground">
              {uploading === "download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload file
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload("download", file);
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          <label className="flex items-center gap-3 text-sm">
            <Switch
              checked={form.published}
              onCheckedChange={(checked) => update("published", checked)}
            />
            Published
          </label>
          <label className="flex items-center gap-3 text-sm">
            <Switch
              checked={form.is_sample}
              onCheckedChange={(checked) => update("is_sample", checked)}
            />
            Mark as sample product
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {isNew ? "Create product" : "Save changes"}
          </Button>
          <Link to="/admin">
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
