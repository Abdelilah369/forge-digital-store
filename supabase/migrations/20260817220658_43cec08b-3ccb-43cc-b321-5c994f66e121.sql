-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- First signed-up user becomes the store owner (admin)
CREATE OR REPLACE FUNCTION public.assign_first_user_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER assign_first_user_admin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_first_user_admin();

-- Timestamp helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'usd',
  category text NOT NULL CHECK (category IN ('templates-printables','courses-ebooks','software-apps','design-assets')),
  cover_url text,
  preview_urls text[] NOT NULL DEFAULT '{}',
  file_path text,
  file_name text,
  is_sample boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products (category);
GRANT SELECT (id, slug, title, short_description, description, price_cents, currency, category, cover_url, preview_urls, is_sample, published, created_at, updated_at) ON public.products TO anon;
GRANT SELECT (id, slug, title, short_description, description, price_cents, currency, category, cover_url, preview_urls, is_sample, published, created_at, updated_at) ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published products" ON public.products FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL UNIQUE,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  unit_price_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view items of their own orders" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Purchases (entitlements)
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Sample catalog (clearly marked; replace later)
INSERT INTO public.products (slug, title, short_description, description, price_cents, category, cover_url, preview_urls, is_sample) VALUES
('sample-notion-life-os', 'Forge Life OS (Notion Template)', 'A calm, all-in-one Notion workspace for projects, goals and weekly reviews.', E'SAMPLE PRODUCT — replace this with your own copy.\n\nForge Life OS is a complete Notion workspace that keeps projects, goals, habits and notes in one connected system. It ships with linked databases, a weekly review dashboard, and a quick-capture inbox so nothing gets lost.\n\nIncluded:\n- Projects and tasks databases with rollups\n- Weekly and quarterly review templates\n- Habit tracker and reading log\n- Setup guide (PDF)', 2900, 'templates-printables', '/__l5e/assets-v1/1736f60a-6bd3-4bcf-bf1b-bb454261c098/notion-os.jpg', ARRAY['/__l5e/assets-v1/1736f60a-6bd3-4bcf-bf1b-bb454261c098/notion-os.jpg'], true),
('sample-minimal-planner-pack', 'Minimal Planner Printable Pack', '24 printable planner sheets in a warm, paper-first minimal style.', E'SAMPLE PRODUCT — replace this with your own copy.\n\nA set of 24 print-ready planner pages designed for A4 and US Letter: daily focus sheets, weekly spreads, monthly calendars, habit grids and dot pages.\n\nIncluded:\n- 24 PDF sheets (A4 + US Letter)\n- Editable source files\n- Print tips guide', 1200, 'templates-printables', '/__l5e/assets-v1/50355c16-aa67-4006-a11f-ad417a3f6cf2/planner.jpg', ARRAY['/__l5e/assets-v1/50355c16-aa67-4006-a11f-ad417a3f6cf2/planner.jpg'], true),
('sample-design-systems-course', 'Design Systems Masterclass', 'A 4-hour practical course on building design systems that teams actually use.', E'SAMPLE PRODUCT — replace this with your own copy.\n\nEight lessons that take you from raw tokens to a documented, adopted design system: naming, theming, component APIs, contribution workflow and rollout.\n\nIncluded:\n- 8 video lessons (4h total)\n- Figma token starter file\n- Component checklist', 7900, 'courses-ebooks', '/__l5e/assets-v1/e0d96367-0a63-4daa-ac90-9ff11dc7fda8/course.jpg', ARRAY['/__l5e/assets-v1/e0d96367-0a63-4daa-ac90-9ff11dc7fda8/course.jpg'], true),
('sample-freelance-handbook', 'The Freelance Handbook (Ebook)', '120 pages on pricing, proposals and staying booked without burning out.', E'SAMPLE PRODUCT — replace this with your own copy.\n\nA practical field guide for independent designers and developers: how to price value, write proposals that close, structure retainers, and build a pipeline that survives slow months.\n\nIncluded:\n- 120-page ebook (PDF + EPUB)\n- Proposal and contract templates\n- Rate calculator spreadsheet', 1900, 'courses-ebooks', '/__l5e/assets-v1/07ce9568-9435-4481-a6f1-1476e23de1c9/ebook.jpg', ARRAY['/__l5e/assets-v1/07ce9568-9435-4481-a6f1-1476e23de1c9/ebook.jpg'], true),
('sample-focusflow-app', 'FocusFlow — Menu Bar Timer', 'A featherweight focus timer that lives in your menu bar and tracks deep work.', E'SAMPLE PRODUCT — replace this with your own copy.\n\nFocusFlow is a tiny native timer for deep work sessions. Start a session from the menu bar, block distractions, and review where your hours actually went.\n\nIncluded:\n- macOS app (Apple Silicon + Intel)\n- Lifetime license key\n- Free minor updates', 3900, 'software-apps', '/__l5e/assets-v1/0107ed0b-e797-4ff2-9acb-2d9f423ea356/app.jpg', ARRAY['/__l5e/assets-v1/0107ed0b-e797-4ff2-9acb-2d9f423ea356/app.jpg'], true),
('sample-grain-grit-textures', 'Grain & Grit Texture Pack', '40 high-resolution grain, paper and gradient textures for print and screen.', E'SAMPLE PRODUCT — replace this with your own copy.\n\nA curated pack of 40 scanned and rendered textures: film grain overlays, pressed paper, risograph noise and warm gradient washes. All royalty-free for commercial work.\n\nIncluded:\n- 40 textures (6000px PNG + JPG)\n- 12 gradient .ase swatches\n- Commercial license', 2400, 'design-assets', '/__l5e/assets-v1/87ec03fb-0201-4de9-9142-c221086d1715/textures.jpg', ARRAY['/__l5e/assets-v1/87ec03fb-0201-4de9-9142-c221086d1715/textures.jpg'], true);