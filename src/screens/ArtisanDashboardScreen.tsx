import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BookingService } from '../services/booking';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../constants/colors';

export const ArtisanDashboardScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [isAvailable, setIsAvailable] = useState(true);



    const [userProfile, setUserProfile] = useState<any>(null);
    const [jobRequests, setJobRequests] = useState<any[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            // Load Profile
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserProfile(user.profile);
            }

            // Load Bookings
            try {
                const bookings = await BookingService.getBookings();
                setJobRequests(bookings);
            } catch (error) {
                console.error('Failed to load bookings:', error);
            }
        };

        loadDashboardData();

        // Reload on focus
        const unsubscribe = navigation.addListener('focus', loadDashboardData);
        return unsubscribe;
    }, [navigation]);

    const dynamicStyles = {
        container: { backgroundColor: theme.background },
        text: { color: theme.text },
        textSecondary: { color: theme.textSecondary },
        surface: { backgroundColor: theme.surface },
        border: { borderColor: theme.border },
    };

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            {/* Header */}
            <View style={styles.header}>
                {/* Removed Hamburger Menu */}
                <Text style={[styles.headerTitle, dynamicStyles.text]}>Dashboard</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Section */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: userProfile?.avatar || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <View style={[styles.avatarBorder, { borderColor: theme.primary }]} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.name, dynamicStyles.text]}>{userProfile?.name || 'Artisan Name'}</Text>
                        <Text style={[styles.profession, dynamicStyles.textSecondary]}>{userProfile?.skills?.[0] || 'No skills added'}</Text>
                    </View>
                </View>

                {/* Availability Card */}
                <View style={[styles.availabilityCard, dynamicStyles.surface]}>
                    <View style={styles.availabilityContent}>
                        <View>
                            <Text style={[styles.availabilityTitle, dynamicStyles.text]}>Availability</Text>
                            <Text style={[styles.availabilitySubtitle, dynamicStyles.textSecondary]}>Set status to get job requests</Text>
                            <Text style={[styles.statusText, { color: theme.primary }]}>You are {isAvailable ? 'Online' : 'Offline'}</Text>
                        </View>
                        <Switch
                            value={isAvailable}
                            onValueChange={setIsAvailable}
                            trackColor={{ false: '#767577', true: theme.primary }}
                            thumbColor={theme.white}
                            ios_backgroundColor="#3e3e3e"
                        />
                    </View>
                </View>

                {/* Incoming Job Requests */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, dynamicStyles.text]}>Incoming Job Requests</Text>

                    {jobRequests.length === 0 ? (
                        <View style={[styles.emptyStateContainer, dynamicStyles.surface, { borderColor: theme.border }]}>
                            <Ionicons name="calendar-outline" size={40} color={theme.textSecondary} />
                            <Text style={[styles.emptyStateText, dynamicStyles.textSecondary]}>No new job requests yet.</Text>
                        </View>
                    ) : (
                        jobRequests.map((job: any) => (
                            <View key={job._id} style={[styles.jobCard, dynamicStyles.surface]}>
                                <Text style={[styles.jobTitle, dynamicStyles.text]}>{job.serviceType || 'Service Request'}</Text>
                                <Text style={[styles.jobClient, dynamicStyles.textSecondary]}>Client: {job.customer?.profile?.name || 'Unknown'}</Text>
                                <Text style={[styles.jobLocation, dynamicStyles.textSecondary]}><Ionicons name="location-outline" size={12} /> {job.location?.address || 'Location provided'}</Text>
                                <Text style={[styles.jobDate, { color: theme.primary }]}><Ionicons name="time-outline" size={12} /> {job.time}, {new Date(job.date).toLocaleDateString()}</Text>

                                {job.status === 'pending' || !job.status ? (
                                    <View style={styles.jobActions}>
                                        <TouchableOpacity
                                            style={[styles.acceptButton, { backgroundColor: theme.primary }]}
                                            onPress={async () => {
                                                try {
                                                    await BookingService.updateBookingStatus(job._id, 'accepted');
                                                    // Refresh list
                                                    const bookings = await BookingService.getBookings();
                                                    setJobRequests(bookings);
                                                    Alert.alert('Booking Accepted!');
                                                } catch (error) {
                                                    console.error(error);
                                                    Alert.alert('Failed to accept booking');
                                                }
                                            }}
                                        >
                                            <Text style={[styles.acceptButtonText, { color: theme.black }]}>Accept</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.acceptButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.primary }]}
                                            onPress={() => navigation.navigate('Chat', {
                                                recipientId: job.customer?._id || job.customer?.id,
                                                recipientName: job.customer?.profile?.name,
                                                recipientAvatar: job.customer?.profile?.avatar
                                            })}
                                        >
                                            <Text style={[styles.acceptButtonText, { color: theme.primary }]}>Chat</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.declineButton, { backgroundColor: theme.border }]}
                                            onPress={async () => {
                                                try {
                                                    await BookingService.updateBookingStatus(job._id, 'declined');
                                                    // Refresh list
                                                    const bookings = await BookingService.getBookings();
                                                    setJobRequests(bookings);
                                                    Alert.alert('Booking Declined');
                                                } catch (error) {
                                                    console.error(error);
                                                    Alert.alert('Failed to decline booking');
                                                }
                                            }}
                                        >
                                            <Text style={[styles.declineButtonText, { color: theme.text }]}>Decline</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.statusContainer}>
                                        {job.status === 'accepted' ? (
                                            <Text style={styles.acceptedText}>Job has been accepted</Text>
                                        ) : job.status === 'declined' ? (
                                            <Text style={styles.declinedText}>Job has been declined</Text>
                                        ) : (
                                            <Text style={styles.statusText}>{job.status}</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Bottom spacing for tab bar */}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Floating Chat Button */}
            <TouchableOpacity
                style={[styles.floatingButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('ConversationsList')}
            >
                <Ionicons name="chatbubble" size={24} color={theme.black} />
            </TouchableOpacity>
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
    scrollContent: {
        paddingHorizontal: 20,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarBorder: {
        position: 'absolute',
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        top: -4,
        left: -4,
    },
    profileInfo: {
        alignItems: 'center',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profession: {
        fontSize: 14,
    },
    editButton: {
        backgroundColor: '#007AFF', // This was not changed in the instruction, keeping original
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    editButtonText: {
        color: '#000', // This was not changed in the instruction, keeping original
        fontSize: 16,
        fontWeight: 'bold',
    },
    availabilityCard: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
    },
    availabilityContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availabilityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    availabilitySubtitle: {
        fontSize: 12,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    jobCard: {
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    jobClient: {
        fontSize: 13,
        marginBottom: 4,
    },
    jobLocation: {
        fontSize: 13,
        marginBottom: 16,
    },
    jobDate: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: -10,
    },
    jobActions: {
        flexDirection: 'row',
        gap: 10,
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
    },
    acceptButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    declineButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
    },
    declineButtonText: {
        fontSize: 14,
        fontWeight: '600',
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
    },
    portfolioImage: {
        width: '100%',
        height: '100%',
    },
    addWorkCard: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: '#2A2A2A', // This was not changed in the instruction, keeping original
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#3A3A3A', // This was not changed in the instruction, keeping original
        justifyContent: 'center',
        alignItems: 'center',
    },
    addWorkText: {
        color: '#888', // This was not changed in the instruction, keeping original
        fontSize: 12,
        marginTop: 8,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    emptyStateContainer: {
        alignItems: 'center',
        padding: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyStateText: {
        color: colors.textSecondary,
        marginTop: 10,
        fontSize: 14,
    },
    statusContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptedText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    declinedText: {
        color: '#FF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
