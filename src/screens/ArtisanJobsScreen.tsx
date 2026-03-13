import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BookingService } from '../services/booking';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../constants/colors';

export const ArtisanJobsScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [jobRequests, setJobRequests] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadJobRequests = async () => {
        try {
            const bookings = await BookingService.getBookings();
            // Filter only pending job requests
            const pendingJobs = bookings.filter((job: any) => 
                job.status === 'pending' || !job.status
            );
            setJobRequests(pendingJobs);
        } catch (error) {
            console.error('Failed to load job requests:', error);
        }
    };

    useEffect(() => {
        loadJobRequests();

        // Reload on focus
        const unsubscribe = navigation.addListener('focus', loadJobRequests);
        return unsubscribe;
    }, [navigation]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadJobRequests();
        setRefreshing(false);
    };

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
                <Text style={[styles.headerTitle, dynamicStyles.text]}>Job Requests</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
            >
                {jobRequests.length === 0 ? (
                    <View style={[styles.emptyStateContainer, dynamicStyles.surface, { borderColor: theme.border }]}>
                        <Ionicons name="briefcase-outline" size={60} color={theme.textSecondary} />
                        <Text style={[styles.emptyStateTitle, dynamicStyles.text]}>No Job Requests</Text>
                        <Text style={[styles.emptyStateText, dynamicStyles.textSecondary]}>
                            You don't have any pending job requests at the moment.
                        </Text>
                        <Text style={[styles.emptyStateHint, dynamicStyles.textSecondary]}>
                            Make sure your availability is turned on to receive requests.
                        </Text>
                    </View>
                ) : (
                    <>
                        <Text style={[styles.sectionTitle, dynamicStyles.text]}>
                            {jobRequests.length} {jobRequests.length === 1 ? 'Request' : 'Requests'} Pending
                        </Text>

                        {jobRequests.map((job: any) => (
                            <View key={job._id} style={[styles.jobCard, dynamicStyles.surface]}>
                                <View style={styles.jobHeader}>
                                    <View style={styles.jobHeaderLeft}>
                                        <Ionicons name="briefcase" size={20} color={theme.primary} />
                                        <Text style={[styles.jobTitle, dynamicStyles.text]}>
                                            {job.serviceType || 'Service Request'}
                                        </Text>
                                    </View>
                                    <View style={[styles.pendingBadge, { backgroundColor: theme.primary + '20' }]}>
                                        <Text style={[styles.pendingBadgeText, { color: theme.primary }]}>Pending</Text>
                                    </View>
                                </View>

                                <View style={styles.jobInfo}>
                                    <View style={styles.jobInfoRow}>
                                        <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
                                        <Text style={[styles.jobClient, dynamicStyles.textSecondary]}>
                                            {job.customer?.profile?.name || 'Unknown Client'}
                                        </Text>
                                    </View>

                                    <View style={styles.jobInfoRow}>
                                        <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                                        <Text style={[styles.jobLocation, dynamicStyles.textSecondary]} numberOfLines={1}>
                                            {job.location?.address || 'Location provided'}
                                        </Text>
                                    </View>

                                    <View style={styles.jobInfoRow}>
                                        <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                                        <Text style={[styles.jobDate, dynamicStyles.textSecondary]}>
                                            {job.time}, {new Date(job.date).toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </Text>
                                    </View>

                                    {job.description && (
                                        <View style={styles.descriptionContainer}>
                                            <Text style={[styles.descriptionLabel, dynamicStyles.textSecondary]}>Description:</Text>
                                            <Text style={[styles.descriptionText, dynamicStyles.text]}>{job.description}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.jobActions}>
                                    <TouchableOpacity
                                        style={[styles.primaryActionButton, { backgroundColor: theme.primary }]}
                                        onPress={() => navigation.navigate('ArtisanJobDetails', { booking: job })}
                                    >
                                        <Ionicons name="eye-outline" size={18} color={theme.background} />
                                        <Text style={[styles.primaryActionText, { color: theme.background }]}>View Details</Text>
                                    </TouchableOpacity>

                                    <View style={styles.secondaryActionsRow}>
                                        <TouchableOpacity
                                            style={[styles.secondaryActionButton, { backgroundColor: theme.success }]}
                                            onPress={async () => {
                                                try {
                                                    await BookingService.updateBookingStatus(job._id, 'accepted');
                                                    Alert.alert('Success', 'Job request accepted!', [
                                                        { text: 'OK', onPress: loadJobRequests }
                                                    ]);
                                                } catch (error) {
                                                    console.error(error);
                                                    Alert.alert('Error', 'Failed to accept job request');
                                                }
                                            }}
                                        >
                                            <Ionicons name="checkmark" size={16} color={theme.background} />
                                            <Text style={[styles.secondaryActionText, { color: theme.background }]}>Accept</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.secondaryActionButton, { backgroundColor: theme.error }]}
                                            onPress={async () => {
                                                Alert.alert(
                                                    'Decline Job Request',
                                                    'Are you sure you want to decline this job request?',
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        {
                                                            text: 'Decline',
                                                            style: 'destructive',
                                                            onPress: async () => {
                                                                try {
                                                                    await BookingService.updateBookingStatus(job._id, 'declined');
                                                                    Alert.alert('Success', 'Job request declined', [
                                                                        { text: 'OK', onPress: loadJobRequests }
                                                                    ]);
                                                                } catch (error) {
                                                                    console.error(error);
                                                                    Alert.alert('Error', 'Failed to decline job request');
                                                                }
                                                            }
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Ionicons name="close" size={16} color={theme.background} />
                                            <Text style={[styles.secondaryActionText, { color: theme.background }]}>Decline</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Bottom spacing for tab bar */}
                <View style={{ height: 20 }} />
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
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 8,
    },
    jobCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    jobHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
    },
    pendingBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pendingBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    jobInfo: {
        marginBottom: 16,
    },
    jobInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    jobClient: {
        fontSize: 14,
        marginLeft: 8,
    },
    jobLocation: {
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    jobDate: {
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '500',
    },
    descriptionContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    descriptionLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
    },
    jobActions: {
        flexDirection: 'column',
        gap: 12,
        marginTop: 4,
    },
    primaryActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    primaryActionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryActionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    secondaryActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
    },
    secondaryActionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailsButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    detailsButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    acceptButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    chatButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    chatButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    declineButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    declineButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyStateContainer: {
        alignItems: 'center',
        padding: 40,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginTop: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    emptyStateHint: {
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
