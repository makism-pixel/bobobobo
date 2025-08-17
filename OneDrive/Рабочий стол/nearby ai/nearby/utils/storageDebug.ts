import { storage, auth } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

// Проверка конфигурации Storage
export const checkStorageConfig = () => {
    console.log('🔧 Firebase Storage Configuration:');
    console.log('📦 App name:', storage.app.name);
    console.log('🪣 Storage bucket:', storage.app.options.storageBucket);
    console.log('👤 Current user:', auth.currentUser?.uid || 'NOT AUTHENTICATED');
    console.log('📧 User email:', auth.currentUser?.email || 'NO EMAIL');
    console.log('🔐 Auth token available:', !!auth.currentUser);
};

// Тест базовой загрузки
export const testBasicUpload = async () => {
    try {
        console.log('🧪 Testing basic upload...');

        // Проверяем авторизацию
        if (!auth.currentUser) {
            console.error('❌ User not authenticated');
            return false;
        }

        // Создаем тестовый файл
        const testData = new Blob(['Test content from mobile app'], { type: 'text/plain' });
        const testFileName = `debug_test_${Date.now()}.txt`;
        const testRef = ref(storage, testFileName); // Попробуем в корне

        console.log('📁 Test file path:', testRef.fullPath);
        console.log('📊 Test data size:', testData.size, 'bytes');

        // Загружаем
        const snapshot = await uploadBytes(testRef, testData);
        console.log('✅ Upload successful:', snapshot.metadata);

        // Получаем URL
        const url = await getDownloadURL(testRef);
        console.log('🔗 Download URL:', url.substring(0, 100) + '...');

        return true;
    } catch (error) {
        console.error('❌ Basic upload test failed:', error);
        return false;
    }
};

// Тест загрузки в business-photos
export const testBusinessPhotosUpload = async () => {
    try {
        console.log('🧪 Testing business-photos upload...');

        if (!auth.currentUser) {
            console.error('❌ User not authenticated');
            return false;
        }

        // Создаем тестовый файл-изображение
        const testData = new Blob(['fake image data'], { type: 'image/jpeg' });
        const testFileName = `${auth.currentUser.uid}_test_${Date.now()}.jpg`;
        const testRef = ref(storage, `business-photos/${testFileName}`);

        console.log('📁 Business photos path:', testRef.fullPath);

        // Загружаем
        const snapshot = await uploadBytes(testRef, testData);
        console.log('✅ Business photos upload successful:', snapshot.metadata);

        // Получаем URL
        const url = await getDownloadURL(testRef);
        console.log('🔗 Business photos URL:', url.substring(0, 100) + '...');

        return true;
    } catch (error) {
        console.error('❌ Business photos upload test failed:', error);
        return false;
    }
};

// Проверка списка файлов
export const listStorageFiles = async () => {
    try {
        console.log('📂 Listing storage files...');

        // Список в корне
        const rootRef = ref(storage, '/');
        const rootList = await listAll(rootRef);
        console.log('📁 Root files:', rootList.items.map(item => item.name));
        console.log('📁 Root folders:', rootList.prefixes.map(prefix => prefix.name));

        // Список в business-photos
        try {
            const businessRef = ref(storage, 'business-photos/');
            const businessList = await listAll(businessRef);
            console.log('📸 Business photos:', businessList.items.map(item => item.name));
        } catch (businessError) {
            console.log('📸 Business photos folder empty or not accessible');
        }

        return true;
    } catch (error) {
        console.error('❌ Failed to list files:', error);
        return false;
    }
};

// Полная диагностика Storage
export const fullStorageDiagnostics = async () => {
    console.log('🔍 Running full Storage diagnostics...');
    console.log('='.repeat(50));

    // 1. Конфигурация
    checkStorageConfig();
    console.log('='.repeat(50));

    // 2. Базовый тест
    const basicTest = await testBasicUpload();
    console.log('='.repeat(50));

    // 3. Тест business-photos
    const businessTest = await testBusinessPhotosUpload();
    console.log('='.repeat(50));

    // 4. Список файлов
    await listStorageFiles();
    console.log('='.repeat(50));

    const result = {
        basicUpload: basicTest,
        businessPhotos: businessTest,
        overallStatus: basicTest && businessTest ? 'PASS' : 'FAIL'
    };

    console.log('📊 Diagnostics result:', result);
    return result;
};

// Глобальные функции для консоли
declare global {
    interface Window {
        checkStorageConfig: typeof checkStorageConfig;
        testBasicUpload: typeof testBasicUpload;
        testBusinessPhotosUpload: typeof testBusinessPhotosUpload;
        fullStorageDiagnostics: typeof fullStorageDiagnostics;
    }
}

if (typeof window !== 'undefined') {
    window.checkStorageConfig = checkStorageConfig;
    window.testBasicUpload = testBasicUpload;
    window.testBusinessPhotosUpload = testBusinessPhotosUpload;
    window.fullStorageDiagnostics = fullStorageDiagnostics;
} 