import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const USER_URL = `${API_URL}/user`;

export const UserService = {
    updateProfile: async (userId: string, profileData: any) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${USER_URL}/${userId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    uploadImage: async (imageUri: string): Promise<string> => {
        try {
            // Create form data
            const formData = new FormData();

            // Extract filename and type
            const filename = imageUri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any);

            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${USER_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload image');
            }

            const data = await response.json();
            return data.imageUrl; // Expects backend to return { imageUrl: '...' }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    getUserProfile: async (userId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${USER_URL}/${userId}/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }
};
