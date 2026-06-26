# Luma E-commerce Database Schema

## Overview
Complete database schema for a bilingual (Arabic/English) artisan product e-commerce platform built with Supabase PostgreSQL.

## Table Structure

### Core System Tables

#### `roles`
- `id` (INTEGER, PK)
- `name` (VARCHAR) - customer, editor, admin
- `description` (TEXT)

#### `profiles`
- `id` (UUID, PK) - References auth.users
- `email` (VARCHAR, UNIQUE)
- `full_name` (VARCHAR)
- `phone` (VARCHAR)
- `avatar_url` (TEXT)
- `role_id` (INTEGER, FK) - References roles
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

### Product Catalog Tables

#### `categories`
- `id` (UUID, PK)
- `slug` (VARCHAR, UNIQUE) - URL slug
- `name_ar` (VARCHAR) - Arabic name
- `name_en` (VARCHAR) - English name
- `image_url` (TEXT)
- `is_featured` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Sample Categories:**
- Candles (الشموع العطرية الفاخرة)
- Ceramics (الخزف والفخار اليدوي)
- Textiles (المنسوجات والتطريز اليدوي)
- Woodwork (الديكورات الخشبية الفنية)

#### `products`
- `id` (UUID, PK)
- `name_ar` (VARCHAR) - Arabic product name
- `name_en` (VARCHAR) - English product name
- `description_ar` (TEXT)
- `description_en` (TEXT)
- `slug` (VARCHAR, UNIQUE) - URL slug
- `sku` (VARCHAR, UNIQUE) - Stock keeping unit
- `barcode` (VARCHAR)
- `category_id` (UUID, FK) - References categories
- `price` (NUMERIC) - Selling price
- `compare_at_price` (NUMERIC) - Original/list price
- `materials` (TEXT[]) - Array of materials
- `dimensions_ar` (VARCHAR) - Arabic dimensions description
- `dimensions_en` (VARCHAR) - English dimensions description
- `weight_kg` (NUMERIC) - Weight in kilograms
- `handmade_time_days` (INTEGER) - Production time in days
- `stock` (INTEGER) - Quantity available
- `is_featured` (BOOLEAN)
- `tags` (TEXT[]) - Array of tags
- `rating` (NUMERIC 0-5) - Average rating
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `product_images`
- `id` (UUID, PK)
- `product_id` (UUID, FK) - References products
- `image_url` (TEXT) - Image URL
- `alt_text_ar` (VARCHAR)
- `alt_text_en` (VARCHAR)
- `is_primary` (BOOLEAN) - Main product image
- `sort_order` (INTEGER) - Display order
- `created_at` (TIMESTAMP)

#### `product_variants`
- `id` (UUID, PK)
- `product_id` (UUID, FK) - References products
- `title_ar` (VARCHAR) - Variant name (e.g., "Blue Size M")
- `title_en` (VARCHAR)
- `price_override` (NUMERIC) - Optional variant-specific price
- `stock_override` (INTEGER) - Optional variant-specific stock
- `sku_suffix` (VARCHAR) - Added to product SKU
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

### Shopping Cart Tables

#### `carts`
- `id` (UUID, PK)
- `profile_id` (UUID, FK) - References profiles
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `cart_items`
- `id` (UUID, PK)
- `cart_id` (UUID, FK) - References carts
- `product_id` (UUID, FK) - References products
- `variant_id` (UUID, FK, NULLABLE) - References product_variants
- `quantity` (INTEGER) - Item quantity
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

### Promotional & Discount Tables

