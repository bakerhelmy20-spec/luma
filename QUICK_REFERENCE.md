# Luma Database - Quick Reference Guide

## 🚀 Quick Setup (5 minutes)

1. **Copy the migration**
   - Copy `supabase/migrations/schema.sql`

2. **Run in Supabase SQL Editor**
   - Go to https://supabase.com → Your Project → SQL Editor
   - Paste the schema
   - Click "Run"
   - ✅ Done! Tables created

3. **Set environment variables**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   ```

4. **Test in app**
   - Sign up a new user
   - Profile auto-creates ✨
   - Add products to cart
   - Check Supabase dashboard

---

## 📊 Table Quick Reference

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User accounts | id, email, full_name, role_id |
| `roles` | Access levels | id, name (customer/editor/admin) |

### Products
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `categories` | Product groups | id, slug, name_ar, name_en |
| `products` | Product items | id, name_ar, sku, price, stock |
| `product_images` | Photos | id, product_id, image_url |
| `product_variants` | Options | id, product_id, title_ar, title_en |

### Shopping
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `carts` | User carts | id, profile_id |
| `cart_items` | Cart contents | id, cart_id, product_id, quantity |

### Sales
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `orders` | Purchases | id, profile_id, status, total |
| `order_items` | Order lines | id, order_id, product_id, price |

### Promotions
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `coupons` | Discount codes | id, code, discount_type, value |

---

## 🔍 Common Queries

### Get all products in a category
```sql
SELECT p.* FROM products p
WHERE p.category_id = (SELECT id FROM categories WHERE slug = 'candles')
ORDER BY p.created_at DESC;
```

### Get user's cart
```sql
SELECT ci.*, p.name_en, p.price FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
JOIN products p ON ci.product_id = p.id
WHERE c.profile_id = 'USER-UUID';
```

### Get user's orders
```sql
SELECT * FROM orders 
WHERE profile_id = 'USER-UUID'
ORDER BY created_at DESC;
```

### Get order details with items
```sql
SELECT o.*, oi.product_name_en, oi.quantity, oi.price
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'ORDER-UUID';
```

### Get active coupons
```sql
SELECT * FROM coupons 
WHERE is_active = TRUE 
  AND NOW() < expiry_date
  AND (usage_count < usage_limit OR usage_limit IS NULL);
```

### Update order status
```sql
UPDATE orders SET status = 'shipped' WHERE id = 'ORDER-UUID';
```

### Create new product
```sql
INSERT INTO products (
  name_ar, name_en, slug, sku, category_id, price, stock
) VALUES (
  'شمعة أرجواني', 'Purple Candle', 'purple-candle', 
  'HM-CAN-10', (SELECT id FROM categories WHERE slug = 'candles'),
  45.00, 20
);
```

### Add product image
```sql
INSERT INTO product_images (product_id, image_url, is_primary)
VALUES ('PRODUCT-UUID', 'https://example.com/image.jpg', TRUE);
```

---

## 🔐 User Roles

| Role | Level | Permissions |
|------|-------|------------|
| **customer** | 1 | Browse products, manage own cart/orders |
| **editor** | 2 | Manage products, orders |
| **admin** | 3 | Full access to all tables |

Set role:
```sql
UPDATE profiles SET role_id = 3 WHERE email = 'admin@example.com';
-- role_id: 1=customer, 2=editor, 3=admin
```

---

## 💾 Data Examples

### Product with Variants
```json
{
  "id": "prod-123",
  "name_en": "T-Shirt",
  "price": 29.99,
  "variants": [
    { "title_en": "Red - Small", "price_override": null },
    { "title_en": "Blue - Medium", "price_override": 32.99 },
    { "title_en": "Green - Large", "price_override": null }
  ]
}
```

### Order with Shipping Address
```json
{
  "id": "order-456",
  "total": 189.99,
  "shipping_address": {
    "name": "Ahmed Mohammed",
    "email": "ahmed@example.com",
    "phone": "0501234567",
    "addressLine1": "123 King Fahd Road",
    "city": "Jeddah",
    "region": "Western",
    "postal_code": "21422",
    "country": "Saudi Arabia"
  }
}
```

### Cart State
```json
{
  "id": "cart-789",
  "items": [
    {
      "id": "item-1",
      "product_id": "prod-123",
      "quantity": 2,
      "variant_id": null
    },
    {
      "id": "item-2",
      "product_id": "prod-456",
      "quantity": 1,
      "variant_id": "var-789"
    }
  ]
}
```

---

## 🔔 Important Notes

### Bilingual Content
- All text fields have `_ar` (Arabic) and `_en` (English) versions
- Frontend switches dynamically based on user language
- Example: `name_ar`, `name_en`, `description_ar`, `description_en`

### Security
- Row Level Security (RLS) prevents users seeing other users' data
- Authenticated users needed for cart/order operations
- Public products/categories readable by anyone

### Automatic Features
- ✅ Profile auto-creates when user signs up
- ✅ Timestamps auto-update (created_at, updated_at)
- ✅ Product slug enforces uniqueness
- ✅ Order items store product snapshot (preserves history)

### Performance
- All frequently-searched fields are indexed
- Product queries by category/slug are fast
- Order queries by profile/status are optimized

---

## 🛠️ Admin SQL Commands

### Get all users
```sql
SELECT email, full_name, role_id FROM profiles ORDER BY created_at DESC;
```

### Get sales today
```sql
SELECT COUNT(*) as orders, SUM(total) as revenue FROM orders
WHERE DATE(created_at) = TODAY();
```

### Get best sellers
```sql
SELECT p.name_en, SUM(oi.quantity) as sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.id ORDER BY sold DESC LIMIT 10;
```

### Get low stock
```sql
SELECT * FROM low_stock_products ORDER BY stock ASC;
```

### Coupon usage stats
```sql
SELECT code, usage_count, usage_limit, 
  ROUND(100.0 * usage_count / usage_limit, 1) as usage_percent
FROM coupons WHERE is_active = TRUE;
```

### Recent activity
```sql
SELECT * FROM recent_orders LIMIT 20;
```

---

## 🚨 Troubleshooting

**Error: "Permission denied"**
- Check RLS policies are enabled
- Verify user is authenticated
- Check user has correct role_id

**Error: "Foreign key violation"**
- Insert category FIRST, then product
- Don't delete categories with products

**Cart appears empty**
- User must be logged in
- Check cart_items for the user's cart_id
- Verify product_id exists

**Orders not appearing**
- Check profile_id matches current user
- RLS prevents seeing other users' orders
- Admins (role_id=3) see all orders

**Images not loading**
- Check image_url format (must be valid URL)
- Test URL in browser directly
- Sample uses Unsplash (external)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DATABASE_SCHEMA.md` | Complete table definitions and relationships |
| `SETUP_DATABASE.md` | Installation and configuration guide |
| `SCHEMA_ERD.md` | Entity diagrams and data flow examples |
| `QUICK_REFERENCE.md` | This file - quick lookup |

---

## 🎯 Next Steps

1. ✅ Run schema migration
2. ✅ Verify tables in Supabase
3. 📝 Add sample products
4. 🧪 Test authentication flow
5. 🛒 Test shopping cart
6. 📦 Test order creation
7. 🎉 Deploy to production

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Schema Issues**: Check `DATABASE_SCHEMA.md`
- **Setup Help**: Check `SETUP_DATABASE.md`

---

Last Updated: 2024
Schema Version: 1.0
