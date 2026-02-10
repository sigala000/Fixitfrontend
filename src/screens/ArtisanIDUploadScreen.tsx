import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const ArtisanIDUploadScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // Request permissions first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!image) {
            Alert.alert('Required', 'Please select an image of your ID card.');
            return;
        }

        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            if (!userStr || !token) throw new Error('Authentication failed');

            const user = JSON.parse(userStr);

            // Create form data
            const formData = new FormData();
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'id_card.jpg',
            } as any);

            const response = await fetch(`${API_URL}/artisan/${user.id}/onboarding/id-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            // Update local user object
            user.profile = user.profile || {};
            user.profile.onboardingStep = 2; // Complete
            await AsyncStorage.setItem('user', JSON.stringify(user));

            Alert.alert('Success', 'ID Verification Submitted!', [
                {
                    text: 'Go to Dashboard',
                    onPress: () => navigation.replace('ArtisanTabs')
                }
            ]);

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Identity Verification</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Please upload a clear photo of your National ID or Passport.
            </Text>

            <TouchableOpacity
                style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={pickImage}
            >
                {image ? (
                    <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="cloud-upload-outline" size={50} color={theme.primary} />
                        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>Tap to Select Image</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary, opacity: image ? 1 : 0.6 }]}
                onPress={handleUpload}
                disabled={loading || !image}
            >
                {loading ? (
                    <ActivityIndicator color={theme.background} />
                ) : (
                    <Text style={[styles.buttonText, { color: theme.background }]}>Complete Verification</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    uploadBox: {
        width: '100%',
        height: 250,
        borderWidth: 2,
        borderStyle: 'dashed', // Note: Dashed border might not work on all Android versions without borderRadius
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 10,
        fontSize: 16,
    },
    button: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
