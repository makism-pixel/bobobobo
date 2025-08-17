import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'user' | 'business' | 'admin';
export type BusinessStatus = 'pending' | 'approved' | 'rejected';

interface UserData {
    role: UserRole;
    businessId?: string;
    createdAt?: any;
    updatedAt?: any;
}

interface BusinessProfile {
    businessName: string;
    businessType: string;
    verificationStatus: BusinessStatus;
    isVerified: boolean;
    userId: string;
}

// Список email адресов администраторов
const ADMIN_EMAILS = [
    'malina@gmail.com'
];

export const useUserRole = () => {
    const { user } = useAuth();
    const [role, setRole] = useState<UserRole>('user');
    const [loading, setLoading] = useState(true);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businessStatus, setBusinessStatus] = useState<BusinessStatus>('pending');
    const [businessName, setBusinessName] = useState<string>('');
    const [isApproved, setIsApproved] = useState(false);

    // Определяем админа по email
    const isAdminByEmail = ADMIN_EMAILS.includes(user?.email || '');

    // Отладочная информация (только при изменении пользователя)
    useEffect(() => {
        if (user) {
            console.log('🔍 useUserRole Debug:', {
                userEmail: user?.email,
                userUID: user?.uid,
                isAdminByEmail,
                ADMIN_EMAILS,
                loading
            });
        }
    }, [user?.uid, isAdminByEmail]); // Убрали loading из зависимостей

    useEffect(() => {
        if (!user) {
            console.log('❌ No user, setting role to user');
            setRole('user');
            setBusinessId(null);
            setLoading(false);
            return;
        }

        console.log('👤 User found:', user.email, 'Is admin:', isAdminByEmail);

        // Если пользователь админ, устанавливаем роль сразу и не ждем документ
        if (isAdminByEmail) {
            console.log('⚡ Admin detected, setting role immediately');
            setRole('admin');
            setLoading(false);
            // Для админов не загружаем бизнес-профиль
            setBusinessId(null);
            setBusinessStatus('pending');
            setBusinessName('');
            setIsApproved(false);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);

        // Таймаут для предотвращения бесконечной загрузки
        const loadingTimeout = setTimeout(() => {
            console.log('⏰ Loading timeout, using fallback logic');
            setRole(isAdminByEmail ? 'admin' : 'user');
            setLoading(false);
        }, 5000); // 5 секунд максимум

        // Подписываемся на изменения роли пользователя
        const unsubscribe = onSnapshot(
            userDocRef,
            (docSnap) => {
                clearTimeout(loadingTimeout); // Отменяем таймаут если данные пришли
                console.log('🔍 User doc changed:', docSnap.exists(), docSnap.data());

                if (docSnap.exists()) {
                    const userData = docSnap.data() as UserData;
                    console.log('👤 User data:', userData);

                    // Определяем роль: админ может быть одновременно бизнесом
                    const finalRole = isAdminByEmail && userData.role === 'business' ? 'business' :
                        isAdminByEmail ? 'admin' :
                            userData.role || 'user';

                    console.log('🎭 Final role determined:', finalRole, 'isAdmin:', isAdminByEmail);
                    setRole(finalRole);
                    setBusinessId(userData.businessId || null);

                    // Если пользователь - бизнес, загружаем статус заведения
                    if (userData.role === 'business' && userData.businessId) {
                        console.log('🏢 Loading business profile:', userData.businessId);

                        const businessDocRef = doc(db, 'businessProfiles', userData.businessId);
                        const businessUnsubscribe = onSnapshot(businessDocRef, (businessDoc) => {
                            console.log('🏪 Business doc changed:', businessDoc.exists(), businessDoc.data());

                            if (businessDoc.exists()) {
                                const businessData = businessDoc.data() as BusinessProfile;
                                console.log('📋 Business data:', {
                                    name: businessData.businessName,
                                    status: businessData.verificationStatus,
                                    isVerified: businessData.isVerified
                                });

                                setBusinessStatus(businessData.verificationStatus);
                                setBusinessName(businessData.businessName);
                                setIsApproved(businessData.verificationStatus === 'approved');
                            } else {
                                console.log('❌ Business document not found');
                                setBusinessStatus('pending');
                                setBusinessName('');
                                setIsApproved(false);
                            }
                            setLoading(false); // Завершаем загрузку после получения бизнес-данных
                        });

                        // Сохраняем cleanup функцию
                        return () => {
                            console.log('🧹 Cleaning up business subscription');
                            businessUnsubscribe();
                        };
                    } else {
                        console.log('👤 Regular user, no business profile');
                        setBusinessStatus('pending');
                        setBusinessName('');
                        setIsApproved(false);
                        setLoading(false); // Завершаем загрузку для обычных пользователей
                    }
                } else {
                    console.log('❌ User document not found, using email-based admin check');
                    // Если документа нет, определяем роль по email
                    const emailBasedRole = isAdminByEmail ? 'admin' : 'user';
                    console.log('🎭 Email-based role:', emailBasedRole, 'for email:', user.email);
                    setRole(emailBasedRole);
                    setBusinessId(null);
                    setBusinessStatus('pending');
                    setBusinessName('');
                    setIsApproved(false);
                    setLoading(false); // Завершаем загрузку
                }
            },
            (error) => {
                clearTimeout(loadingTimeout); // Отменяем таймаут при ошибке
                console.error('❌ Error loading user role:', error);
                console.log('🛠️ Using fallback admin check for email:', user.email);
                setRole(isAdminByEmail ? 'admin' : 'user');
                setBusinessId(null);
                setBusinessStatus('pending');
                setBusinessName('');
                setIsApproved(false);
                setLoading(false); // Завершаем загрузку при ошибке
            }
        );

        // Возвращаем функцию cleanup
        return () => {
            clearTimeout(loadingTimeout);
            unsubscribe();
        };
    }, [user, isAdminByEmail]); // Добавил isAdminByEmail в зависимости

    const result = useMemo(() => ({
        role,
        businessId,
        businessStatus,
        businessName,
        loading,
        isBusiness: role === 'business',
        isAdmin: isAdminByEmail, // Админ определяется по email, не по роли
        isUser: role === 'user',
        isApproved,
        isPending: businessStatus === 'pending',
        isRejected: businessStatus === 'rejected'
    }), [role, businessId, businessStatus, businessName, loading, isAdminByEmail, isApproved]);

    // Логируем только когда результат действительно изменился
    useEffect(() => {
        console.log('🎯 useUserRole result:', {
            email: user?.email,
            role: result.role,
            isAdmin: result.isAdmin,
            loading: result.loading
        });
    }, [user?.email, result.role, result.isAdmin, result.loading]);

    return result;
}; 