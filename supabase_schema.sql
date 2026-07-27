-- ========================================================
-- AYGÜN OTO YIKAMA - SUPABASE VERİTABANI KURULUM KODLARI
-- Bu kodları Supabase paneli -> SQL Editor sayfasına yapıştırıp "Run" butonuna basın.
-- ========================================================

-- 1. Hizmetler Tablosu (Varsayılan Yıkama & Detaylı İşlem Fiyatları)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Binek',
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Gelirler (Hızlı Yıkama & İşlem Kayıtları) Tablosu
CREATE TABLE IF NOT EXISTS public.incomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plate TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Binek',
    service_name TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_type TEXT NOT NULL DEFAULT 'Nakit', -- Nakit, Kredi Kartı, IBAN
    staff_name TEXT DEFAULT '',
    note TEXT DEFAULT '',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Giderler Tablosu
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Diğer', -- Kira, Fatura, Malzeme/Kimyasal, Personel/Maaş, Yemek/İkram, Diğer
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_type TEXT NOT NULL DEFAULT 'Nakit', -- Nakit, Kredi Kartı, IBAN
    note TEXT DEFAULT '',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Personel Tablosu (Prim & Maaş Takibi İçin)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    commission_rate NUMERIC(5,2) DEFAULT 0, -- Örn %10 prim
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ÖRNEK İLK VERİLER (VARSAYILAN HİZMETLER & PERSONEL)
-- ========================================================

INSERT INTO public.services (name, vehicle_type, price) VALUES
('İç Dış Yıkama', 'Binek', 1100),
('İç veya Dış Yıkama', 'Binek', 800),
('Su Tutma', 'Binek', 750),
('Cilalı Yıkama', 'Binek', 1850),
('İç Dış Yıkama', 'SUV / Arazi', 1250),
('İç veya Dış Yıkama', 'SUV / Arazi', 900),
('Su Tutma', 'SUV / Arazi', 800),
('Cilalı Yıkama', 'SUV / Arazi', 2000),
('İç Dış Yıkama', 'Ticari / Minibüs', 2000),
('İç veya Dış Yıkama', 'Ticari / Minibüs', 1500),
('Su Tutma', 'Ticari / Minibüs', 1000),
('Cilalı Yıkama', 'Ticari / Minibüs', 2700),
('Motosiklet Yıkama', 'Motosiklet', 800)
ON CONFLICT DO NOTHING;

INSERT INTO public.staff (name, phone, commission_rate) VALUES
('Ahmet Usta', '0555 111 22 33', 10),
('Mehmet Eleman', '0555 222 33 44', 10)
ON CONFLICT DO NOTHING;

-- RLS Güvenlik Politikaları (Anonim ve Yetkili Kullanıcı İzinleri)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes Okuyabilir ve Yazabilir (Public Access)" ON public.services;
DROP POLICY IF EXISTS "Herkes Okuyabilir ve Yazabilir (Public Access)" ON public.incomes;
DROP POLICY IF EXISTS "Herkes Okuyabilir ve Yazabilir (Public Access)" ON public.expenses;
DROP POLICY IF EXISTS "Herkes Okuyabilir ve Yazabilir (Public Access)" ON public.staff;

CREATE POLICY "Herkes Okuyabilir ve Yazabilir (Public Access)" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Herkes Okuyabilir ve Yazabilir (Public Access)" ON public.incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Herkes Okuyabilir ve Yazabilir (Public Access)" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Herkes Okuyabilir ve Yazabilir (Public Access)" ON public.staff FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- PERFORMANS İNDEKLERİ (Hızlı Plaka & Tarih Sorguları)
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_incomes_plate ON public.incomes (plate);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON public.incomes (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);

