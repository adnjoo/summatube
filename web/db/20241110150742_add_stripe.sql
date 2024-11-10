-- Minimal Users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Customers table for Stripe customer ID
CREATE TABLE public.customers (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    stripe_customer_id TEXT
);

-- Minimal Products table
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    active BOOLEAN,
    name TEXT
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.products FOR SELECT USING (TRUE);

-- Minimal Prices table
CREATE TABLE public.prices (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products,
    active BOOLEAN,
    unit_amount BIGINT,
    currency TEXT CHECK (char_length(currency) = 3)
);
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.prices FOR SELECT USING (TRUE);

-- Minimal Subscriptions table
CREATE TABLE public.subscriptions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT,
    price_id TEXT REFERENCES public.prices
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can view own subs data" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Minimal real-time publication for products and prices
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.products, public.prices;
