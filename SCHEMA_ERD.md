# Entity Relationship Diagram (ERD)

## Database Relationship Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                         │
│                      (Supabase Auth)                            │
│                        auth.users                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ extends with
                           ▼
        ┌──────────────────────────────────┐
        │         profiles (PK: id)        │
        ├──────────────────────────────────┤
        │ id (UUID)                        │
        │ email (UNIQUE)                   │
        │ full_name                        │
        │ phone                            │
        │ avatar_url                       │
        │ role_id (FK) ───────────────────┐│
        │ created_at                       ││
        │ updated_at                       ││
        └──────────────────────────────────┘│
                   │                        │
                   │                        │
      ┌────────────┼────────────┬──────────┘
      │ has one    │ has many   │
      │            │            │
      ▼            ▼            ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │  roles  │  │  carts   │  │ orders   │
   │ PK: id  │  │PK: id    │  │PK: id    │
   └─────────┘  │FK: prof..│  │FK: prof..│
                └────┬─────┘  │ status   │
                     │        │ total    │
              has many│        └──────────┘
                     │            │
                     ▼            │ has many
           ┌──────────────────┐   │
           │  cart_items      │   ▼
           │  (PK: id)        │ ┌──────────────┐
           ├──────────────────┤ │ order_items  │
           │ cart_id (FK)     │ │ (PK: id)     │
           │ product_id (FK)──┼─┼─FK product  │
           │ variant_id (FK)  │ │ price        │
           │ quantity         │ │ quantity     │
           └──────────────────┘ └──────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    PRODUCT CATALOG                             │
└────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │  categories (PK: id)         │
    ├──────────────────────────────┤
    │ id (UUID)                    │
    │ slug (UNIQUE)                │
    │ name_ar / name_en            │
    │ image_url                    │
    │ is_featured                  │
    └────────┬─────────────────────┘
             │ contains many
             │
             ▼
    ┌──────────────────────────────────────┐
    │    products (PK: id)                 │
    ├──────────────────────────────────────┤
    │ id (UUID)                            │
    │ name_ar / name_en                    │
    │ slug (UNIQUE)                        │
    │ sku (UNIQUE)                         │
    │ price                                │
    │ compare_at_price                     │
    │ stock                                │
    │ rating                               │
    │ materials (TEXT[])                   │
    │ dimensions_ar / dimensions_en        │
    │ weight_kg                            │
    │ handmade_time_days                   │
    │ is_featured                          │
    │ tags (TEXT[])                        │
    │ category_id (FK) ──────────────────┐ │
    │ created_at / updated_at            │ │
    └──────┬────────────┬─────────────────┼─┘
           │            │                 │
      has  │            │            FK constraint
      many │       has  │              to categories
           │       many │
           ▼            ▼
    ┌─────────────────┐  ┌──────────────────────┐
    │product_images   │  │product_variants      │
    │(PK: id)         │  │(PK: id)              │
    ├─────────────────┤  ├──────────────────────┤
    │product_id (FK)  │  │product_id (FK)       │
    │image_url        │  │title_ar / title_en   │
    │alt_text_ar/en   │  │price_override        │
    │is_primary       │  │stock_override        │
    │sort_order       │  │sku_suffix            │
    └─────────────────┘  └──────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    PROMOTIONS                                  │
└────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │  coupons (PK: id)            │
    ├──────────────────────────────┤
    │ id (UUID)                    │
    │ code (UNIQUE)                │
    │ discount_type (percentage|   │
    │   fixed)                     │
    │ value                        │
    │ min_purchase                 │
    │ max_discount                 │
    │ usage_limit                  │
    │ usage_count                  │
    │ is_active                    │
    │ start_date / expiry_date     │
    └──────────────────────────────┘
      (Applied in checkout, not stored
       in orders or order_items)

┌────────────────────────────────────────────────────────────────┐
│                    ORDERS (Sales History)                      │
└────────────────────────────────────────────────────────────────┘

    Profile ──┐
              │ may place
              ▼
    ┌──────────────────────────────────┐
    │    orders (PK: id)               │
    ├──────────────────────────────────┤
    │ id (UUID)                        │
    │ order_number (UNIQUE)            │
    │ profile_id (FK, NULLABLE)        │
    │ status (pending|processing|      │
    │   shipped|delivered|cancelled)   │
    │ shipping_method                  │
    │ shipping_cost                    │
    │ discount_amount                  │
    │ subtotal                         │
    │ total                            │
    │ shipping_address (JSONB)         │
    │ notes                            │
    │ created_at / updated_at          │
    └────────┬─────────────────────────┘
             │ contains many
             │ (one-to-many)
             ▼
    ┌──────────────────────────────┐
    │  order_items (PK: id)        │
    ├──────────────────────────────┤
    │ id (UUID)                    │
    │ order_id (FK)                │
    │ product_id (FK)              │
    │ variant_id (FK, NULLABLE)    │
    │ product_name_ar/en           │ ◄── Snapshot at order time
    │ sku                          │     (preserves history)
    │ price                        │
    │ quantity                     │
    │ total                        │
    │ created_at                   │
    └──────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    DATA RELATIONSHIPS SUMMARY                  │
└────────────────────────────────────────────────────────────────┘

