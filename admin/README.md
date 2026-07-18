# Primal Peps Admin

Supabase-powered admin panel for **orders** and **products**.

## Setup

### 1. Install

```bash
cd admin
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run, in order:
   - `supabase/schema.sql`
   - `supabase/storage.sql` (product image bucket)
   - `supabase/storefront.sql` (profiles + reviews)
   - `supabase/site-settings.sql` (bank, promo, social)
   - `supabase/seed-products.sql` (generate first — see below)
   - `supabase/seed-admin.sql` (after creating your Auth user)
   - `supabase/fix-signup.sql` (optional — instant customer signup)

### 3. Create an admin user

1. Supabase → **Authentication** → **Users** → Add user (email + password)
2. Copy the user UUID
3. Edit `supabase/seed-admin.sql` with that UUID + email, then run it

### 4. Env

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

(Find both under Project Settings → API.)

### 5. Seed products from the storefront catalog

```bash
node scripts/generate-seed.mjs
```

Then run `supabase/seed-products.sql` in the SQL Editor.

### 6. Run

```bash
npm run dev
```

Opens on [http://localhost:5174](http://localhost:5174).

## Features

- **Overview** — counts, awaiting payment, recent orders
- **Orders** — list, filter, search, detail view, status + admin notes
- **Products** — tabbed editor, activate/hide, create/edit/delete, variants
- **Images** — upload per variant to Supabase Storage bucket `product-images`
- **Users** — customer profiles, order stats, edit Primal Points
- **Reviews** — moderate / delete storefront reviews
- **Settings** — bank transfer, promo %, free-shipping threshold, social links, contact

### Storage setup note

If `storage.sql` fails on `storage.buckets`, create a **public** bucket named `product-images` in **Storage → New bucket**, then re-run the policy statements from `storage.sql`.

## Order statuses

`Awaiting payment` → `Payment received` → `Processing` → `Shipped` → `Delivered` (or `Cancelled`)
