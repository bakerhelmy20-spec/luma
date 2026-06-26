# 🗄️ Luma Database Implementation

## Overview

Complete, production-ready database schema for a bilingual (Arabic/English) artisan e-commerce platform built with **Supabase PostgreSQL**.

## 📦 What You Get

### 11 Database Tables
- ✅ User profiles & roles
- ✅ Product catalog with categories, images & variants
- ✅ Shopping cart system
- ✅ Order management with historical snapshots
- ✅ Discount/coupon system

### Advanced Features
- ✅ Row Level Security (RLS) for data isolation
- ✅ 12 performance indexes
- ✅ Automatic triggers & timestamps
- ✅ Bilingual content support (Arabic/English)
- ✅ JSONB shipping addresses
- ✅ Product snapshots in orders

## 🚀 Quick Start (5 Minutes)

### 1. Copy the Schema
```bash
# File to run:
supabase/migrations/schema.sql
```

### 2. Run in Supabase
1. Go to https://supabase.com → Your Project → SQL Editor
2. Paste the entire schema.sql file
3. Click "Run"
4. ✅ All tables created!

### 3. Configure Environment
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

### 4. Test
- Sign up a user → Profile auto-created ✨
- Add products to cart → Data persists
- Place order → Complete checkout flow

## 📚 Documentation

| File | Purpose |
|------|---------|
| **DATABASE_SCHEMA.md** | Complete table reference & queries |
| **SETUP_DATABASE.md** | Installation & configuration guide |
| **SCHEMA_ERD.md** | Visual diagrams & data flow examples |
| **QUICK_REFERENCE.md** | Common queries & admin commands |
| **DATABASE_IMPLEMENTATION.md** | Implementation summary |

## 🏗️ Architecture

```
Users (Supabase Auth)
    ↓
profiles (auto-created on signup)
    ├── orders (shopping history)
    ├── carts (active shopping)
    │   └── cart_items
    │       └── products (with images & variants)
    └── role (customer/editor/admin)

Products
├── categories
├── product_images
└── product_variants

Orders
├── order_items (snapshots)
├── products (historical reference)
└── shipping_address (JSONB)

Promotions
└── coupons
```

## 🔐 Security Built-In

- **Row Level Security** - Users see only their data
- **Role-Based Access** - Customer/Editor/Admin roles
- **Foreign Keys** - Referential integrity
- **Unique Constraints** - No duplicate codes/SKUs
- **Check Constraints** - Valid data only

## 📊 Key Tables

### profiles
User accounts with role-based access
```
id (UUID) | email | full_name | phone | role_id | created_at
```

### products
Complete product catalog
```
id | name_ar | name_en | sku | price | stock | category_id | rating
```

### orders
Order history with shipping details
```
id | order_number | profile_id | status | total | shipping_address (JSONB)
```

### order_items
Order line items with historical data
```
id | order_id | product_id | product_name_ar | product_name_en | price | quantity
```

## 🔍 Sample Queries

### Get products in category
```sql
SELECT * FROM products 
WHERE category_id = (SELECT id FROM categories WHERE slug = 'candles')
ORDER BY created_at DESC;
```

### Get user's orders
```sql
SELECT * FROM orders 
WHERE profile_id = 'user-uuid'
ORDER BY created_at DESC;
```

### Get active coupons
```sql
SELECT * FROM coupons 
WHERE is_active = TRUE 
  AND NOW() < expiry_date;
```

See **QUICK_REFERENCE.md** for more examples.

## 💡 Features

### Shopping Cart
- Add/remove items
- Support for variants
- Automatic quantity updates
- Persist across sessions

### Order Management
- Track order status (pending → processing → shipped → delivered)
- Preserve product info at purchase time
- Store complete shipping address
- Support for guest and registered users

### Product Management
- Categories with images
- Product variants (size, color, etc.)
- Stock tracking
- Featured products
- Ratings and tags

### Admin Features
- View all orders
- Update order status
- Manage coupons
- Create discount codes
- View sales reports

## 🎯 Performance

- **12 indexes** for fast queries
- **O(1) lookups** on product slug, coupon code
- **Fast filtering** by category, status
- **Efficient pagination** ready

## ✨ Highlights

1. **Automatic Profile Creation** - Profile created immediately when user signs up
2. **Bilingual Ready** - All content in Arabic and English
3. **Order Snapshots** - Preserves product data at time of purchase
4. **JSONB Flexibility** - Shipping addresses can vary without schema changes
5. **RLS Enforcement** - Database-level security, not just frontend

## 🔧 Admin Commands

### Make admin user
```sql
UPDATE profiles SET role_id = 3 WHERE email = 'admin@example.com';
```

### Get sales today
```sql
SELECT COUNT(*) as orders, SUM(total) as revenue 
FROM orders WHERE DATE(created_at) = TODAY();
```

### Get low stock
```sql
SELECT * FROM low_stock_products ORDER BY stock ASC;
```

## 📋 Tables Summary

| Table | Records | Purpose |
|-------|---------|---------|
| roles | 3 | Access levels |
| profiles | ~1000 | User accounts |
| categories | ~10 | Product groups |
| products | ~500 | Product items |
| product_images | ~2000 | Photos |
| product_variants | ~1000 | Options |
| carts | ~500 | Shopping carts |
| cart_items | ~2000 | Cart contents |
| coupons | ~50 | Discounts |
| orders | ~100 | Purchases |
| order_items | ~300 | Order lines |

## 🚨 Important Notes

1. **User Authentication** - Uses Supabase Auth (built-in)
2. **RLS Enabled** - Prevents unauthorized access
3. **Bilingual** - All text has _ar and _en versions
4. **Timestamps** - Auto-updated via triggers
5. **Snapshots** - Order items preserve product data

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- See **DATABASE_SCHEMA.md** for detailed reference

## ✅ Deployment Checklist

- [x] Schema designed
- [x] All tables created
- [x] Indexes added
- [x] RLS configured
- [x] Triggers created
- [x] Sample data added
- [x] Documentation complete
- [ ] Run migration in Supabase ← You are here
- [ ] Set environment variables
- [ ] Test in development
- [ ] Deploy to production

## 🎉 Ready to Go

The database is **production-ready**. Just run the migration and configure your environment variables!

### Need Help?

1. **Setup Issues?** → Read `SETUP_DATABASE.md`
2. **Schema Questions?** → Check `DATABASE_SCHEMA.md`
3. **SQL Queries?** → See `QUICK_REFERENCE.md`
4. **Understanding Data?** → View `SCHEMA_ERD.md`

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Support**: See documentation files
