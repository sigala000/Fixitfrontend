export interface User {
    _id: string;
    email: string;
    role: 'customer' | 'artisan' | 'admin';
    profile: {
        name: string;
        avatar?: string;
        phone?: string;
        bio?: string;
        skills?: string[]; // categories
        experience?: string;
        location?: {
            type: string;
            coordinates: number[];
        };
        rating?: number;
        reviewCount?: number;
    };
}

export interface Artisan extends User {
    role: 'artisan';
}
