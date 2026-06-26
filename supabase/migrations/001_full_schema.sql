-- =========================================================================
-- LUMA E-COMMERCE DATABASE SCHEMA - COMPLETE MIGRATION
-- =========================================================================
-- This migration creates all tables, functions, triggers, and RLS policies
-- for the Luma handmade/artisan product store with bilingual support
-- =========================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. ROLES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'customer', 'editor', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed basic roles
INSERT INTO roles (name) VALUES ('customer'), ('editor'), ('admin') ON CONFLICT DO NOTHING;

-- =========================================================================
-- 2. PROFILES TABLE (Extends Supabase auth.users)
-- =========================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) DEFAULT 1 NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
-- 3. CATEGORIES & SUB-CATEGORIES
-- =========================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS sub_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
-- 4. PRODUCTS & VARIANTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sub_category_id UUID REFERENCES sub_categories(id) ON DELETE SET NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= price),
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    handmade_time_days INTEGER DEFAULT 1 NOT NULL,
    materials VARCHAR(255)[],
    dimensions_ar VARCHAR(100),
    dimensions_en VARCHAR(100),
    weight_kg NUMERIC(6, 3),
    tags VARCHAR(50)[],
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    title_ar VARCHAR(100) NOT NULL,
    title_en VARCHAR(100) NOT NULL,
    price_override NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
    safety_threshold INTEGER DEFAULT 5 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_product_variant_inv UNIQUE (product_id, variant_id)
);

-- =========================================================================
-- 5. WISHLIST & CARTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_wishlist_product UNIQUE (profile_id, product_id)
);

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    guest_session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_cart UNIQUE (profile_id),
    CONSTRAINT unique_guest_cart UNIQUE (guest_session_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_cart_product_variant UNIQUE (cart_id, product_id, variant_id)
);

-- =========================================================================
-- 6. COUPONS
-- =========================================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    value NUMERIC(10, 2) NOT NULL CHECK (value > 0),
    min_purchase NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    max_discount NUMERIC(10, 2),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
-- 7. ORDERS & CHECKOUT FLOW
-- =========================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    shipping_cost NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    shipping_method VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(255),
    estimated_delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_ar VARCHAR(255) NOT NULL,
    product_name_en VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
-- 8. PAYMENTS & ADDRESSES
-- =========================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    raw_gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
-- 9. REVIEWS & CUSTOMER SUPPORT
-- =========================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_urls TEXT[],
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread' NOT NULL CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
-- 10. SYSTEM & CMS CONFIGURATIONS
-- =========================================================================
CREATE TABLE IF NOT EXISTS hero_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url_ar TEXT NOT NULL,
    image_url_en TEXT NOT NULL,
    title_ar VARCHAR(255),
    title_en VARCHAR(255),
    subtitle_ar VARCHAR(255),
    subtitle_en VARCHAR(255),
    link_url TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    body_ar TEXT NOT NULL,
    body_en TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
-- DATABASE TRIGGERS & UTILITY FUNCTIONS
-- =========================================================================

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically decrement inventory upon order item creation
CREATE OR REPLACE FUNCTION decrement_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE product_inventory 
    SET stock = stock - NEW.quantity
    WHERE product_id = NEW.product_id 
      AND (variant_id = NEW.variant_id OR (variant_id IS NULL AND NEW.variant_id IS NULL));
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_decrement_inventory ON order_items;
CREATE TRIGGER trigger_decrement_inventory AFTER INSERT ON order_items FOR EACH ROW EXECUTE FUNCTION decrement_inventory_on_order();

-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all user-specific tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Everyone can read, users can update own
DROP POLICY IF EXISTS "Public profiles are readable" ON profiles;
CREATE POLICY "Public profiles are readable" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products: Everyone reads active products
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage all products" ON products;
CREATE POLICY "Admins manage all products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = 3)
);

-- Product Images: Readable by all
DROP POLICY IF EXISTS "Product images readable" ON product_images;
CREATE POLICY "Product images readable" ON product_images FOR SELECT USING (true);

-- Carts: Users manage own carts
DROP POLICY IF EXISTS "Users manage own carts" ON carts;
CREATE POLICY "Users manage own carts" ON carts FOR ALL USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Guest carts readable" ON carts;
CREATE POLICY "Guest carts readable" ON carts FOR SELECT USING (guest_session_id IS NOT NULL);

-- Cart Items: Manageable via cart access
DROP POLICY IF EXISTS "Cart items via cart" ON cart_items;
CREATE POLICY "Cart items via cart" ON cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM carts WHERE id = cart_items.cart_id AND (profile_id = auth.uid() OR guest_session_id IS NOT NULL))
);

-- Orders: Users view own, admins view all
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (profile_id = auth.uid() OR profile_id IS NULL);

DROP POLICY IF EXISTS "Admins manage orders" ON orders;
CREATE POLICY "Admins manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = 3)
);

-- Order Items: Via order access
DROP POLICY IF EXISTS "Order items readable via order" ON order_items;
CREATE POLICY "Order items readable via order" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND (profile_id = auth.uid() OR profile_id IS NULL))
);

-- Wishlist: Users manage own
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlist;
CREATE POLICY "Users manage own wishlist" ON wishlist FOR ALL USING (profile_id = auth.uid());

-- Addresses: Users manage own
DROP POLICY IF EXISTS "Users manage own addresses" ON addresses;
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (profile_id = auth.uid());

-- Reviews: Readable by all, users create own
DROP POLICY IF EXISTS "Reviews readable" ON reviews;
CREATE POLICY "Reviews readable" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users create own reviews" ON reviews;
CREATE POLICY "Users create own reviews" ON reviews FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Payments: Via order access
DROP POLICY IF EXISTS "Payments readable via order" ON payments;
CREATE POLICY "Payments readable via order" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = payments.order_id AND (profile_id = auth.uid() OR profile_id IS NULL))
);

-- =========================================================================
-- PERFORMANCE INDEXES
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_profile ON orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_profile ON wishlist(profile_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_product ON product_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- =========================================================================
-- SEED DATA (Sample Categories & Products)
-- =========================================================================

-- Sample Categories
INSERT INTO categories (slug, name_ar, name_en, image_url, is_featured, sort_order)
VALUES 
  ('pottery', 'الفخار', 'Pottery', NULL, true, 1),
  ('textiles', 'المنسوجات', 'Textiles', NULL, true, 2),
  ('jewelry', 'المجوهرات', 'Jewelry', NULL, true, 3),
  ('home-decor', 'ديكور المنزل', 'Home Decor', NULL, false, 4)
ON CONFLICT DO NOTHING;

-- =========================================================================
-- SETUP COMPLETE
-- =========================================================================
-- All tables, triggers, RLS policies, and indexes have been created.
-- The database is ready for production use.
-- =========================================================================
