import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserService } from '../services/user';
import * as ImagePicker from 'expo-image-picker';

export const ClientEditProfileScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState(''); // Email usually read-only
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState('');

    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const userDataStr = await AsyncStorage.getItem('user');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const uId = userData.id || userData._id;
                setUserId(uId);

                setName(userData.profile?.name || '');
                setPhone(userData.profile?.phone || '');
                setEmail(userData.email || '');
                setAddress(userData.profile?.location?.address || '');
                setAvatar(userData.profile?.avatar || '');
            }
        } catch (error) {
            console.error('Failed to load user profile', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            let uploadedAvatarUrl = avatar;

            // If avatar is a local URI (from picker), upload it
            if (avatar && !avatar.startsWith('http')) {
                uploadedAvatarUrl = await UserService.uploadImage(avatar);
            }

            const updateData = {
                name,
                phone,
                location: { address },
                avatar: uploadedAvatarUrl
            };

            // Use UserService (generic) instead of ArtisanService
            const response = await UserService.updateProfile(userId, updateData);

            // Update local storage to reflect changes immediately in other screens?
            // Ideally we should re-fetch user on other screens or update context
            const userDataStr = await AsyncStorage.getItem('user');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                userData.profile = {
                    ...userData.profile,
                    name,
                    phone,
                    avatar: uploadedAvatarUrl,
                    location: { ...userData.profile.location, address }
                };
                await AsyncStorage.setItem('user', JSON.stringify(userData));
            }

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <Image
                        source={{ uri: avatar || 'https://via.placeholder.com/100' }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                        <Ionicons name="camera" size={20} color={colors.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter phone number"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email (Read Only)</Text>
                    <TextInput
                        style={[styles.input, { opacity: 0.6 }]}
                        value={email}
                        editable={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location / City</Text>
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="e.g. Yaoundé"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator color={colors.black} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.border,
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.background,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: colors.surface,
        color: colors.white,
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
