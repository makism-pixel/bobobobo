export interface ApprovedBusiness {
    id: string;
    businessName: string;
    businessType: string;
    description: string;
    phone: string;
    address: string;
    city: string;
    rating?: number;
    hours?: string;
    price?: string;
    isOpen?: boolean;
    photos?: string[];
    mainPhotoUri?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    workingHours?: {
        [key: string]: {
            open: string;
            close: string;
            closed: boolean;
        };
    };
    acceptsReservations?: boolean;
    hasDelivery?: boolean;
    acceptsCards?: boolean;
    approvedAt?: Date;
    approvedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BusinessEvent {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    eventType: 'discount' | 'event' | 'promotion' | 'announcement';
    isActive: boolean;
    businessId: string;
    businessName: string;
    userId: string;
    discount?: number;
    createdAt: Date;
    updatedAt: Date;
} 