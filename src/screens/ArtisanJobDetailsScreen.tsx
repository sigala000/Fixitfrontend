import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BookingService } from '../services/booking';

export const ArtisanJobDetailsScreen = ({ route, navigation }: any) => {
    const { theme } = useTheme();
    const { booking } = route.params || {};
    const [bookingData, setBookingData] = useState(booking);

    useEffect(() => {
        // Refresh booking data when screen loads
        const fetchBookingDetails = async () => {
            try {
                const bookings = await BookingService.getBookings();
                const currentBooking = bookings.find((b: any) => b._id === booking._id);
                if (currentBooking) {
                    setBookingData(currentBooking);
                }
            } catch (error) {
                console.error('Failed to fetch booking details:', error);
            }
        };

        fetchBookingDetails();
    }, [booking._id]);

    const handleAccept = async () => {
        try {
            await BookingService.updateBookingStatus(bookingData._id, 'accepted');
            Alert.alert('Success', 'Job request accepted!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to accept job request');
        }
    };

    const handleDecline = async () => {
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
                            await BookingService.updateBookingStatus(bookingData._id, 'declined');
                            Alert.alert('Success', 'Job request declined', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'Failed to decline job request');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return { backgroundColor: 'rgba(255, 204, 0, 0.2)', color: '#FFCC00' };
            case 'accepted':
                return { backgroundColor: 'rgba(0, 204, 102, 0.2)', color: '#00CC66' };
            case 'declined':
            case 'cancelled':
                return { backgroundColor: 'rgba(255, 68, 68, 0.2)', color: '#FF4444' };
            default:
                return { backgroundColor: 'rgba(128, 128, 128, 0.2)', color: '#808080' };
        }
    };

    const statusStyle = getStatusColor(bookingData.status);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Job Request Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Customer Information */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Customer Information</Text>
                    <View style={styles.customerRow}>
                        <Image
                            source={{ uri: bookingData.customer?.profile?.avatar || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <View style={styles.customerInfo}>
                            <Text style={[styles.customerName, { color: theme.text }]}>
                                {bookingData.customer?.profile?.name || 'Unknown Customer'}
                            </Text>
                            <Text style={[styles.customerLabel, { color: theme.textSecondary }]}>
                                Service Requester
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Job Information */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Information</Text>
                    
                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="construct-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Service Type</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {bookingData.serviceType || 'General Service'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Date & Time</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {new Date(bookingData.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })} at {bookingData.time}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="location-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Location</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {bookingData.location?.fullAddress || bookingData.location?.address || 'Client Location'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Description</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {bookingData.description || 'No description provided'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="time-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Status</Text>
                            <View style={[styles.statusBadge, statusStyle]}>
                                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                                    {bookingData.status?.charAt(0).toUpperCase() + bookingData.status?.slice(1)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                {bookingData.status === 'pending' && (
                    <View style={styles.actionSection}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.acceptButton, { backgroundColor: theme.primary }]} 
                            onPress={handleAccept}
                        >
                            <Ionicons name="checkmark-circle" size={20} color={theme.background} style={{ marginRight: 8 }} />
                            <Text style={[styles.actionButtonText, { color: theme.background }]}>Accept Job</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionButton, styles.declineButton, { backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 }]} 
                            onPress={handleDecline}
                        >
                            <Ionicons name="close-circle-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
                            <Text style={[styles.actionButtonText, { color: theme.text }]}>Decline Job</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 30,
    },
    section: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    customerLabel: {
        fontSize: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    detailLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionSection: {
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    acceptButton: {
        marginBottom: 10,
    },
    declineButton: {
        marginBottom: 10,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
