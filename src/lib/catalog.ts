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

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod-notion-os",
    slug: "second-brain-notion-os",
    title: "Second Brain & Creator OS",
    short_description: "All-in-one Notion operating system for projects, tasks, notes, and content pipelines.",
    description: "A comprehensive digital workspace engineered to organize your entire life and creative workflow. Includes PARA method integration, automated weekly reviews, financial dashboard, and client CRM.",
    price_cents: 4900,
    currency: "usd",
    category: "templates-printables",
    cover_url: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80",
    preview_urls: [
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&auto=format&fit=crop&q=80",
    ],
    is_sample: false,
    published: true,
  },
  {
    id: "prod-fullstack-ai-course",
    slug: "fullstack-ai-engineering-masterclass",
    title: "Fullstack AI Engineering Masterclass",
    short_description: "Build, scale, and monetize autonomous AI agents with Next.js, Python, and LangChain.",
    description: "A hands-on, zero-fluff video course and source code bundle guiding you through building production-ready AI applications, multi-agent orchestrations, and SaaS billing integrations.",
    price_cents: 8900,
    currency: "usd",
    category: "courses-ebooks",
    cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    preview_urls: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    ],
    is_sample: false,
    published: true,
  },
  {
    id: "prod-grain-texture-pack",
    slug: "analog-grain-and-film-texture-pack",
    title: "Analog Film & Grain Texture Kit",
    short_description: "50+ ultra-high-resolution 8K authentic film grain overlays and vintage noise textures.",
    description: "Extracted from real 35mm and 120mm film stocks. Includes dust, scratches, light leaks, and seamless halftone patterns designed for designers, art directors, and 3D artists.",
    price_cents: 2900,
    currency: "usd",
    category: "design-assets",
    cover_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    preview_urls: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    ],
    is_sample: false,
    published: true,
  },
  {
    id: "prod-prompt-os-app",
    slug: "prompt-forge-desktop-app",
    title: "PromptForge Desktop Suite",
    short_description: "A fast, local-first Mac and Windows application for organizing, testing, and chaining AI prompts.",
    description: "Store your prompt library locally, run instant batch evaluations across OpenAI, Anthropic, and Gemini models, and export reusable SDK code snippets with one keystroke.",
    price_cents: 3900,
    currency: "usd",
    category: "software-apps",
    cover_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    preview_urls: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    ],
    is_sample: false,
    published: true,
  },
  {
    id: "prod-saas-ui-kit",
    slug: "forge-ui-design-system-figma",
    title: "Forge UI Design System for Figma",
    short_description: "300+ accessible, auto-layout components and 40 complete SaaS dashboard templates.",
    description: "Built for speed and precision. Dark mode native, fully tokenized with Tailwind CSS v4 variables, Radix UI compatible, and ready for modern web applications.",
    price_cents: 5900,
    currency: "usd",
    category: "design-assets",
    cover_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
    preview_urls: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581291518655-9523c932deb4?w=1200&auto=format&fit=crop&q=80",
    ],
    is_sample: false,
    published: true,
  },
  {
    id: "prod-growth-playbook",
    slug: "zero-to-10k-mrr-growth-playbook",
    title: "0 to $10k MRR Indie Maker Playbook",
    short_description: "The complete tactical guide to launching, marketing, and scaling micro-SaaS and digital tools.",
    description: "180+ pages of unfiltered case studies, cold outreach templates, SEO strategies, Product Hunt launch checklists, and high-converting landing page formulas.",
    price_cents: 3500,
    currency: "usd",
    category: "courses-ebooks",
    cover_url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80",
    preview_urls: [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80",
    ],
    is_sample: false,
    published: true,
  },
];