1:Many Relationships:
  ├─ roles          → profiles           (admin/editor/customer)
  ├─ categories     → products           (products in categories)
  ├─ products       → product_images     (product gallery)
  ├─ products       → product_variants   (size/color variants)
  ├─ profiles       → carts              (shopping cart per user)
  ├─ carts          → cart_items         (items in cart)
  ├─ products       → cart_items         (via cart_items FK)
  ├─ products       → order_items        (via order_items FK)
  ├─ profiles       → orders             (user's order history)
  └─ orders         → order_items        (items in order)

Data Isolation (via RLS):
  ├─ Users see only their own profiles
  ├─ Users see only their own carts
  ├─ Users see only their own orders
  ├─ Admins/editors see all orders
  └─ Products/categories/coupons are public

Snapshots (for history):
  └─ order_items store product name/price at order time
     (protects history if product changes)

Cascading:
  ├─ Delete profile → delete cart, cart_items, orders
  ├─ Delete category → cannot delete (RESTRICT)
  ├─ Delete product → delete product_images, cart_items, order_items
  └─ Delete order → delete order_items

```

## Data Flow Examples

### Example 1: Customer Registration → Shopping

```
1. User signs up via Supabase Auth
   ↓ (trigger fires)
2. Profile created automatically in profiles table
   ↓
3. User browses categories → SELECT * FROM categories
   ↓
4. User views products → SELECT * FROM products WHERE category_id = ...
   ↓
5. User adds to cart:
   a. Find/create cart: SELECT id FROM carts WHERE profile_id = user_id
   b. Insert into cart_items: INSERT INTO cart_items (cart_id, product_id, quantity)
   ↓
6. User applies coupon:
   a. Validate coupon: SELECT * FROM coupons WHERE code = ... AND is_active = TRUE
   b. Calculate discount (stored in memory, not DB)
   ↓
7. User checks out:
   a. Create order: INSERT INTO orders (profile_id, total, shipping_address, ...)
   b. For each cart item:
      i. Get product snapshot: SELECT name_en, price, sku FROM products
      ii. Insert order_item: INSERT INTO order_items (order_id, product_id, price, ...)
   c. Clear cart: DELETE FROM cart_items WHERE cart_id = ...
   d. Update coupon usage: UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ...
```

### Example 2: Admin Order Management

```
1. Admin views orders:
   SELECT * FROM orders 
   LEFT JOIN order_items ON orders.id = order_items.order_id
   LEFT JOIN products ON order_items.product_id = products.id
   WHERE admin_accessible = TRUE
   ↓
2. Admin updates order status:
   UPDATE orders SET status = 'shipped' WHERE id = order_id
   (trigger updates updated_at automatically)
   ↓
3. Admin views order details:
   SELECT * FROM orders WHERE id = order_id
   → Get shipping_address from JSONB field
   → Get order_items with historical product data
```

### Example 3: Product Management

```
1. Admin adds new product:
   a. Create category (if needed)
   b. INSERT INTO products (name_ar, name_en, slug, sku, category_id, price, ...)
   c. Get product ID from inserted row
   d. INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
   e. Optionally: INSERT INTO product_variants (product_id, title_en, ...)
   ↓
2. Admin updates product:
   UPDATE products SET stock = 10, price = 50.00 WHERE id = product_id
   (affects new purchases, not historical orders)
   ↓
3. Admin manages stock:
   SELECT * FROM low_stock_products (view)
   ↓ Update stock if low
   UPDATE products SET stock = stock + 50 WHERE id = product_id
```

## Performance Considerations

### Indexed Columns (Fast Lookups)
- products.slug, products.category_id, products.is_featured
- products.created_at (for sorting)
- categories.slug
- orders.profile_id, orders.status, orders.created_at
- coupons.code, coupons.is_active

### Query Optimization Tips
1. **List Products**: Use indexes on category_id + is_featured
2. **Search Products**: Index on slug for direct lookup
3. **User Orders**: Index on profile_id + created_at DESC
4. **Coupon Validation**: Index on code + is_active

### Potential Bottlenecks
- **Large product lists**: Add pagination (LIMIT 20 OFFSET 0)
- **Order history**: Index on created_at for sorting
- **Image galleries**: Load images lazily in frontend

---

## Table Statistics Reference

| Table | Rows (Sample) | Row Size | Purpose |
|-------|--------------|----------|---------|
| categories | 10 | ~300 bytes | Product grouping |
| products | 1,000 | ~1.5 KB | Product catalog |
| product_images | 5,000 | ~500 bytes | Product photos |
| product_variants | 2,000 | ~400 bytes | Size/color options |
| coupons | 50 | ~600 bytes | Discount codes |
| profiles | 10,000 | ~700 bytes | User data |
| carts | 5,000 | ~200 bytes | Active shopping carts |
| cart_items | 15,000 | ~300 bytes | Cart contents |
| orders | 5,000 | ~1.2 KB | Order records |
| order_items | 20,000 | ~600 bytes | Order line items |

---

## Security Notes

1. **RLS Enabled**: Prevents unauthorized data access
2. **FK Constraints**: Protects referential integrity
3. **Unique Constraints**: SKU, product slug, coupon code duplication prevented
4. **CHECK Constraints**: Price > 0, valid status values
5. **JSONB for Flexibility**: Shipping addresses can vary without schema changes

