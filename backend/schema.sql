-- =====================================================
-- SOATLY.UZ — TO'LIQ DATABASE SCHEMA (PostgreSQL)
-- =====================================================
-- Bu faylni cPanel > PostgreSQL > phpPgAdmin (yoki SQL Editor)
-- orqali bir martada ishga tushirish mumkin.
--
-- ICHIDA:
--   • Barcha CREATE TABLE (users, refresh_tokens, brands,
--     categories, products, product_categories, orders, order_items)
--   • Indekslar
--   • updated_at trigger funksiyasi + triggerlar
--   • Default admin foydalanuvchi (faqat shu bitta INSERT)
--
-- DEFAULT ADMIN LOGIN MA'LUMOTLARI:
--   username: superadmin_soatly
--   password: Sx7$mK9!pQ2vN&jR4#wL8
--
-- ⚠️ MUHIM: birinchi loginadan keyin parolni o'zgartiring!
-- =====================================================

BEGIN;

-- =====================================================
-- UPDATED_AT TRIGGER FUNKSIYASI
-- =====================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- AUTH: users + refresh_tokens
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- =====================================================
-- BRANDS
-- =====================================================
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255),
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CATEGORIES
-- =====================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255),
    description_uz TEXT,
    description_ru TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,

    name_uz VARCHAR(255) NOT NULL CHECK (length(trim(name_uz)) > 0),
    name_ru VARCHAR(255),

    price DECIMAL(15, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(15, 2) CHECK (original_price >= 0),

    images JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_array_length(images) > 0),

    description_uz TEXT,
    description_ru TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    featured BOOLEAN DEFAULT FALSE,
    badge VARCHAR(50),

    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT_CATEGORIES (M:N)
-- =====================================================
CREATE TABLE product_categories (
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);

-- =====================================================
-- ORDERS + ORDER_ITEMS
-- =====================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,

    customer_name VARCHAR(255) NOT NULL CHECK (length(trim(customer_name)) > 0),
    customer_phone VARCHAR(32) NOT NULL CHECK (length(trim(customer_phone)) > 0),
    customer_address TEXT,
    customer_telegram VARCHAR(64),
    notes TEXT,

    total_amount DECIMAL(15, 2) NOT NULL CHECK (total_amount >= 0),

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sold', 'cancelled')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,

    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(15, 2) NOT NULL CHECK (subtotal >= 0),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- =====================================================
-- UPDATED_AT TRIGGERLAR
-- =====================================================
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_brands_modtime
    BEFORE UPDATE ON brands
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_categories_modtime
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_products_modtime
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- =====================================================
-- DEFAULT ADMIN
-- username: superadmin_soatly
-- password: Sx7$mK9!pQ2vN&jR4#wL8
-- (bcrypt cost=12 bilan hashlangan)
-- =====================================================
INSERT INTO users (username, password_hash, role, is_active, updated_at)
VALUES (
    'superadmin_soatly',
    '$2b$12$NLOhB1h.nULRS6XJK3TMpOAe18ZFn0zRoxn.K5cWvOUN1EGYgpuZ2',
    'admin',
    TRUE,
    NOW()
)
ON CONFLICT (username) DO UPDATE
SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    is_active = TRUE,
    updated_at = NOW();

COMMIT;
