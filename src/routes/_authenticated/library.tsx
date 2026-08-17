import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/catalog";
import { createDownloadLink, listMyLibrary } from "@/lib/library.functions";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "My downloads — Forge Digital" },
      { name: "description", content: "Access the digital files you purchased from Forge Digital." },
      { property: "og:title", content: "My downloads — Forge Digital" },
      { property: "og:description", content: "Access your purchased digital files." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const fetchLibrary = useServerFn(listMyLibrary);
  const makeLink = useServerFn(createDownloadLink);
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["library"],
    queryFn: () => fetchLibrary({}),
  });

  async function download(productId: string) {
    setBusy(productId);
    try {
      const { url } = await makeLink({ data: { productId } });
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight">My downloads</h1>
      <p className="mt-2 text-muted-foreground">
        Every purchase is verified before a private, time-limited download link is issued.
      </p>

      {isPending ? (
        <p className="mt-12 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Loading your library…
        </p>
      ) : !data?.length ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">You haven't purchased anything yet.</p>
          <Link to="/products" className="mt-6 inline-block">
            <Button>Browse the catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {data.map((item) => (
            <div
              key={item.product_id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="h-16 w-20 overflow-hidden rounded-md bg-surface">
                {item.cover_url && (
                  <img src={item.cover_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to="/products/$slug"
                  params={{ slug: item.slug }}
                  className="font-medium hover:underline"
                >
                  {item.title}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{categoryLabel(item.category)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.purchased_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                variant={item.has_file ? "default" : "outline"}
                disabled={!item.has_file || busy === item.product_id}
                onClick={() => download(item.product_id)}
              >
                {busy === item.product_id ? <Loader2 className="animate-spin" /> : <Download />}
                {item.has_file ? "Download" : "File coming soon"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
