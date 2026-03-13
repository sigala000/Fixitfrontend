import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, SERVER_URL } from '../config';
import { Artisan } from '../types';

const ARTISAN_URL = `${API_URL}/artisan`;

export const ArtisanService = {
    getAllArtisans: async (category?: string, lat?: number, long?: number): Promise<Artisan[]> => {
        try {
            let queryParams = new URLSearchParams();
            if (category) queryParams.append('category', category);
            if (lat && long) {
                queryParams.append('lat', lat.toString());
                queryParams.append('long', long.toString());
            }

            const response = await fetch(`${ARTISAN_URL}?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch artisans');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching artisans:', error);
            throw error;
        }
    },

    updateProfile: async (userId: string, profileData: any) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${ARTISAN_URL}/${userId}/profile`, {
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
            console.error('Error updating artisan profile:', error);
            throw error;
        }
    },

    uploadImage: async (imageUri: string): Promise<string> => {
        try {
            const formData = new FormData();
            
            // Extract filename from URI - handle both file:// and content:// URIs
            let filename = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
            
            // Remove query parameters if present
            filename = filename.split('?')[0];
            
            // Ensure filename has extension
            if (!filename.includes('.')) {
                filename = `${filename}.jpg`;
            }
            
            // Determine MIME type from extension
            const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
            let mimeType = 'image/jpeg';
            
            switch (extension) {
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'gif':
                    mimeType = 'image/gif';
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    break;
                case 'jpg':
                case 'jpeg':
                default:
                    mimeType = 'image/jpeg';
            }

            // React Native FormData format - must match exactly
            const fileData: any = {
                uri: imageUri,
                type: mimeType,
                name: filename,
            };

            formData.append('image', fileData);

            console.log('Uploading image to:', `${ARTISAN_URL}/upload`);
            console.log('File details:', { filename, type: mimeType, uri: imageUri.substring(0, 50) + '...' });

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const response = await fetch(`${ARTISAN_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // IMPORTANT: Don't set Content-Type header for FormData
                    // React Native will automatically set it with the correct boundary
                },
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Failed to upload image';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            if (!data.imageUrl) {
                throw new Error('Server did not return image URL');
            }

            // Backend returns { imageUrl: '/uploads/filename.jpg' }
            // Prepend SERVER_URL because uploads are served at root, not under /api
            const fullUrl = `${SERVER_URL}${data.imageUrl}`;
            console.log('Upload successful:', fullUrl);
            return fullUrl;
        } catch (error: any) {
            console.error('Error uploading image:', error);
            
            // Provide more helpful error messages
            if (error.message?.includes('Network request failed')) {
                throw new Error('Network error: Please check your internet connection and ensure the server is running at ' + SERVER_URL);
            }
            if (error.message?.includes('Failed to fetch')) {
                throw new Error('Connection failed: Unable to reach the server. Please check your network connection.');
            }
            
            throw error;
        }
    }
};
