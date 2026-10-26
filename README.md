# Closet Crusade

Catalogue site for Closet Crusade: design-first second-hand fashion. Buyers browse the items and DM on Instagram or Carousell to buy. There's no cart or online payment.

- **Stack:** Next.js 16 (App Router, Cache Components), Tailwind CSS 4, Supabase (Postgres, Storage, Auth), hosted on Vercel.
- **Prices:** stored in SGD. Other currencies (IDR, MYR, USD, EUR, GBP, AUD, JPY) are converted using daily ECB rates from [Frankfurter](https://frankfurter.dev), refreshed hourly.
- **Admin:** `/admin`, email + password. Accounts are created by hand in Supabase (public sign-up is off). Only the emails in `ADMIN_EMAILS` **and** `private.admins` (see `supabase/schema.sql`) can change anything. The database enforces this with Row Level Security.

## One-time setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com). Pick the Singapore region.
2. **SQL Editor → New query**: paste all of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. **Project Settings → API Keys**: copy the project URL, the **publishable** key and a **secret** key into `.env.local` (start from `.env.example`).
4. **Authentication → Sign In / Providers**:
   - Turn **off** "Allow new users to sign up", so nobody can create their own account.
   - Leave "Allow anonymous sign-ins" **off**.
   - Under the **Email** provider, set the minimum password length to at least 12.
5. **Authentication → Users → Add user → Create new user**: create one account for each admin email in `ADMIN_EMAILS`, with a strong password and **Auto Confirm User** ticked. Give your sister her password in person or through a password manager.

To reset a forgotten password, open **Authentication → Users**, click the user's **⋯** menu, and set a new password.

### 2. Load the first items

```bash
npm install
npm run seed -- "drive-download-20261025T234536Z-1-001"
```

This uploads the photos and creates 8 items with their SGD prices. Brand, size, condition and description are filled in from `/admin`. The hooded floral jacket ("Layer 1/2" photos) gets a placeholder name.

### 3. Vercel

1. [vercel.com/new](https://vercel.com/new) → import `JKennethG283/closet-crusade`.
2. Add these environment variables (values from `.env.local`). **Don't** add `SUPABASE_SECRET_KEY`.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `ADMIN_EMAILS`
   - `CRON_SECRET`
3. Deploy. Every push to `main` redeploys automatically.
   - Link previews use Vercel's production address automatically. If you add a custom domain later, set `SITE_URL` (e.g. `https://closetcrusade.com`) and redeploy.
4. The daily cron in `vercel.json` pings Supabase so the free project doesn't pause from inactivity.

## Adding or removing an admin

Create (or delete) their account under **Authentication → Users**, then update **both**:

- the `ADMIN_EMAILS` environment variable (Vercel, then redeploy), and
- the database list:

  ```sql
  insert into private.admins (email) values ('someone@gmail.com');
  ```

  To remove someone: `delete from private.admins where email = '...';`

## Development

```bash
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

---

## Guide for the shop admin

1. Go to **your-site/admin** and sign in with your email and password. Let your phone save the password so you don't have to type it next time.
2. **Add an item:** tap **+ Add new item**.
   - Add photos. The first photo is the cover. Use ← → to reorder and ✕ to remove.
   - Fill in the name and the price in SGD. Brand, size, condition and description are optional.
   - Tap **Save**. The item is live on the shop straight away.
3. **Edit an item:** tap **Edit** next to it, change anything, then tap **Save**.
4. **Mark as sold or reserved:** use the status dropdown next to the item in the list. Sold items stay on the shop with a "Sold" label.
5. **Hide an item** without deleting it: untick **Show on the shop**.
6. **Delete an item:** open it and tap **Delete item** at the bottom.
