import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_URL = `${API_URL}/notifications`;

export const NotificationService = {
    getNotifications: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(NOTIFICATION_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch notifications');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${NOTIFICATION_URL}/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${NOTIFICATION_URL}/read-all`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
};
