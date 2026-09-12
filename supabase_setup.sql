-- ==========================================================
-- MİMARİ PROJE & OFİS ARŞİVİ - SUPABASE GÜVENLİ KURULUM KODU
-- ==========================================================
-- ÖNEMLİ: Supabase SQL Editor'de çalıştırmadan önce ekranda hiçbir 
-- satırın mavi seçili (highlight) olmadığından emin olun veya 
-- Ctrl+A ile TÜMÜNÜ seçip öyle RUN butonuna basın.

-- 1. Tabloyu oluştur (Eğer yoksa)
CREATE TABLE IF NOT EXISTS public.ofis_data (
    id TEXT PRIMARY KEY,
    projects JSONB DEFAULT '[]'::jsonb,
    office_notes JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Güvenlik ve Erişim İzinleri (Row Level Security - RLS)
ALTER TABLE public.ofis_data ENABLE ROW LEVEL SECURITY;

-- Eski politikalar varsa temizle ve yenilerini oluştur
DROP POLICY IF EXISTS "Herkes okuyabilir" ON public.ofis_data;
CREATE POLICY "Herkes okuyabilir" 
ON public.ofis_data 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Herkes ekleyebilir ve güncelleyebilir" ON public.ofis_data;
CREATE POLICY "Herkes ekleyebilir ve güncelleyebilir" 
ON public.ofis_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Canlı senkronizasyon (Realtime) özelliğini ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ofis_data'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ofis_data;
    END IF;
END $$;

-- 4. Başlangıç örnek verisini ekle (Eğer daha önce eklenmediyse)
INSERT INTO public.ofis_data (id, projects, office_notes, updated_at)
VALUES (
    'main',
    '[
        {
            "id": 1,
            "title": "Örnek Ruhsat / İmar Föyü",
            "folder": "Ana Ekran",
            "color": "#85b88f",
            "isArchived": false,
            "isPinned": false,
            "createdAt": "12.09.2026",
            "tasks": [
                { "id": 1, "text": "KAT PLANLARINA SIVALAR", "completed": false, "subtasks": [{ "id": 11, "text": "1. Kat", "completed": false }, { "id": 12, "text": "Zemin Kat", "completed": false }, { "id": 13, "text": "Bodrum", "completed": false }] },
                { "id": 2, "text": "KESİT AKSLARI EKLENECEK", "completed": false, "subtasks": [] },
                { "id": 3, "text": "KESİT ÖLÇÜLER", "completed": false, "subtasks": [{ "id": 31, "text": "A-A Kesiti", "completed": false }, { "id": 32, "text": "B-B Kesiti", "completed": false }] },
                { "id": 4, "text": "YANGIN TAHLİYE PLANLARI", "completed": false, "subtasks": [] },
                { "id": 5, "text": "ŞEMATİK KESİTLER", "completed": false, "subtasks": [] }
            ]
        }
    ]'::jsonb,
    '[]'::jsonb,
    NOW()
)
ON CONFLICT (id) DO NOTHING;
