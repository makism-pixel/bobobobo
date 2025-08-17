import { supabase } from '@/config/supabase';

// Функция для загрузки тестовой фотографии в реальный бизнес
export const uploadTestPhotoToExistingBusiness = async (businessId: string) => {
    try {
        console.log('🧪 Uploading test photo to existing business:', businessId);

        // Создаем тестовую запись с простой картинкой (без CORS проблем)
        const testPhoto = {
            firebase_business_id: businessId,
            url: 'https://picsum.photos/400/300?random=1',
            thumbnail_url: 'https://picsum.photos/150/100?random=1',
            is_main: true
        };

        const { data, error } = await supabase
            .from('photos')
            .insert(testPhoto)
            .select()
            .single();

        if (error) {
            console.error('❌ Test photo upload failed:', error);
            return false;
        }

        console.log('✅ Test photo uploaded successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ Test photo upload error:', error);
        return false;
    }
};

// Функция для тестирования загрузки фотографии
export const testPhotoUpload = async (businessId: string) => {
    try {
        console.log('🧪 Testing photo upload for business:', businessId);

        // Создаем тестовую запись в базе данных
        const testPhoto = {
            firebase_business_id: businessId,
            url: 'https://via.placeholder.com/400x300.jpg?text=Test+Photo',
            thumbnail_url: 'https://via.placeholder.com/150x100.jpg?text=Thumb',
            is_main: true
        };

        const { data, error } = await supabase
            .from('photos')
            .insert(testPhoto)
            .select()
            .single();

        if (error) {
            console.error('❌ Test photo upload failed:', error);
            return false;
        }

        console.log('✅ Test photo uploaded successfully:', data);

        // Пробуем получить фотографию обратно
        const { data: fetchedPhoto, error: fetchError } = await supabase
            .from('photos')
            .select('*')
            .eq('firebase_business_id', businessId)
            .eq('is_main', true)
            .single();

        if (fetchError) {
            console.error('❌ Failed to fetch test photo:', fetchError);
            return false;
        }

        console.log('✅ Test photo fetched successfully:', fetchedPhoto);

        // Удаляем тестовую фотографию
        const { error: deleteError } = await supabase
            .from('photos')
            .delete()
            .eq('id', data.id);

        if (deleteError) {
            console.error('⚠️ Failed to cleanup test photo:', deleteError);
        } else {
            console.log('🧹 Test photo cleaned up successfully');
        }

        return true;
    } catch (error) {
        console.error('❌ Test photo upload error:', error);
        return false;
    }
};

// Функция для тестирования всех операций с фотографиями
export const runPhotoTests = async () => {
    console.log('🧪 Starting photo functionality tests...');

    const testBusinessId = 'test_business_' + Date.now();

    // Тест 1: Загрузка фотографии
    const uploadTest = await testPhotoUpload(testBusinessId);
    console.log('📊 Upload test result:', uploadTest ? '✅ PASSED' : '❌ FAILED');

    // Тест 2: Проверка подключения к storage
    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('❌ Storage connection failed:', error);
        } else {
            console.log('✅ Storage connection successful');
            console.log('📦 Available buckets:', buckets?.map(b => b.name) || []);

            const businessPhotosBucket = buckets?.find(b => b.id === 'business-photos');
            if (businessPhotosBucket) {
                console.log('✅ business-photos bucket exists');
            } else {
                console.log('❌ business-photos bucket not found');
            }
        }
    } catch (error) {
        console.error('❌ Storage test failed:', error);
    }

    console.log('✅ Photo functionality tests completed');
};
