import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArtisanService } from '../services/artisan';
import { useTheme } from '../context/ThemeContext';

import * as ImagePicker from 'expo-image-picker';

export const ArtisanPortfolioScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        loadPortfolio();
    }, []);

    const loadPortfolio = async () => {
        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserData(user);
                setUserId(user._id || user.id);
                setPortfolioImages(user.profile?.portfolio || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadAndAddToPortfolio(result.assets[0].uri);
        }
    };

    const uploadAndAddToPortfolio = async (uri: string) => {
        setUploading(true);
        try {
            const uploadedUrl = await ArtisanService.uploadImage(uri);
            const newPortfolio = [...portfolioImages, uploadedUrl];
            await updatePortfolio(newPortfolio);
        } catch (error) {
            Alert.alert('Upload Failed', 'Failed to upload portfolio image');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = (index: number) => {
        Alert.alert('Delete Image', 'Are you sure you want to remove this image?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const newPortfolio = portfolioImages.filter((_, i) => i !== index);
                    await updatePortfolio(newPortfolio);
                }
            }
        ]);
    };

    const updatePortfolio = async (newPortfolio: string[]) => {
        setPortfolioImages(newPortfolio);
        try {
            if (userId && userData) {
                // Update backend
                await ArtisanService.updateProfile(userId, { portfolio: newPortfolio });

                // Update local storage
                const updatedUser = {
                    ...userData,
                    profile: {
                        ...userData.profile,
                        portfolio: newPortfolio
                    }
                };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save changes');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Portfolio</Text>
                <TouchableOpacity onPress={handleAddImage}>
                    <Ionicons name="add-circle" size={28} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.portfolioGrid}>
                    {portfolioImages.map((img, index) => (
                        <TouchableOpacity key={index} style={styles.portfolioItem} onLongPress={() => handleDeleteImage(index)}>
                            <Image source={{ uri: img }} style={styles.portfolioImage} />
                            <View style={styles.deleteOverlay}>
                                <Ionicons name="trash-outline" size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Add Work Button */}
                    <TouchableOpacity
                        style={[styles.addWorkCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
                        onPress={handleAddImage}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color={theme.primary} />
                        ) : (
                            <>
                                <Ionicons name="camera-outline" size={40} color={theme.textSecondary} />
                                <Text style={[styles.addWorkText, { color: theme.textSecondary }]}>Add Work</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    portfolioGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    portfolioItem: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        position: 'relative',
    },
    portfolioImage: {
        width: '100%',
        height: '100%',
    },
    addWorkCard: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    addWorkText: {
        fontSize: 12,
        marginTop: 8,
    },
    deleteOverlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 4,
    },
});
