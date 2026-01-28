import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export const ClientProfileScreen = ({ navigation }: any) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadUserData = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserData();
        setRefreshing(false);
    };

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>Loading profile...</Text>
            </View>
        );
    }

    // Dynamic styles
    const dynamicStyles = {
        container: { backgroundColor: theme.background },
        text: { color: theme.text },
        textSecondary: { color: theme.textSecondary },
        surface: { backgroundColor: theme.surface },
        icon: { color: theme.white } // or theme.text
    };

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, dynamicStyles.text]}>Profile</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ClientEditProfile')}>
                    <Ionicons name="pencil" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
            >
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: user.profile?.avatar || 'https://via.placeholder.com/100' }}
                            style={styles.avatar}
                        />
                        <View style={[styles.verifiedBadge, { backgroundColor: theme.primary, borderColor: theme.background }]}>
                            <Ionicons name="checkmark" size={12} color={theme.black} />
                        </View>
                    </View>
                    <Text style={[styles.userName, dynamicStyles.text]}>{user.profile?.name || 'User'}</Text>
                    <Text style={[styles.userLocation, dynamicStyles.textSecondary]}>{user.profile?.location?.address || 'No location set'}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, dynamicStyles.textSecondary]}>Personal Information</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ClientEditProfile')}>
                            <Text style={[styles.editText, { color: theme.primary }]}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.infoCard, dynamicStyles.surface]}>
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={20} color={theme.primary} style={styles.infoIcon} />
                            <View>
                                <Text style={[styles.infoLabel, dynamicStyles.textSecondary]}>Phone Number</Text>
                                <Text style={[styles.infoValue, dynamicStyles.text]}>{user.profile?.phone || 'Not set'}</Text>
                            </View>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={20} color={theme.primary} style={styles.infoIcon} />
                            <View>
                                <Text style={[styles.infoLabel, dynamicStyles.textSecondary]}>Email</Text>
                                <Text style={[styles.infoValue, dynamicStyles.text]}>{user.email}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, dynamicStyles.textSecondary]}>Settings</Text>

                    {/* Theme Toggle */}
                    <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                        <Ionicons name={isDarkMode ? "moon-outline" : "sunny-outline"} size={22} color={theme.text} style={styles.settingIcon} />
                        <Text style={[styles.settingText, dynamicStyles.text]}>Dark Mode</Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: theme.primary }}
                            thumbColor={isDarkMode ? theme.white : '#f4f3f4'}
                        />
                    </View>

                    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Notifications')}>
                        <Ionicons name="notifications-outline" size={22} color={theme.text} style={styles.settingIcon} />
                        <Text style={[styles.settingText, dynamicStyles.text]}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('PaymentMethods')}>
                        <Ionicons name="card-outline" size={22} color={theme.text} style={styles.settingIcon} />
                        <Text style={[styles.settingText, dynamicStyles.text]}>Payment Methods</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Language')}>
                        <Ionicons name="globe-outline" size={22} color={theme.text} style={styles.settingIcon} />
                        <Text style={[styles.settingText, dynamicStyles.text]}>Language</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('HelpSupport')}>
                        <Ionicons name="help-circle-outline" size={22} color={theme.text} style={styles.settingIcon} />
                        <Text style={[styles.settingText, dynamicStyles.text]}>Help & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={async () => {
                            await AsyncStorage.clear();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Welcome' }],
                            });
                        }}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#FF4444" style={styles.logoutIcon} />
                        <Text style={styles.logoutText}>Log Out</Text>
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
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userLocation: {
        fontSize: 14,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    editText: {
        fontSize: 12,
    },
    infoCard: {
        borderRadius: 12,
        padding: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoIcon: {
        marginRight: 15,
    },
    infoLabel: {
        fontSize: 12,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    settingIcon: {
        marginRight: 15,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    logoutIcon: {
        marginRight: 15,
    },
    logoutText: {
        color: '#FF4444',
        fontSize: 16,
    },
});
