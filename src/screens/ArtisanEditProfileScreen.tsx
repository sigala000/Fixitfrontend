import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import { ArtisanService } from '../services/artisan';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ArtisanEditProfileScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [experience, setExperience] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState<string[]>([]);

    // Mock user ID fetch - in real app, decode token or get from context
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const userDataStr = await AsyncStorage.getItem('user');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const uId = userData.id || userData._id;
                setUserId(uId);

                setName(userData.profile?.name || '');
                setAvatar(userData.profile?.avatar || '');
                setBio(userData.profile?.bio || '');
                setPhone(userData.profile?.phone || '');
                setExperience(userData.profile?.experience || '');
                setSkills(userData.profile?.skills || []);
            }
        } catch (error) {
            console.error('Failed to load user profile', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            handleUpload(result.assets[0].uri);
        }
    };

    const handleUpload = async (uri: string) => {
        setUploadingAvatar(true);
        try {
            const uploadedUrl = await ArtisanService.uploadImage(uri);
            setAvatar(uploadedUrl);
        } catch (error) {
            Alert.alert('Upload Failed', 'Failed to upload profile picture');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (!userId) {
            Alert.alert('Error', 'User session not found. Please login again.');
            return;
        }

        setSaving(true);
        try {
            await ArtisanService.updateProfile(userId, {
                name,
                avatar,
                bio,
                phone,
                experience,
                skills,
            });

            // Update local storage so profile screen reflects changes immediately
            const userDataStr = await AsyncStorage.getItem('user');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const updatedUser = {
                    ...userData,
                    profile: {
                        ...userData.profile,
                        name,
                        avatar,
                        bio,
                        phone,
                        experience,
                        skills
                    }
                };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            }

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // ... (rest of methods)

    // ... (render)

    // Styles update
    /* 
       Note: I'm replacing the styles object to include new styles.
       Existing styles are kept.
    */
    /* eslint-disable-next-line */
    /* @ts-ignore */
    const _ignore = styles;

    // ...
    // Using simple replacement for now since I can't overwrite styles easily without full replace or append.
    // I will append the NEW styles at the end of the styles definition in the next replace block if possible.
    // But since I have to replace lines 12-74 (logic) AND add styles, I'll do logic first here.


    const addSkill = () => {
        if (skillInput.trim()) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (indexToRemove: number) => {
        setSkills(skills.filter((_, index) => index !== indexToRemove));
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
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
                {/* Profile Picture Upload */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert('Change Profile Picture', 'Choose an option', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Upload from Gallery',
                                    onPress: pickImage
                                }
                            ]);
                        }}
                        disabled={uploadingAvatar}
                    >
                        {uploadingAvatar ? (
                            <View style={[styles.avatarImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }]}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        ) : (
                            <Image
                                source={{ uri: avatar || 'https://via.placeholder.com/150' }}
                                style={styles.avatarImage}
                            />
                        )}
                        <View style={styles.editIconBadge}>
                            <Ionicons name="camera" size={16} color={colors.white} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Change Profile Photo</Text>
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
                    <Text style={styles.label}>Bio / Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell clients about your services..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Years of Experience</Text>
                    <TextInput
                        style={styles.input}
                        value={experience}
                        onChangeText={setExperience}
                        placeholder="e.g. 5 years"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Skills</Text>
                    <View style={styles.addSkillContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 10, marginBottom: 0 }]}
                            value={skillInput}
                            onChangeText={setSkillInput}
                            placeholder="Add a skill (e.g. Plumbing)"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                            <Ionicons name="add" size={24} color={colors.black} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.skillsList}>
                        {skills.map((skill, index) => (
                            <View key={index} style={styles.skillChip}>
                                <Text style={styles.skillText}>{skill}</Text>
                                <TouchableOpacity onPress={() => removeSkill(index)}>
                                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} style={{ marginLeft: 5 }} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
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
    centerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    addSkillContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skillsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillChip: {
        backgroundColor: '#2C2C2C',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    skillText: {
        color: colors.white,
        fontSize: 14,
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
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.background,
    },
    changePhotoText: {
        color: colors.primary,
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
    },
});
