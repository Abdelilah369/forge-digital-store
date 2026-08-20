# Forge Digital Storefront

Build "Forge Digital" — a modern storefront for selling my own digital products directly to customers. 

Scope:
- Homepage with hero section, brand name "Forge Digital", and a tagline about handcrafted digital tools & assets.
- Product catalog organized into 4 categories: Templates & Printables, Courses & Ebooks, Software & Apps, Design & Creative Assets.
- Product listing pages with grid view (image, title, short description, price, category tag) and a product detail page (full description, preview images, price, "Buy Now" button).
- Shopping cart + checkout flow using Stripe (test mode for now — I'll connect my real Stripe account later).
- After successful purchase, buyer gets secure access to download the digital file(s) tied to that product (use Supabase storage + database to gate downloads behind purchase verification, not just a public link).
- Simple admin/seller area (protected by auth) where I can add/edit products: title, description, price, category, cover image, and upload the downloadable file.
- Clean, professional, modern design — dark/light neutral palette with a single accent color, good typography, mobile responsive.
- Seed the catalog with 4-6 realistic placeholder products (one or two per category) with placeholder descriptions and prices so the store doesn't look empty, clearly marked as sample products I'll replace.

Please set up Supabase for auth/database/storage and Stripe for payments as part of this build.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://forge-digital-store.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/69a76b6b-0891-4c75-85e0-5cd4159733bf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
