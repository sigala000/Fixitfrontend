import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { auth } from '../config/firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile as updateFirebaseProfile
} from 'firebase/auth';

const AUTH_URL = `${API_URL}/auth`;

export const AuthService = {
    login: async (email: string, password: string) => {
        try {
            // 1. Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // 2. Sync with our Backend
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: idToken }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Login sync failed:', text);
                let message = `Login sync failed (Status: ${response.status})`;
                try {
                    const errorData = JSON.parse(text);
                    message = errorData.message || message;
                } catch (e) {
                    // Not JSON
                }
                throw new Error(message);
            }

            const data = await response.json();

            // 3. Store session
            await AsyncStorage.setItem('token', idToken);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));

            return data;
        } catch (error: any) {
            console.error('Login Error:', error);
            throw error;
        }
    },

    signup: async (userData: any) => {
        try {
            const { email, password, name, role } = userData;

            // 1. Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // Optional: Update firebase display name
            await updateFirebaseProfile(userCredential.user, { displayName: name });

            // 2. Create user in our Backend
            console.log(`Syncing signup to: ${AUTH_URL}/signup`);
            const response = await fetch(`${AUTH_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: idToken,
                    role,
                    name
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Backend sync error response:', text);
                let message = `Signup sync failed (Status: ${response.status})`;
                try {
                    const errorData = JSON.parse(text);
                    message = errorData.message || message;
                    if (errorData.error) message += ` - ${errorData.error}`;
                } catch (e) {
                    // Not JSON
                }
                throw new Error(message);
            }

            const data = await response.json();

            // 3. Store session
            await AsyncStorage.setItem('token', idToken);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));

            return data;
        } catch (error: any) {
            console.error('Signup Error:', error);
            throw error;
        }
    },

    logout: async () => {
        await signOut(auth);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },

    getUser: async () => {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
