import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const REVIEW_URL = `${API_URL}/review`;

export const ReviewService = {
    createReview: async (bookingId: string, artisanId: string, rating: number, comment: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(REVIEW_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ bookingId, artisanId, rating, comment }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create review');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    getArtisanReviews: async (artisanId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${REVIEW_URL}/artisan/${artisanId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch reviews');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching artisan reviews:', error);
            throw error;
        }
    },

    getBookingReview: async (bookingId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${REVIEW_URL}/booking/${bookingId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch review');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching booking review:', error);
            throw error;
        }
    }
};
