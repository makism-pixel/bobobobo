import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Проверяет публичный доступ к коллекции approvedPlaces (без авторизации)
 */
export const debugApprovedPlaces = async () => {
    try {
        console.log('🔍 Checking approved places collection (public access)...');

        const snapshot = await getDocs(collection(db, 'approvedPlaces'));
        console.log('📄 Found', snapshot.size, 'approved places (public)');

        if (snapshot.size === 0) {
            console.log('ℹ️ No approved places found. Create one with: createTestApprovedPlace()');
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('🏪 Public Place:', {
                id: doc.id,
                name: data.businessName,
                type: data.businessType,
                address: data.address,
                rating: data.rating
            });
        });

        return {
            success: true,
            count: snapshot.size,
            message: 'Public access working!'
        };
    } catch (error) {
        console.error('❌ Error accessing approved places (public):', error);

        if ((error as any).code === 'permission-denied') {
            console.log('💡 Fix: Update Firebase rules to allow public read access to approvedPlaces');
        }

        return {
            success: false,
            error: error
        };
    }
};

// Глобальная функция для консоли
if (typeof window !== 'undefined') {
    (window as any).debugApprovedPlaces = debugApprovedPlaces;
} 