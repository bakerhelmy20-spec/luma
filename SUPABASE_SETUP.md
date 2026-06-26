# Supabase Setup Guide for Luma E-Commerce Platform

## Overview

This guide walks you through setting up the complete Luma database schema in your Supabase project.

## Prerequisites

- Supabase project created at https://supabase.com
- Access to Supabase SQL Editor
- Project URL and API keys from your Supabase dashboard

## Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API** (left sidebar)
4. Copy the following:
   - **Project URL** → Save as `VITE_SUPABASE_URL`
   - **Anon public key** → Save as `VITE_SUPABASE_PUBLISHABLE_KEY`

## Step 2: Add Environment Variables to v0 Project

1. In v0, click the **Settings** button (top right gear icon)
2. Go to **Vars** tab
3. Add two new environment variables:
   - **Name**: `VITE_SUPABASE_URL` → **Value**: Your Project URL
   - **Name**: `VITE_SUPABASE_PUBLISHABLE_KEY` → **Value**: Your Anon public key
4. Click **Save**

## Step 3: Run the Database Migration

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query** (or paste in the Query 1 editor)
4. Open this file in your text editor: `/supabase/migrations/001_full_schema.sql`
5. Copy the entire contents
6. Paste into the Supabase SQL Editor
7. Click the **Run** button (bottom right)
8. Wait for completion ✅

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run the migration
supabase db push
```

## Step 4: Verify Installation

After running the migration, verify all tables were created:

1. In Supabase dashboard, click **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ roles
   - ✅ profiles
   - ✅ categories
   - ✅ sub_categories
   - ✅ products
   - ✅ product_images
   - ✅ product_variants
   - ✅ product_inventory
   - ✅ wishlist
   - ✅ carts
   - ✅ cart_items
   - ✅ coupons
   - ✅ orders
   - ✅ order_items
   - ✅ coupon_usage
   - ✅ payments
   - ✅ addresses
   - ✅ reviews
   - ✅ contact_messages
   - ✅ hero_banners
   - ✅ site_settings
   - ✅ notifications
   - ✅ activity_logs

If all tables are present, **setup is complete!** ✨

## Step 5: Configure Row Level Security (RLS)

RLS policies are automatically created by the migration. To verify:

1. Go to **SQL Editor**
2. Run this query:
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'products', 'carts', 'orders');
   ```
3. You should see results showing all RLS policies are active

## Step 6: Test Authentication

1. Go back to the v0 app preview
2. Navigate to the Auth page
3. Try signing up with an email
4. If successful, check in Supabase:
   - New user in **auth.users** table
   - New profile in **profiles** table (auto-created by trigger)

## What Was Created

### Tables (22 total)

**System**: roles, profiles
**Catalog**: categories, sub_categories, products, product_images, product_variants, product_inventory
**Shopping**: wishlist, carts, cart_items
**Orders**: orders, order_items, coupons, coupon_usage
**Payments**: payments, addresses
**Community**: reviews, contact_messages
**CMS**: hero_banners, site_settings, notifications, activity_logs

### Features

✅ **11 Automatic Triggers**
- Auto-update timestamps (created_at, updated_at)
- Auto-decrement inventory on order
- Auto-create user profile on signup

✅ **12 Performance Indexes**
- Product slug lookup
- Category filtering
- Order queries
- Cart operations
- Search optimization

✅ **13 Row Level Security Policies**
- User data isolation
- Admin access control
- Public product visibility
- Cart ownership enforcement
- Order access control

### Bilingual Support

All text fields support Arabic and English:
- `name_ar` / `name_en`
- `description_ar` / `description_en`
- `title_ar` / `title_en`

## Troubleshooting

### Error: "relation does not exist"

**Solution**: The migration might not have completed. Try running it again or check for error messages in the SQL Editor output.

### Error: "relation already exists"

**Solution**: The tables already exist. To reset, go to **SQL Editor** and run:
```sql
-- WARNING: This deletes all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
```
Then re-run the migration.

### Tables created but no data

**Solution**: Normal for a fresh setup. Seed data (4 sample categories) is auto-inserted. To add more products:
1. Go to **Table Editor**
2. Click **products** table
3. Click **Insert row**
4. Add product details

### RLS Policies not working

**Solution**: Verify policies are enabled:
1. Go to **Table Editor**
2. Right-click any table
3. Click **Edit table** or click the three dots menu
4. Go to **RLS** section
5. Make sure RLS is **enabled** (toggle on)

## Common Tasks

### Add a Product

Use SQL Editor:
```sql
INSERT INTO products (
  slug, sku, name_ar, name_en, description_ar, description_en, 
  price, category_id, is_active
) VALUES (
  'ceramic-bowl-1', 'SKU-001', 'وعاء سيراميك', 'Ceramic Bowl',
  'وعاء مصنوع يدويًا', 'Handmade ceramic bowl',
  50.00, (SELECT id FROM categories WHERE slug = 'pottery'), true
);
```

### Create a Coupon

```sql
INSERT INTO coupons (
  code, discount_type, value, start_date, expiry_date, is_active
) VALUES (
  'LUMA2024', 'percentage', 15.00, NOW(), NOW() + INTERVAL '30 days', true
);
```

### View Orders

```sql
SELECT o.order_number, o.total, o.status, p.email
FROM orders o
JOIN profiles p ON o.profile_id = p.id
ORDER BY o.created_at DESC;
```

## Next Steps

1. ✅ Run the migration (you are here)
2. ⬜ Add environment variables to v0
3. ⬜ Test user registration
4. ⬜ Add sample products via Table Editor
5. ⬜ Test shopping cart functionality
6. ⬜ Deploy to production

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review the schema file: `/supabase/migrations/001_full_schema.sql`
- Check error messages in SQL Editor output

---

**Status**: Ready to Deploy
**Version**: 1.0
**Last Updated**: 2024
