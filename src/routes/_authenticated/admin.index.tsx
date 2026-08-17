import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminListProducts, deleteProduct } from "@/lib/admin.functions";
import { categoryLabel, formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Seller area — Forge Digital" },
      { name: "description", content: "Manage the Forge Digital product catalog." },
      { property: "og:title", content: "Seller area — Forge Digital" },
      { property: "og:description", content: "Manage the product catalog." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminIndex,
});

function AdminIndex() {
  const listFn = useServerFn(adminListProducts);
  const deleteFn = useServerFn(deleteProduct);
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listFn({}),
  });

  const removal = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Seller area</h1>
          <p className="mt-2 text-muted-foreground">Add, edit and remove your digital products.</p>
        </div>
        <Link to="/admin/$productId" params={{ productId: "new" }}>
          <Button>
            <Plus />
            New product
          </Button>
        </Link>
      </div>

      {isPending ? (
        <p className="mt-12 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Loading catalog…
        </p>
      ) : error ? (
        <p className="mt-12 text-destructive">
          {error instanceof Error ? error.message : "Could not load products."}
        </p>
      ) : (
        <div className="mt-10 space-y-3">
          {data?.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="h-14 w-20 overflow-hidden rounded-md bg-surface">
                {product.cover_url && (
                  <img src={product.cover_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{product.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{categoryLabel(product.category)}</Badge>
                  {!product.published && <Badge variant="outline">Draft</Badge>}
                  {product.is_sample && <Badge variant="outline">Sample</Badge>}
                  {!product.file_path && <Badge variant="destructive">No file</Badge>}
                </div>
              </div>
              <span className="font-semibold">
                {formatPrice(product.price_cents, product.currency)}
              </span>
              <div className="flex gap-2">
                <Link to="/admin/$productId" params={{ productId: product.id }}>
                  <Button variant="subtle" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={removal.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete “${product.title}”?`)) removal.mutate(product.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
