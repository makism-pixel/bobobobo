-- =====================================================
-- SQL скрипт для настройки Supabase для хранения фотографий
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта
-- =====================================================

-- 1. Создание таблицы photos
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firebase_business_id TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_photos_firebase_business_id ON public.photos(firebase_business_id);
CREATE INDEX IF NOT EXISTS idx_photos_is_main ON public.photos(is_main);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

-- 3. Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Создание триггера для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_photos_updated_at ON public.photos;
CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON public.photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Включение Row Level Security (RLS)
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 6. Создание политик RLS (с проверкой на существование)

-- Политика для чтения: все могут читать фотографии
DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;
CREATE POLICY "Anyone can view photos" ON public.photos
    FOR SELECT USING (true);

-- Политика для вставки: любой аутентифицированный пользователь может добавлять фотографии
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON public.photos;
CREATE POLICY "Authenticated users can insert photos" ON public.photos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Политика для обновления: пользователи могут обновлять фотографии
DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.photos;
CREATE POLICY "Authenticated users can update photos" ON public.photos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Политика для удаления: пользователи могут удалять фотографии
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.photos;
CREATE POLICY "Authenticated users can delete photos" ON public.photos
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Создание storage bucket для фотографий (если не существует)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-photos', 'business-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Создание политик для storage bucket (с проверкой на существование)

-- Политика для чтения: все могут читать фотографии из bucket
DROP POLICY IF EXISTS "Anyone can view photos in bucket" ON storage.objects;
CREATE POLICY "Anyone can view photos in bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'business-photos');

-- Политика для загрузки: аутентифицированные пользователи могут загружать фотографии
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'business-photos' 
        AND auth.role() = 'authenticated'
    );

-- Политика для обновления: аутентифицированные пользователи могут обновлять фотографии
DROP POLICY IF EXISTS "Authenticated users can update photos in bucket" ON storage.objects;
CREATE POLICY "Authenticated users can update photos in bucket" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'business-photos' 
        AND auth.role() = 'authenticated'
    );

-- Политика для удаления: аутентифицированные пользователи могут удалять фотографии
DROP POLICY IF EXISTS "Authenticated users can delete photos in bucket" ON storage.objects;
CREATE POLICY "Authenticated users can delete photos in bucket" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'business-photos' 
        AND auth.role() = 'authenticated'
    );

-- 9. Создание функции для очистки главных фотографий при установке новой главной
CREATE OR REPLACE FUNCTION clear_main_photos()
RETURNS TRIGGER AS $$
BEGIN
    -- Если устанавливается новая главная фотография
    IF NEW.is_main = true AND OLD.is_main = false THEN
        -- Убираем флаг is_main у всех остальных фотографий этого бизнеса
        UPDATE public.photos 
        SET is_main = false 
        WHERE firebase_business_id = NEW.firebase_business_id 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Создание триггера для автоматической очистки главных фотографий
DROP TRIGGER IF EXISTS clear_main_photos_trigger ON public.photos;
CREATE TRIGGER clear_main_photos_trigger
    AFTER UPDATE ON public.photos
    FOR EACH ROW
    EXECUTE FUNCTION clear_main_photos();

-- 11. Вставка тестовых данных (опционально, для проверки)
-- Раскомментируйте следующие строки, если хотите добавить тестовые данные

/*
INSERT INTO public.photos (firebase_business_id, url, thumbnail_url, is_main) VALUES
('test_business_1', 'https://example.com/photo1.jpg', 'https://example.com/thumb1.jpg', true),
('test_business_1', 'https://example.com/photo2.jpg', 'https://example.com/thumb2.jpg', false),
('test_business_2', 'https://example.com/photo3.jpg', 'https://example.com/thumb3.jpg', true);
*/

-- =====================================================
-- Проверочные запросы (выполните после создания таблицы)
-- =====================================================

-- Проверить структуру таблицы
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'photos' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Проверить индексы
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'photos' AND schemaname = 'public';

-- Проверить политики RLS
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'photos';

-- Проверить bucket
-- SELECT * FROM storage.buckets WHERE id = 'business-photos';

-- Проверить политики storage
-- SELECT * FROM storage.policies WHERE bucket_id = 'business-photos';

COMMENT ON TABLE public.photos IS 'Таблица для хранения метаданных фотографий бизнесов';
COMMENT ON COLUMN public.photos.firebase_business_id IS 'ID бизнеса из Firebase (может содержать timestamp)';
COMMENT ON COLUMN public.photos.url IS 'URL оригинального изображения в Supabase Storage';
COMMENT ON COLUMN public.photos.thumbnail_url IS 'URL миниатюры изображения';
COMMENT ON COLUMN public.photos.is_main IS 'Является ли фотография главной для бизнеса';
