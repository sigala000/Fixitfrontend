import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const AUTH_URL = `${API_URL}/auth`;

export const AuthService = {
    login: async (email: string, password: string) => {
        try {
            console.log('Attempting login with URL:', `${AUTH_URL}/login`);
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Login response status:', response.status);
            const text = await response.text();
            console.log('Login response text:', text);

            try {
                const data = JSON.parse(text);
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                return data;
            } catch (e: any) {
                console.error('Login process error:', e);
                // If it's a known error (like "User not found"), rethrow it
                if (e.message && e.message !== 'Unexpected token') {
                    throw e;
                }
                throw new Error('Server returned invalid response');
            }
        } catch (error) {
            throw error;
        }
    },

    signup: async (userData: any) => {
        try {
            console.log('Attempting signup with URL:', `${AUTH_URL}/signup`);
            console.log('User Data:', userData);

            const response = await fetch(`${AUTH_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            if (data.token) {
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },

    getUser: async () => {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
