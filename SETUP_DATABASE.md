# Database Setup Guide

## Quick Start

### Option 1: Using Supabase Console (Recommended)

1. **Log in to Supabase**
   - Go to https://supabase.com and sign in to your project

2. **Open SQL Editor**
   - Navigate to **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Paste the Schema**
   - Open `supabase/migrations/schema.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor

4. **Execute the Query**
   - Click **Run** button (or Cmd+Enter)
   - Wait for completion (should take ~5-10 seconds)
   - You should see ✓ success messages

5. **Verify Tables Created**
   - Go to **Table Editor** in left sidebar
   - You should see all new tables:
     - roles, profiles, categories, products, product_images, product_variants
     - carts, cart_items
     - coupons
     - orders, order_items

---

### Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Link Your Project**
   ```bash
   cd /vercel/share/v0-project
   supabase link --project-id YOUR_PROJECT_ID
   ```

3. **Create Migration File**
   ```bash
   supabase migration new init_luma_schema
   ```

4. **Copy Schema**
   - Copy contents of `supabase/migrations/schema.sql`
   - Paste into the newly created migration file

5. **Push Migration**
   ```bash
   supabase db push
   ```

---

## Environment Variables Setup

1. **Get Your Credentials**
   - Go to Supabase Project Settings
   - Navigate to **API** tab
   - Copy your project URL and Publishable Key (anon key)

2. **Create `.env.local`**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
   ```

3. **Verify Connection**
   - Start dev server: `npm run dev`
   - Check browser console for any Supabase connection errors

---

## Post-Setup Steps

### 1. Add Sample Data (Optional)

The migration already includes sample categories and one sample product. To add more sample products:

```sql
INSERT INTO products (
  name_ar, name_en, description_ar, description_en,
  slug, sku, category_id, price,
  materials, dimensions_ar, dimensions_en, weight_kg,
  handmade_time_days, stock, is_featured, tags, rating
) VALUES (
  'مزهرية ريفية مطلية يدوياً',
  'Rustic Hand-Painted Vase',
  'مزهرية من الطين الطبيعي...',
  'Kiln-fired terracotta clay vase...',
  'rustic-hand-painted-vase',
  'HM-POT-02',
  (SELECT id FROM categories WHERE slug = 'ceramics'),
  95.00,
  ARRAY['طين أحمر طبيعي', 'طلاء زجاجي'],
  'ارتفاع 22 سم، عرض الفوهة 6 سم',
  '22cm Height, 6cm Rim Diameter',
  1.200,
  5,
  8,
  TRUE,
  ARRAY['مزهرية', 'خزف', 'فن'],
  5.0
);
```

### 2. Test User Registration

1. In your app, create a test user account
2. Check Supabase **Authentication** tab to see the user
3. Verify a profile was created automatically in the `profiles` table

### 3. Test Shopping Cart

1. Add products to cart as logged-in user
2. Check `carts` and `cart_items` tables
3. Verify data persists after page refresh

### 4. Test Admin Features

1. In Supabase SQL Editor, update a user's role:
   ```sql
   UPDATE profiles 
   SET role_id = 3 
   WHERE email = 'your@email.com';
   -- role_id: 1=customer, 2=editor, 3=admin
   ```

2. Log out and back in
3. Admin features should be accessible

---

## Troubleshooting

### "Permission denied" error
- **Solution**: Check Row Level Security (RLS) policies
- Go to Supabase **Authentication** → **Policies**
- Verify policies are enabled on tables

### Tables don't appear in Table Editor
- **Solution**: Refresh the page or close/reopen Supabase dashboard
- Check SQL Editor logs for errors

### Foreign key constraint errors
- **Solution**: Ensure you insert categories BEFORE products
- Sample categories are automatically inserted with the schema

### Images not loading in products
- **Solution**: Product images use external URLs (Unsplash)
- No setup needed, they load directly from web

### Cart/Order queries return empty
- **Solution**: Check RLS policies - logged-in user needed
- Verify user is authenticated before making queries

---

## Database Backup

### Export Data
```bash
supabase db dump --db-url "postgresql://..." > backup.sql
```

### Import Data
```bash
supabase db restore < backup.sql
```

---

## Scaling Considerations

- **Current limit**: ~100K products, ~1M orders
- **Indexed columns**: product searches are fast
- **Partitioning**: Consider partitioning orders table by date if exceeding 1M+ records
- **Caching**: Use Redis (Upstash) for frequently accessed data

---

## Next Steps

1. ✅ Schema is created
2. ✅ Sample data is seeded
3. 🔄 Configure Supabase Auth (if not done)
4. 🔄 Test app flows in browser
5. 🔄 Upload product images
6. 🔄 Deploy to Vercel

---

## Support

For Supabase help: https://supabase.com/docs
For schema issues: Check `DATABASE_SCHEMA.md`
