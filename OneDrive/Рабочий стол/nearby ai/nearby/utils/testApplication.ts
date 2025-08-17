import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Создает тестовую заявку для проверки работы системы
 */
export const createTestApplication = async () => {
    try {
        console.log('🧪 Creating test application...');

        const testData = {
            businessName: 'Тестовое Кафе',
            businessType: '☕ Кафе',
            description: 'Тестовое заведение для проверки системы',
            email: 'test@example.com',
            phone: '+371 12345678',
            website: '',
            address: 'Teststreet 123',
            city: 'Рига',
            postalCode: 'LV-1010',
            ownerName: 'Тест Владелец',
            ownerTitle: 'Владелец',
            userEmail: 'test@example.com',
            workingHours: {
                monday: '9:00 - 18:00',
                tuesday: '9:00 - 18:00',
                wednesday: '9:00 - 18:00',
                thursday: '9:00 - 18:00',
                friday: '9:00 - 18:00',
                saturday: '10:00 - 16:00',
                sunday: 'Закрыто'
            },
            acceptsReservations: true,
            hasDelivery: false,
            acceptsCards: true,
            taxNumber: '',
            registrationNumber: '',
            isVerified: false,
            verificationStatus: 'pending' as const,
            userId: 'test-user-123',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Создаем тестовую заявку
        const testDocRef = doc(db, 'businessProfiles', 'test-application-' + Date.now());
        await setDoc(testDocRef, testData);

        console.log('✅ Test application created successfully');
        return true;
    } catch (error) {
        console.error('❌ Error creating test application:', error);
        return false;
    }
};

/**
 * Создает тестовое одобренное место напрямую в коллекции approvedPlaces
 */
export const createTestApprovedPlace = async () => {
    try {
        console.log('🧪 Creating test approved place...');

        const testPlaceData = {
            businessName: 'Тестовое Одобренное Кафе',
            businessType: '☕ Кафе',
            description: 'Это тестовое заведение, которое уже одобрено',
            email: 'approved-test@example.com',
            phone: '+371 12345678',
            website: '',
            address: 'Approved Street 456',
            city: 'Рига',
            ownerName: 'Одобренный Владелец',
            userEmail: 'approved-test@example.com',
            userId: 'approved-test-user-' + Date.now(),
            rating: 4.7,
            hours: '8:00 - 23:00',
            price: '€€',
            isOpen: true,
            approvedAt: new Date(),
            approvedBy: 'malina@gmail.com',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Создаем одобренное место
        const testDocRef = doc(db, 'approvedPlaces', 'test-approved-' + Date.now());
        await setDoc(testDocRef, testPlaceData);

        console.log('✅ Test approved place created successfully');
        return true;
    } catch (error) {
        console.error('❌ Error creating test approved place:', error);
        return false;
    }
};

// Глобальная функция для консоли
if (typeof window !== 'undefined') {
    (window as any).createTestApplication = createTestApplication;
    (window as any).createTestApprovedPlace = createTestApprovedPlace;
}

/**
 * Функция для очистки тестовых данных
 */
export const clearTestData = async () => {
    console.log('🧹 This function would clear test data');
    // Здесь можно добавить логику для удаления тестовых данных
}; 