#### `coupons`
- `id` (UUID, PK)
- `code` (VARCHAR, UNIQUE) - Coupon code (e.g., "LUMA10")
- `discount_type` (VARCHAR) - 'percentage' or 'fixed'
- `value` (NUMERIC) - Discount value
- `min_purchase` (NUMERIC) - Minimum cart total
- `max_discount` (NUMERIC, NULLABLE) - Max discount amount
- `usage_limit` (INTEGER, NULLABLE) - Total usage limit
- `usage_count` (INTEGER) - Current usage count
- `is_active` (BOOLEAN)
- `start_date` (TIMESTAMP)
- `expiry_date` (TIMESTAMP, NULLABLE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

### Order Tables

#### `orders`
- `id` (UUID, PK)
- `order_number` (VARCHAR, UNIQUE) - e.g., "ORD-928172-209"
- `profile_id` (UUID, FK, NULLABLE) - References profiles
- `status` (VARCHAR) - pending, processing, shipped, delivered, cancelled
- `shipping_method` (VARCHAR) - Shipping type
- `shipping_cost` (NUMERIC) - Shipping fee
- `discount_amount` (NUMERIC) - Total discount applied
- `subtotal` (NUMERIC) - Before shipping & discount
- `total` (NUMERIC) - Final total
- `shipping_address` (JSONB) - Complete address object
- `notes` (TEXT, NULLABLE) - Order notes
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Shipping Address Structure:**
```json
{
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "0512345678",
  "addressLine1": "Street address",
  "city": "City name",
  "region": "Region/State",
  "postal_code": "Postal code",
  "country": "Country"
}
```

#### `order_items`
- `id` (UUID, PK)
- `order_id` (UUID, FK) - References orders
- `product_id` (UUID, FK) - References products
- `variant_id` (UUID, FK, NULLABLE) - References product_variants
- `product_name_ar` (VARCHAR) - Snapshot of name
- `product_name_en` (VARCHAR)
- `sku` (VARCHAR) - Snapshot of SKU
- `price` (NUMERIC) - Price at time of order
- `quantity` (INTEGER)
- `total` (NUMERIC) - Line item total
- `created_at` (TIMESTAMP)

---

## Key Features

### 1. Bilingual Support
- All text fields have `_ar` (Arabic) and `_en` (English) suffixes
- Frontend can switch languages seamlessly

### 2. Row Level Security (RLS)
- Users can only view their own profiles, carts, and orders
- Editors and admins have elevated access
- Products and coupons are publicly readable

### 3. Data Integrity
- Foreign key constraints prevent orphaned records
- CHECK constraints for valid status values and positive prices
- UNIQUE constraints on codes and SKUs

### 4. Performance Optimization
- Indexes on frequently searched fields:
  - Product slug, category, featured status, creation date
  - Order status, profile, creation date
  - Cart and item lookups

### 5. Audit Trail
- All tables have `created_at` and `updated_at` timestamps
- Automatic timestamp updates via triggers
- Helps track changes and sort by recency

### 6. Historical Data
- Order items store product snapshots (name, price) at purchase time
- Allows viewing order history even if product details change

---

## Sample Queries

### Get featured products in a category
```sql
SELECT * FROM products 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'candles')
  AND is_featured = TRUE
ORDER BY created_at DESC;
```

### Get user's cart with product details
```sql
SELECT 
  ci.id,
  ci.quantity,
  p.name_en,
  p.price,
  pv.title_en,
  pv.price_override
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
JOIN products p ON ci.product_id = p.id
LEFT JOIN product_variants pv ON ci.variant_id = pv.id
WHERE c.profile_id = 'user-uuid'
ORDER BY ci.created_at DESC;
```

### Get order with items and customer
```sql
SELECT 
  o.*,
  p.full_name,
  p.email
FROM orders o
LEFT JOIN profiles p ON o.profile_id = p.id
WHERE o.id = 'order-uuid';
```

### Get available coupons
```sql
SELECT * FROM coupons 
WHERE is_active = TRUE
  AND NOW() BETWEEN start_date AND expiry_date
  AND (usage_count < usage_limit OR usage_limit IS NULL);
```

---

## Migrations

Run the schema migration via Supabase:
1. Copy `supabase/migrations/schema.sql`
2. Execute in Supabase SQL editor
3. Or use Supabase CLI: `supabase db push`

---

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

