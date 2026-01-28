import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKING_URL = `${API_URL}/booking`;

export interface BookingRequest {
    artisanId: string;
    serviceType: string;
    date: Date;
    time: string;
    description: string;
    location: {
        address: string;
        coordinates: number[];
    };
}

export const BookingService = {
    createBooking: async (bookingData: BookingRequest) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(BOOKING_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create booking');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    getBookings: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(BOOKING_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    await AsyncStorage.multiRemove(['token', 'user']);
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(errorData.message || 'Failed to fetch bookings');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    updateBookingStatus: async (bookingId: string, status: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${BOOKING_URL}/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    await AsyncStorage.multiRemove(['token', 'user']);
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(errorData.message || 'Failed to update booking status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }
};
