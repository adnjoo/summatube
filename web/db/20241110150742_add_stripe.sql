-- Users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    pro BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
