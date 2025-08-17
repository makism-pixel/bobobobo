export interface BusinessProfile {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
}

export interface Photo {
    id: string;
    firebase_business_id: string; // Соответствует реальной структуре таблицы
    url: string;
    thumbnail_url: string;
    is_main: boolean;
    created_at: string;
    updated_at?: string;
}
