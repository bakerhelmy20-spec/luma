-- Luma E-commerce Database Schema
-- Bilingual artisanal product store (Arabic & English)

-- ==========================================
-- CORE SYSTEM TABLES
-- ==========================================

-- Roles table (for role-based access control)
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
  ('customer', 'Regular customer'),
  ('editor', 'Content editor'),
  ('admin', 'Administrator')
ON CONFLICT DO NOTHING;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  role_id INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PRODUCT CATALOG TABLES
-- ==========================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(50),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  compare_at_price NUMERIC(10, 2),
  materials TEXT[], -- Array of material names
  dimensions_ar VARCHAR(255),
  dimensions_en VARCHAR(255),
  weight_kg NUMERIC(6, 2),
  handmade_time_days INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  rating NUMERIC(3, 1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text_ar VARCHAR(255),
  alt_text_en VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product variants table (for color, size, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  price_override NUMERIC(10, 2),
  stock_override INTEGER,
  sku_suffix VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SHOPPING CART TABLES
-- ==========================================

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PROMOTIONAL & DISCOUNT TABLES
-- ==========================================

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value NUMERIC(10, 2) NOT NULL CHECK (value > 0),
  min_purchase NUMERIC(10, 2) DEFAULT 0,
  max_discount NUMERIC(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ORDER TABLES
-- ==========================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_method VARCHAR(50),
  shipping_cost NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  subtotal NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  
  -- Shipping address (JSONB for flexibility)
  shipping_address JSONB,
  
  -- Order metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Snapshot of product data at time of order (for historical record)
  product_name_ar VARCHAR(255) NOT NULL,
  product_name_en VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total NUMERIC(10, 2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Product search/filter indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Category indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_featured ON categories(is_featured);

-- Cart indexes
CREATE INDEX idx_carts_profile_id ON carts(profile_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Order indexes
CREATE INDEX idx_orders_profile_id ON orders(profile_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Coupon indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);

-- Product images indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON product_images(is_primary);

-- Product variants indexes
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Users can only see their own profile
CREATE POLICY profiles_self_access ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_admin_access ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = 3
    )
  );

-- Carts RLS: Users can only see their own cart
CREATE POLICY carts_self_access ON carts
  FOR ALL USING (auth.uid() = profile_id);

-- Cart items RLS: Inherits from cart
CREATE POLICY cart_items_self_access ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts WHERE id = cart_id AND profile_id = auth.uid()
    )
  );

-- Orders RLS: Users can only see their own orders
CREATE POLICY orders_self_access ON orders
  FOR SELECT USING (auth.uid() = profile_id);

-- Admins can access all orders
CREATE POLICY orders_admin_access ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id IN (2, 3)
    )
  );

-- Order items RLS: Inherit from orders
CREATE POLICY order_items_self_access ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND (profile_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id IN (2, 3)))
    )
  );

-- Products, categories, coupons are readable by everyone (no RLS needed)
-- Images and variants are public since they reference public products

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role_id)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
    1 -- Default to customer role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Apply timestamp trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- SAMPLE DATA (Optional)
-- ==========================================

-- Insert sample categories
INSERT INTO categories (slug, name_ar, name_en, image_url, is_featured) VALUES
  ('candles', 'الشموع العطرية الفاخرة', 'Artisanal Candles', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600', TRUE),
  ('ceramics', 'الخزف والفخار اليدوي', 'Artisan Ceramics', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600', TRUE),
  ('textiles', 'المنسوجات والتطريز اليدوي', 'Embroidery & Textiles', 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=600', TRUE),
  ('woodwork', 'الديكورات الخشبية الفنية', 'Artisanal Woodwork', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name_ar, name_en, description_ar, description_en, slug, sku, category_id, price, compare_at_price, materials, dimensions_ar, dimensions_en, weight_kg, handmade_time_days, stock, is_featured, tags, rating)
SELECT
  'شمعة اللافندر والبرغموت في كوب فخاري',
  'Lavender & Bergamot Clay Candle',
  'شمعة معطرة مصنوعة يدويًا بنسبة 100% من شمع الصويا الطبيعي، مصبوبة بعناية في كوب فخاري تم تشكيله وتلوينه يدويًا.',
  'A 100% natural soy wax scented candle, hand-poured into a custom handmade ceramic vessel.',
  'lavender-bergamot-clay-candle',
  'HM-CAN-01',
  (SELECT id FROM categories WHERE slug = 'candles'),
  45.00,
  60.00,
  ARRAY['شمع الصويا الطبيعي', 'زيوت عطرية نقية', 'وعاء طين فخاري'],
  'ارتفاع 8 سم، قطر 7 سم',
  '8cm Height, 7cm Diameter',
  0.350,
  2,
  15,
  TRUE,
  ARRAY['شمعة', 'لافندر', 'فخار'],
  4.8
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'HM-CAN-01');

-- Similar inserts for other products can be added here
-- The schema is ready to accept product data from the app or admin panel

-- ==========================================
-- VIEWS (Optional but helpful)
-- ==========================================

-- View for recent orders with customer and item details
CREATE OR REPLACE VIEW recent_orders AS
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total,
  p.full_name as customer_name,
  p.email as customer_email,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN profiles p ON o.profile_id = p.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, p.id
ORDER BY o.created_at DESC;

-- View for low stock products
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  id,
  name_ar,
  name_en,
  sku,
  stock,
  price
FROM products
WHERE stock < 10
ORDER BY stock ASC;
