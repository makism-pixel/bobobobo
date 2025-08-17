import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/config/supabase';

// Типы для фотографий
export interface PhotoMetadata {
    id: string;
    url: string;
    thumbnailUrl: string;
    isMain: boolean;
    businessId: string;
    createdAt: string;
}

// Константы
const PHOTOS_BUCKET = 'business-photos';
const MAX_PHOTO_SIZE = 1200;
const THUMBNAIL_SIZE = 300;
const JPEG_QUALITY = 0.8;

// Оптимизация фотографии
const optimizePhoto = async (uri: string): Promise<string> => {
    const result = await manipulateAsync(
        uri,
        [{ resize: { width: MAX_PHOTO_SIZE, height: MAX_PHOTO_SIZE } }],
        { compress: JPEG_QUALITY, format: SaveFormat.JPEG }
    );
    return result.uri;
};

// Создание превью
const createThumbnail = async (uri: string): Promise<string> => {
    const result = await manipulateAsync(
        uri,
        [{ resize: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE } }],
        { compress: JPEG_QUALITY, format: SaveFormat.JPEG }
    );
    return result.uri;
};

// Загрузка файла в Supabase Storage
const uploadFile = async (uri: string, businessId: string, isMain: boolean): Promise<string> => {
    try {
        console.log('Starting file upload:', { uri, businessId, isMain });

        // Получаем содержимое файла
        console.log('Fetching file content...');
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log('File blob created, size:', blob.size);

        // Генерируем имя файла
        const fileExt = 'jpg'; // Всегда сохраняем как jpg
        const fileName = `${Date.now()}_${isMain ? 'main' : 'photo'}.${fileExt}`;
        const filePath = `${businessId}/${fileName}`;

        console.log('Generated file path:', filePath);

        // Загружаем файл
        console.log('Starting Supabase upload...');
        const { data, error } = await supabase.storage
            .from('business-photos')
            .upload(filePath, blob, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) {
            console.error('Supabase storage upload error:', error);
            console.error('Error details:', {
                message: error.message,
                statusCode: error.statusCode,
                name: error.name
            });
            throw error;
        }

        console.log('File uploaded successfully:', data);
        console.log('Storage response:', { data, error });

        // Получаем публичный URL
        const { data: { publicUrl } } = supabase.storage
            .from('business-photos')
            .getPublicUrl(filePath);

        console.log('Public URL:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('Error in uploadFile:', error);
        throw error;
    }
};

// Загрузка фотографии
export const uploadPhoto = async (businessId: string, uri: string, isMain: boolean = false): Promise<PhotoMetadata> => {
    try {
        console.log('🚀 === UPLOAD PHOTO TO SUPABASE START ===');
        console.log('🏢 Business ID:', businessId);
        console.log('📁 Photo URI:', uri);
        console.log('🥇 Is main photo:', isMain);

        // Оптимизируем фото
        const optimizedUri = await optimizePhoto(uri);
        console.log('Photo optimized');

        const thumbnailUri = await createThumbnail(uri);
        console.log('Thumbnail created');

        // Загружаем оригинал и превью
        const photoUrl = await uploadFile(optimizedUri, businessId, isMain);
        console.log('Original photo uploaded:', photoUrl);

        const thumbnailUrl = await uploadFile(thumbnailUri, businessId, false);
        console.log('Thumbnail uploaded:', thumbnailUrl);

        // Если это главное фото, сначала обновляем остальные
        if (isMain) {
            console.log('Updating other photos (removing main status)');
            await supabase
                .from('photos')
                .update({ is_main: false })
                .eq('firebase_business_id', businessId);
        }

        // Создаем метаданные в базе данных
        console.log('Saving photo metadata to database');
        const { data, error } = await supabase
            .from('photos')
            .insert({
                firebase_business_id: businessId,
                url: photoUrl,
                thumbnail_url: thumbnailUrl,
                is_main: isMain,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving photo metadata:', error);
            throw error;
        }

        console.log('Photo metadata saved:', data);

        return {
            id: data.id,
            url: data.url,
            thumbnailUrl: data.thumbnail_url,
            isMain: data.is_main,
            businessId: data.firebase_business_id,
            createdAt: data.created_at
        };
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};

// Удаление фотографии
export const deletePhoto = async (photoId: string): Promise<void> => {
    try {
        // Получаем данные фото
        const { data: photo, error: fetchError } = await supabase
            .from('photos')
            .select()
            .eq('id', photoId)
            .single();

        if (fetchError) throw fetchError;

        // Удаляем файлы из хранилища
        const photoPath = new URL(photo.url).pathname.split('/').pop();
        const thumbnailPath = new URL(photo.thumbnail_url).pathname.split('/').pop();

        await supabase.storage
            .from(PHOTOS_BUCKET)
            .remove([
                `${photo.business_id}/photos/${photoPath}`,
                `${photo.business_id}/thumbnails/${thumbnailPath}`
            ]);

        // Удаляем запись из базы данных
        const { error: deleteError } = await supabase
            .from('photos')
            .delete()
            .eq('id', photoId);

        if (deleteError) throw deleteError;
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
};

// Получение фотографий бизнеса
export const getBusinessPhotos = async (businessId: string): Promise<PhotoMetadata[]> => {
    try {
        console.log('Getting photos for business:', businessId);

        const { data, error } = await supabase
            .from('photos')
            .select()
            .eq('firebase_business_id', businessId) // Исправлено поле
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error in getBusinessPhotos:', error);
            throw error;
        }

        console.log('Found photos:', data?.length || 0);

        return data?.map(photo => ({
            id: photo.id,
            url: photo.url,
            thumbnailUrl: photo.thumbnail_url,
            isMain: photo.is_main,
            businessId: photo.firebase_business_id, // Исправлено поле
            createdAt: photo.created_at
        })) || [];
    } catch (error) {
        console.error('Error getting business photos:', error);
        throw error;
    }
};

// Установка главного фото
export const setMainPhoto = async (photoId: string, businessId: string): Promise<void> => {
    try {
        console.log('Setting main photo:', { photoId, businessId });

        // Сначала убираем главное фото у всех фотографий бизнеса
        await supabase
            .from('photos')
            .update({ is_main: false })
            .eq('firebase_business_id', businessId); // Исправлено поле

        // Устанавливаем новое главное фото
        const { error } = await supabase
            .from('photos')
            .update({ is_main: true })
            .eq('id', photoId);

        if (error) {
            console.error('Error setting main photo:', error);
            throw error;
        }

        console.log('Main photo set successfully');
    } catch (error) {
        console.error('Error setting main photo:', error);
        throw error;
    }
};