-- Project 3DFV seed data.
-- Uses gen_random_uuid() for UUID primary keys.
-- Safe to run multiple times (idempotent).

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Roles ──────────────────────────────────────────────────────────────────
INSERT INTO roles (id, name, description, is_deleted)
VALUES
(gen_random_uuid(), 'customer', 'Regular customer who can browse menu, place orders, rate items, and submit feedback', false),
(gen_random_uuid(), 'content_admin', 'Staff role that manages categories, menu items, AR/3D assets, deals, deal items, ratings, and feedback', false),
(gen_random_uuid(), 'order_manager', 'Staff role that manages orders, order status, payments, inventory reference, and order history', false),
(gen_random_uuid(), 'super_admin', 'Full access administrator who manages users, roles, content, orders, deleted records, and restore operations', false)
ON CONFLICT (name) DO NOTHING;

-- ─── Menu Categories ────────────────────────────────────────────────────────
INSERT INTO menu_categories (id, name, description, display_order, is_active, is_deleted)
VALUES
(gen_random_uuid(), 'Burgers',    'Burger menu items',            1, true, false),
(gen_random_uuid(), 'Pizza',      'Pizza menu items',             2, true, false),
(gen_random_uuid(), 'Drinks',     'Beverages and cold drinks',    3, true, false),
(gen_random_uuid(), 'Fries',      'French fries and loaded fries',4, true, false),
(gen_random_uuid(), 'Wraps',      'Wraps and rolls',              5, true, false),
(gen_random_uuid(), 'Sandwiches', 'Sandwiches and subs',          6, true, false)
ON CONFLICT DO NOTHING;

-- ─── Menu Items ─────────────────────────────────────────────────────────────
-- Uses sub-select so category UUIDs are resolved automatically.
INSERT INTO menu_items
  (id, name, description, price, image_url, ar_enabled, is_available, rating_avg, rating_count, is_deleted, category_id)
SELECT
  gen_random_uuid(),
  v.name,
  v.description,
  v.price::numeric,
  v.image_url,
  false,
  true,
  0,
  0,
  false,
  (SELECT id FROM menu_categories WHERE name = v.cat_name LIMIT 1)
FROM (VALUES
  ('Classic Beef Burger',
   'Juicy beef patty with cheese, lettuce, tomato, onions, and special burger sauce.',
   650,
   'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
   'Burgers'),
  ('Crispy Chicken Burger',
   'Crispy fried chicken fillet with lettuce, mayo, and soft burger bun.',
   550,
   'https://images.unsplash.com/photo-1606755962773-d324e2a13086',
   'Burgers'),
  ('Chicken Tikka Pizza',
   'Fresh pizza topped with chicken tikka, cheese, onions, capsicum, and pizza sauce.',
   1200,
   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
   'Pizza'),
  ('Cheese Lover Pizza',
   'Loaded with mozzarella cheese and classic tomato pizza sauce.',
   1100,
   'https://images.unsplash.com/photo-1513104890138-7c749659a591',
   'Pizza'),
  ('Loaded Fries',
   'Crispy fries topped with cheese sauce, chicken chunks, and spicy mayo.',
   450,
   'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d',
   'Fries'),
  ('Chicken Wrap',
   'Soft tortilla wrap filled with grilled chicken, lettuce, sauces, and vegetables.',
   500,
   'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
   'Wraps'),
  ('Club Sandwich',
   'Triple-layer sandwich with chicken, egg, cheese, lettuce, and mayo.',
   600,
   'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
   'Sandwiches'),
  ('Cold Drink',
   'Chilled soft drink served with your meal.',
   150,
   'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
   'Drinks')
) AS v(name, description, price, image_url, cat_name)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items mi WHERE mi.name = v.name AND mi.is_deleted = false
);

-- ─── Super Admin User ───────────────────────────────────────────────────────
-- Password: Admin@1234  (bcrypt hash)
INSERT INTO users (id, email, full_name, password_hash, is_active, is_deleted, role_id)
SELECT
  gen_random_uuid(),
  'admin@3dfv.pk',
  'Super Admin',
  '$2b$12$BJLNJdLFZv32Dp8Q1BeUeuFeT5Vd4jSPw3LSQbyunuV0cvom2/UYK',
  true,
  false,
  (SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@3dfv.pk'
);

-- ─── Payment Gateways ──────────────────────────────────────────────────────
INSERT INTO payment_gateways (id, name, code, is_active, is_deleted)
VALUES
(gen_random_uuid(), 'Cash', 'cash', true, false),
(gen_random_uuid(), 'Card Terminal', 'card_terminal', true, false)
ON CONFLICT (code) DO NOTHING;
