import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Функция для тестирования Firebase Storage
export const testFirebaseStorage = async () => {
    console.log('🧪 Testing Firebase Storage...');

    try {
        // Создаем тестовый файл
        const testData = new Blob(['Test file content'], { type: 'text/plain' });
        const testRef = ref(storage, `test/test-${Date.now()}.txt`);

        console.log('📤 Uploading test file...');
        const snapshot = await uploadBytes(testRef, testData);
        console.log('✅ Upload successful:', snapshot.metadata.name);

        console.log('🔗 Getting download URL...');
        const downloadURL = await getDownloadURL(testRef);
        console.log('✅ Download URL obtained:', downloadURL);

        console.log('🎉 Firebase Storage test PASSED!');
        return true;
    } catch (error) {
        console.error('❌ Firebase Storage test FAILED:', error);

        if (error instanceof Error) {
            if (error.message.includes('storage/unauthorized')) {
                console.error('💡 Fix: Update Firebase Storage Rules');
            } else if (error.message.includes('storage/unknown')) {
                console.error('💡 Fix: Check Firebase project configuration');
            } else if (error.message.includes('network')) {
                console.error('💡 Fix: Check internet connection');
            }
        }

        return false;
    }
};

// Делаем функцию доступной глобально для тестирования в консоли
declare global {
    interface Window {
        testFirebaseStorage: typeof testFirebaseStorage;
    }
}

if (typeof window !== 'undefined') {
    window.testFirebaseStorage = testFirebaseStorage;
}

export default testFirebaseStorage; 