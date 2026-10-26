# Closet Crusade — Implementation Plan

A simple catalogue site for second-hand fashion. Buyers browse, then message on Instagram or Carousell to buy. No cart, no checkout, no online payment.

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) + Tailwind CSS | Requested; first-class on Vercel |
| Hosting | Vercel (Hobby/free), connected to `JKennethG283/closet-crusade` | Push to `main` → auto-deploy |
| Database | Supabase Postgres (free tier) | Stores items, prices, status |
| Image storage | Supabase Storage (public bucket) + `next/image` | Upload from admin, served resized/optimised |
| Admin login | Supabase Auth, **Sign in with Google** | Both admins use Gmail; no password or email sender needed; only allow-listed emails |
| Exchange rates | Frankfurter API (ECB rates, free, no key) | Covers SGD, IDR, MYR, USD, EUR, GBP, AUD, JPY… |

One service (Supabase) covers database, images and login, so there is only one extra dashboard to manage. Free Supabase projects pause after 7 days without traffic; a daily Vercel Cron ping keeps it awake.

## 2. Data model

`items`
- `id` (uuid), `slug` (from name, for URLs)
- `name`, `brand`, `size`, `condition` (e.g. "Excellent – light wear"), `description`, `measurements` (optional text)
- `price_sgd` (integer, cents) — the only stored price
- `status`: `available` | `reserved` | `sold`
- `is_published` (hide drafts), `sort_order`, `created_at`, `updated_at`

`item_images`
- `id`, `item_id`, `storage_path`, `position` (first = cover photo)

`admins`
- `email` — the allow-list used by the database security rules

## 3. Public site

- **Home `/`** — logo, "Design-first second-hand fashion" intro text, "Browse for your next grail" grid of items (cover photo, name, price). Sold items stay visible with a "Sold" badge (good social proof); reserved items show "Reserved".
- **Item `/items/[slug]`** — photo gallery (swipe on mobile), name, brand, size, condition, description, price, and two buttons: **"DM on Instagram"** (`ig.me/m/closetcrusade`, prefilled with the item name where possible) and **"Message on Carousell"**.
- **Info `/terms`** — the full text supplied: Authenticity & Condition; Payment, Shipping & Terms of Purchase; Customs; Returns; Contact.
- **Footer** — Instagram / Carousell links, short "how to buy" line, link to terms.
- **Currency switcher** (header dropdown): SGD (default), IDR, MYR, USD, EUR, GBP, AUD, JPY.
  - SGD is the fixed price; other currencies are calculated from it: `price_sgd × rate`.
  - Rates fetched server-side and cached for 12 hours (no per-visitor API calls).
  - Non-SGD prices shown as "≈ IDR 1,250,000" with a note: "Approximate. Final price is charged in SGD / confirmed in DM."
  - Choice remembered in a cookie.
- SEO basics: page titles, Open Graph image (cover photo) so links shared on IG/WhatsApp show a preview.

## 4. Admin (for a non-technical user)

**Login `/admin`**
1. Tap "Continue with Google" → pick the Gmail account → logged in.

> Changed from email magic links: Supabase's built-in mailer only delivers to Supabase team members, and a real sender (e.g. Resend) needs a custom domain, which is postponed. Google sign-in gives the same email-based allow-list with less friction.

**Security**
- Email/password and anonymous sign-in disabled in Supabase; only Google accounts whose email is in `private.admins` (and the `ADMIN_EMAILS` env var) get admin access.
- Database Row-Level Security: anyone can *read* published items; only admins can create/edit/delete items and upload/delete photos. Enforced in the database, not just the UI.
- Next.js middleware blocks `/admin/*` for anyone not logged in; every server action re-checks admin status.
- Supabase's built-in rate limiting on login emails; secrets only in Vercel env vars, never in the repo.

**Dashboard `/admin`**
- List of all items with cover photo, price, status, and big "Edit" / "+ Add item" buttons.
- **Add / Edit item** form: name, brand, size, condition, description, price (SGD), status (Available / Reserved / Sold), Published on/off.
- **Photos**: drag-and-drop or tap to upload from phone; drag to reorder (first = cover); delete. Large photos are resized in the browser before upload so phone uploads are fast.
- One-tap "Mark as sold".
- Delete item (with confirmation).
- Changes appear on the live site immediately (on-demand revalidation).

## 5. Initial content (seed)

A one-time script uploads the existing photos and creates these items:

| Item | Photos |
|---|---|
| Diesel Jacket | 4 |
| Layered Tulle Dress | 5 |
| Anna Cho Bolero Jacket | 4 |
| Dior Yellow Tee | 5 |
| Y/Project Black (size 38) | 5 |
| Y/Project Clear (size 39) | 5 |
| Maison Margiela (filename spelled "Masion") | 6 |
| Hooded tiered floral jacket (files "Layer 1" / "Layer 2", unnamed) | 2 |

The logo (`Closet Crusade Logo.jpg`) becomes the header logo and favicon. The raw Google Drive folder stays out of git (`.gitignore`).

## 6. Design direction

Editorial and minimal, matching the black-and-white serif logo: white background, black text, a serif display font for headings (close to the logo lettering), a clean sans-serif for body text, square product photos (all sources are 1080×1080) in a 2-column mobile / 3–4-column desktop grid. Mobile-first, since most traffic will come from Instagram.

## 7. Build order

1. **Scaffold** — `create-next-app` (TS, Tailwind, App Router, ESLint), logo/favicon, base layout, first commit and push to GitHub.
2. **Supabase** — create project, tables, RLS policies, storage bucket; env vars in `.env.local`.
3. **Public pages** — home grid, item page, terms page, footer.
4. **Currency** — rates fetch + cache, switcher, formatting per currency.
5. **Admin** — email login, middleware, item list, add/edit form, photo upload/reorder.
6. **Seed** — upload the 8 existing items.
7. **Deploy** — import repo into Vercel, set env vars, set Supabase redirect URLs to the Vercel domain, add keep-alive cron.
8. **Hand-over** — test login with your sister's email, short one-page "how to add an item" guide.

## 8. Accounts / access needed

- Vercel account linked to the GitHub repo.
- Supabase account (free) — I'll need the project URL and keys put into `.env.local` / Vercel.
- Optional: a custom domain (e.g. `closetcrusade.com`).

## 9. Decisions

- Prices (SGD): Hooded floral jacket 15, Diesel Jacket 40, Layered Tulle Dress 15, Anna Cho Bolero Jacket 15, Dior Yellow Tee 15, Y/Project Black 180, Y/Project Clear 180, Maison Margiela 70.
- Admins: ravenashley.blackbird@gmail.com, jonathan.kenneth.gunawan@gmail.com.
- Item details and the hooded jacket's name are filled in by the admin.
- Currencies: SGD, IDR, MYR, USD, EUR, GBP, AUD, JPY; rates refresh automatically.
- Custom domain: later; start on `*.vercel.app`.
