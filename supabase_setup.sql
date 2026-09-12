-- ==========================================================
-- MİMARİ PROJE & OFİS ARŞİVİ - SUPABASE VERİTABANI KURULUM KODU
-- ==========================================================
-- Bu kodu Supabase panelinizde soldaki "SQL Editor" sekmesine 
-- yapıştırıp sağ alttaki "Run" (Çalıştır) butonuna basmanız yeterlidir.

-- 1. Ortak veri tablosunu oluştur
create table if not exists public.ofis_data (
    id text primary key,
    projects jsonb default '[]'::jsonb,
    office_notes jsonb default '[]'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Canlı senkronizasyon (Realtime) özelliğini tabloya ekle
alter publication supabase_realtime add table public.ofis_data;

-- 3. Güvenlik ve Erişim İzinleri (Row Level Security - RLS)
alter table public.ofis_data enable row level security;

-- Herkesin (anonim anahtar ile) okuyabilmesine izin ver
create policy "Herkes okuyabilir"
on public.ofis_data
for select
using (true);

-- Herkesin veri ekleyebilmesine / güncelleyebilmesine izin ver
create policy "Herkes ekleyebilir ve güncelleyebilir"
on public.ofis_data
for all
using (true)
with check (true);

-- 4. Başlangıç verisini ekle (Eğer tablo boşsa)
insert into public.ofis_data (id, projects, office_notes, updated_at)
values (
    'main',
    '[
        {
            "id": 1,
            "title": "Örnek Ruhsat / İmar Föyü",
            "folder": "Ana Ekran",
            "color": "#85b88f",
            "isArchived": false,
            "isPinned": false,
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
    now()
)
on conflict (id) do nothing;
