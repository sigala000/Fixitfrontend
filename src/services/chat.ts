import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAT_URL = `${API_URL}/chat`;

export const ChatService = {
    sendMessage: async (recipientId: string, content: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(CHAT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ recipientId, content }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send message');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    getConversation: async (otherUserId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${CHAT_URL}/${otherUserId}`, {
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
                throw new Error(errorData.message || 'Failed to fetch conversation');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching conversation:', error);
            throw error;
        }
    },

    getConversations: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${CHAT_URL}/conversations`, {
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
                throw new Error(errorData.message || 'Failed to fetch conversations');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }
};
