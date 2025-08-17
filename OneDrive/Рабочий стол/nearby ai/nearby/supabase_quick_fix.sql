-- =====================================================
-- Быстрое исправление для существующей установки Supabase
-- Выполните этот скрипт, если у вас уже есть таблица photos
-- =====================================================

-- 1. Убедимся, что таблица существует и имеет правильную структуру
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS firebase_business_id TEXT;

-- Если у вас есть старое поле business_id, скопируем данные
-- UPDATE public.photos SET firebase_business_id = business_id WHERE firebase_business_id IS NULL;

-- 2. Убедимся, что все необходимые столбцы существуют
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Создание индексов (если не существуют)
CREATE INDEX IF NOT EXISTS idx_photos_firebase_business_id ON public.photos(firebase_business_id);
CREATE INDEX IF NOT EXISTS idx_photos_is_main ON public.photos(is_main);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

-- 4. Включение RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 5. Пересоздание политик (безопасно)
DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;
CREATE POLICY "Anyone can view photos" ON public.photos
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert photos" ON public.photos;
CREATE POLICY "Authenticated users can insert photos" ON public.photos
    FOR INSERT WITH CHECK (true); -- Упрощенная политика для отладки

DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.photos;
CREATE POLICY "Authenticated users can update photos" ON public.photos
    FOR UPDATE USING (true); -- Упрощенная политика для отладки

DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.photos;
CREATE POLICY "Authenticated users can delete photos" ON public.photos
    FOR DELETE USING (true); -- Упрощенная политика для отладки

-- 6. Создание bucket (если не существует)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-photos', 
    'business-photos', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 7. Политики для storage (упрощенные для отладки)
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
CREATE POLICY "Public can view photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'business-photos');

DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
CREATE POLICY "Anyone can upload photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'business-photos');

-- 8. Проверочный запрос
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'photos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
