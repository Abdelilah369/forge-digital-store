export const CATEGORIES = [
  {
    slug: "templates-printables",
    label: "Templates & Printables",
    blurb: "Notion systems, planners and print-ready sheets.",
  },
  {
    slug: "courses-ebooks",
    label: "Courses & Ebooks",
    blurb: "Deep-dive lessons and long-form written guides.",
  },
  {
    slug: "software-apps",
    label: "Software & Apps",
    blurb: "Small, sharp tools built to do one thing well.",
  },
  {
    slug: "design-assets",
    label: "Design & Creative Assets",
    blurb: "Textures, kits and source files for makers.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function formatPrice(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export type Product = {
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
  is_sample: boolean;
  published: boolean;
};
