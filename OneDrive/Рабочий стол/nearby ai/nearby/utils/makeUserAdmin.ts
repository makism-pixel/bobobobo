import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Утилита для назначения роли администратора пользователю
 * ВНИМАНИЕ: Используйте осторожно в продакшене!
 */
export const makeUserAdmin = async (userId: string) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, {
            role: 'admin',
            updatedAt: new Date()
        }, { merge: true });

        console.log(`✅ Пользователь ${userId} теперь администратор`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка при назначении роли администратора:', error);
        return false;
    }
};

/**
 * Быстрая функция для самоназначения админки
 * Вызовите в консоли разработчика: makeCurrentUserAdmin()
 */
export const makeCurrentUserAdmin = async () => {
    // Получаем текущего пользователя из Firebase Auth
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();

    if (!auth.currentUser) {
        console.error('❌ Нет авторизованного пользователя');
        return false;
    }

    return await makeUserAdmin(auth.currentUser.uid);
};

// Делаем функцию доступной глобально для консоли
if (typeof window !== 'undefined') {
    (window as any).makeCurrentUserAdmin = makeCurrentUserAdmin;
} 