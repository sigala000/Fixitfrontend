import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const ArtisanIDUploadScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [idFront, setIdFront] = useState<string | null>(null);
    const [idBack, setIdBack] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async (type: 'front' | 'back' | 'profile') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'profile' ? [1, 1] : [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            if (type === 'front') setIdFront(result.assets[0].uri);
            if (type === 'back') setIdBack(result.assets[0].uri);
            if (type === 'profile') setProfilePic(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!idFront || !idBack || !profilePic) {
            Alert.alert('Required', 'Please upload both sides of your ID card and a profile picture.');
            return;
        }

        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            if (!userStr || !token) throw new Error('Authentication failed');

            const user = JSON.parse(userStr);
            const userId = user.id || user._id;

            const formData = new FormData();

            formData.append('idCardFront', {
                uri: idFront,
                type: 'image/jpeg',
                name: 'id_front.jpg',
            } as any);

            formData.append('idCardBack', {
                uri: idBack,
                type: 'image/jpeg',
                name: 'id_back.jpg',
            } as any);

            formData.append('profilePicture', {
                uri: profilePic,
                type: 'image/jpeg',
                name: 'profile.jpg',
            } as any);

            const response = await fetch(`${API_URL}/artisan/${userId}/onboarding/id-card`, {
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
            const updatedUser = {
                ...user,
                profile: {
                    ...user.profile,
                    onboardingStep: 2,
                    idCardFront: data.idCardFront,
                    idCardBack: data.idCardBack,
                    avatar: data.avatar
                }
            };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            Alert.alert('Success', 'Profile verification submitted successfully!', [
                {
                    text: 'Go to Dashboard',
                    onPress: () => navigation.replace('ArtisanTabs')
                }
            ]);

        } catch (error: any) {
            console.error('Upload Error:', error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderUploadBox = (type: 'front' | 'back' | 'profile', label: string, currentImage: string | null) => (
        <View style={styles.uploadSection}>
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            <TouchableOpacity
                style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => pickImage(type)}
            >
                {currentImage ? (
                    <Image source={{ uri: currentImage }} style={styles.previewImage} />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name={type === 'profile' ? "person-outline" : "card-outline"} size={40} color={theme.primary} />
                        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>Tap to Upload</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>{t('artisan_id_upload.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {t('artisan_id_upload.subtitle')}
            </Text>

            {renderUploadBox('profile', t('artisan_id_upload.profile_pic'), profilePic)}
            {renderUploadBox('front', t('artisan_id_upload.id_front'), idFront)}
            {renderUploadBox('back', t('artisan_id_upload.id_back'), idBack)}

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary, opacity: (idFront && idBack && profilePic) ? 1 : 0.6 }]}
                onPress={handleUpload}
                disabled={loading || !idFront || !idBack || !profilePic}
            >
                {loading ? (
                    <ActivityIndicator color={theme.background} />
                ) : (
                    <Text style={[styles.buttonText, { color: theme.background }]}>{t('artisan_id_upload.button')}</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 30,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    uploadSection: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    uploadBox: {
        width: '100%',
        height: 150,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginTop: 6,
        fontSize: 14,
    },
    button: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: 'bold',
    },
});
