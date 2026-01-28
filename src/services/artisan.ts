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
            const response = await fetch(`${ARTISAN_URL}/${userId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
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
            const filename = imageUri.split('/').pop() || 'upload.jpg';

            // Infer type from extension
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any);

            console.log('Uploading image to:', `${ARTISAN_URL}/upload`);
            console.log('File:', filename, type, imageUri);

            const response = await fetch(`${ARTISAN_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload image');
            }

            const data = await response.json();
            // Assuming backend returns { imageUrl: '/uploads/filename.jpg' }
            // We need to prepend SERVER_URL instead of API_URL because uploads are served at root, not under /api
            return `${SERVER_URL}${data.imageUrl}`;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
};
