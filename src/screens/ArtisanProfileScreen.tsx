import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/auth';
import { ArtisanService } from '../services/artisan';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../constants/colors';

export const ArtisanProfileScreen = ({ route, navigation }: any) => {
    // If param passed, it's public view. If not, it's personal profile (Settings tab)
    const [isOwner, setIsOwner] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme, isDarkMode } = useTheme();

    useEffect(() => {
        checkOwnership();
    }, [route.params]);

    const checkOwnership = async () => {
        setLoading(true);
        const passedArtisan = route.params?.artisan;
        if (passedArtisan) {
            setUserData(passedArtisan);
            setIsOwner(false);
            setLoading(false);
        } else {
            // Fetch local user data
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                setUserData(JSON.parse(userStr));
                setIsOwner(true);
            }
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await AuthService.logout();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                    });
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator color={theme.primary} />
            </View>
        );
    }

    if (!userData) return null;

    const profile = userData.profile || {};

    // Dynamic Styles construction
    const dynamicStyles = {
        container: { backgroundColor: theme.background },
        text: { color: theme.text },
        textSecondary: { color: theme.textSecondary },
        surface: { backgroundColor: theme.surface },
        icon: { color: theme.white },
        border: { borderColor: theme.border }
    };

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, dynamicStyles.text]}>{isOwner ? 'My Settings' : 'Profile'}</Text>
                {/* Logout removed from header for Owner */}
                {!isOwner && (
                    <TouchableOpacity>
                        <Ionicons name="heart-outline" size={24} color={theme.text} />
                    </TouchableOpacity>
                )}
                {isOwner && <View style={{ width: 24 }} />}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <View style={[styles.imageContainer, { borderColor: theme.primary }]}>
                        <Image source={{ uri: profile.avatar || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
                    </View>
                    <Text style={[styles.name, dynamicStyles.text]}>{profile.name}</Text>
                    <Text style={[styles.title, dynamicStyles.textSecondary]}>{profile.skills?.[0] || 'Artisan'}</Text>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={[styles.ratingText, dynamicStyles.textSecondary]}>{profile.rating || 0} ({profile.reviewCount || 0} Reviews)</Text>
                    </View>

                    {/* Availability Status Indicator */}
                    <View style={[styles.statusContainer, { backgroundColor: profile.isAvailable ? 'rgba(0, 200, 81, 0.1)' : 'rgba(255, 68, 68, 0.1)' }]}>
                        <View style={[styles.statusDot, { backgroundColor: profile.isAvailable ? '#00C851' : '#FF4444' }]} />
                        <Text style={[styles.statusText, { color: profile.isAvailable ? '#00C851' : '#FF4444' }]}>
                            {profile.isAvailable ? 'Available Now' : 'Currently Unavailable'}
                        </Text>
                    </View>
                </View>

                {isOwner ? (
                    <View style={styles.ownerActions}>
                        {/* Availability Toggle */}
                        <View style={[styles.menuItem, dynamicStyles.surface]}>
                            <Ionicons name={profile.isAvailable ? "wifi" : "wifi-outline"} size={24} color={profile.isAvailable ? theme.primary : theme.textSecondary} />
                            <Text style={[styles.menuText, dynamicStyles.text]}>Available for Jobs</Text>
                            <Switch
                                value={profile.isAvailable || false}
                                onValueChange={async (val) => {
                                    // Optimistic update
                                    const updatedProfile = { ...profile, isAvailable: val };
                                    setUserData({ ...userData, profile: updatedProfile });
                                    try {
                                        await ArtisanService.updateProfile(userData._id || userData.id, { isAvailable: val });
                                        // Update local storage
                                        await AsyncStorage.setItem('user', JSON.stringify({ ...userData, profile: updatedProfile }));
                                    } catch (error) {
                                        Alert.alert('Error', 'Failed to update availability status.');
                                        // Revert
                                        setUserData({ ...userData, profile });
                                    }
                                }}
                                trackColor={{ false: '#767577', true: theme.primary }}
                                thumbColor={profile.isAvailable ? theme.white : '#f4f3f4'}
                            />
                        </View>

                        {/* Edit Profile */}
                        <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('ArtisanEditProfile')}>
                            <Ionicons name="create-outline" size={20} color={theme.black} style={{ marginRight: 8 }} />
                            <Text style={[styles.editButtonText, { color: theme.black }]}>Edit Profile</Text>
                        </TouchableOpacity>

                        {/* Theme Toggle */}
                        <View style={[styles.menuItem, dynamicStyles.surface]}>
                            <Ionicons name={isDarkMode ? "moon-outline" : "sunny-outline"} size={24} color={theme.text} />
                            <Text style={[styles.menuText, dynamicStyles.text]}>Dark Mode</Text>
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#767577', true: theme.primary }}
                                thumbColor={isDarkMode ? theme.white : '#f4f3f4'}
                            />
                        </View>

                        {/* Portfolio Management Link */}
                        <TouchableOpacity style={[styles.menuItem, dynamicStyles.surface]} onPress={() => navigation.navigate('ArtisanPortfolio')}>
                            <Ionicons name="images-outline" size={24} color={theme.text} />
                            <Text style={[styles.menuText, dynamicStyles.text]}>Manage Portfolio</Text>
                            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, dynamicStyles.surface]}>
                            <Ionicons name="notifications-outline" size={24} color={theme.text} />
                            <Text style={[styles.menuText, dynamicStyles.text]}>Notifications</Text>
                            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.menuItem, dynamicStyles.surface]}>
                            <Ionicons name="shield-checkmark-outline" size={24} color={theme.text} />
                            <Text style={[styles.menuText, dynamicStyles.text]}>Security</Text>
                            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.menuItem, dynamicStyles.surface]}>
                            <Ionicons name="help-circle-outline" size={24} color={theme.text} />
                            <Text style={[styles.menuText, dynamicStyles.text]}>Help & Support</Text>
                            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>

                        {/* Logout Button Moved Here */}
                        <TouchableOpacity style={[styles.menuItem, dynamicStyles.surface, { marginTop: 20 }]} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={24} color={theme.error || '#FF4444'} />
                            <Text style={[styles.menuText, { color: theme.error || '#FF4444' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={[styles.callButton, dynamicStyles.surface, dynamicStyles.border]}>
                                <Ionicons name="call-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
                                <Text style={[styles.actionButtonText, dynamicStyles.text]}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.messageButton, dynamicStyles.surface, dynamicStyles.border]}
                                onPress={() => navigation.navigate('Chat', {
                                    recipientId: userData._id || userData.id,
                                    recipientName: profile.name,
                                    recipientAvatar: profile.avatar
                                })}
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
                                <Text style={[styles.actionButtonText, dynamicStyles.text]}>Message</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Viewing Details Sections */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, dynamicStyles.text]}>About</Text>
                            <Text style={[styles.bioText, dynamicStyles.textSecondary]}>{profile.bio || 'No bio available.'}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Skills</Text>
                            <View style={styles.skillsContainer}>
                                {profile.skills?.map((skill: string, index: number) => (
                                    <View key={index} style={[styles.skillChip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                                        <Text style={[styles.skillText, dynamicStyles.textSecondary]}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Portfolio Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Portfolio</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {profile.portfolio?.length > 0 ? (
                                    profile.portfolio.map((img: string, idx: number) => (
                                        <Image key={idx} source={{ uri: img }} style={styles.portfolioImage} />
                                    ))
                                ) : (
                                    <View style={{ padding: 20, alignItems: 'center', width: 200 }}>
                                        <Text style={{ color: theme.textSecondary }}>No portfolio images yet.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        {/* Reviews Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Reviews</Text>
                            {userData.reviews && userData.reviews.length > 0 ? (
                                userData.reviews.map((review: any, idx: number) => (
                                    <View key={idx} style={[styles.reviewCard, dynamicStyles.surface]}>
                                        <View style={styles.reviewHeader}>
                                            <Image source={{ uri: review.userAvatar || 'https://via.placeholder.com/40' }} style={styles.reviewAvatar} />
                                            <View>
                                                <Text style={[styles.reviewUser, dynamicStyles.text]}>{review.userName || 'Client'}</Text>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Ionicons key={i} name="star" size={12} color={i < (review.rating || 0) ? "#FFD700" : theme.textSecondary} />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={[styles.reviewText, dynamicStyles.textSecondary]}>"{review.comment}"</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>No reviews yet.</Text>
                            )}
                        </View>
                    </>
                )}

                {/* Owner specific content removed (moved to menu settings above) */}


                {!isOwner && (
                    <View style={[styles.footer, dynamicStyles.container, { borderTopColor: theme.border }]}>
                        <TouchableOpacity
                            style={[styles.bookButton, { backgroundColor: theme.primary }]}
                            onPress={() => navigation.navigate('Booking', { artisan: userData })}
                        >
                            <Text style={[styles.bookButtonText, { color: theme.black }]}>Book Now</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        padding: 2,
        marginBottom: 10,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    title: {
        fontSize: 16,
        marginBottom: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    callButton: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
    },
    messageButton: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
    },
    actionButtonText: {
        fontWeight: '600',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillChip: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
    },
    skillText: {
        fontSize: 12,
    },
    ownerActions: {
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    editButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    editButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 15,
    },
    bioText: {
        fontSize: 14,
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
    },
    bookButton: {
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    portfolioImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginRight: 10,
    },
    reviewCard: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    reviewUser: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    sectionTitleRow: {
        marginBottom: 15,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
