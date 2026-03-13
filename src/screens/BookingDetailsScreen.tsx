import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BookingService } from '../services/booking';
import { ReviewService } from '../services/review';

export const BookingDetailsScreen = ({ route, navigation }: any) => {
    const { theme } = useTheme();
    const { booking } = route.params || {};
    const [bookingData, setBookingData] = useState(booking);
    const [hasReview, setHasReview] = useState(false);

    useEffect(() => {
        // Refresh booking data when screen loads
        const fetchBookingDetails = async () => {
            try {
                const bookings = await BookingService.getBookings();
                const currentBooking = bookings.find((b: any) => b._id === booking._id);
                if (currentBooking) {
                    setBookingData(currentBooking);
                    // Check if review exists for completed bookings
                    if (currentBooking.status === 'completed') {
                        try {
                            const review = await ReviewService.getBookingReview(booking._id);
                            if (review) setHasReview(true);
                        } catch {}
                    }
                }
            } catch (error) {
                console.error('Failed to fetch booking details:', error);
            }
        };

        fetchBookingDetails();
    }, [booking._id]);

    const handleCall = () => {
        const phoneNumber = bookingData.artisan?.profile?.phone;
        if (phoneNumber) {
            Alert.alert(
                'Call Artisan',
                `Would you like to call ${bookingData.artisan?.profile?.name} at ${phoneNumber}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => console.log('Making call to:', phoneNumber) }
                ]
            );
        } else {
            Alert.alert('Phone Number', 'Phone number not available');
        }
    };

    const handleMessage = () => {
        navigation.navigate('Chat', {
            recipientId: bookingData.artisan?._id,
            recipientName: bookingData.artisan?.profile?.name,
            recipientAvatar: bookingData.artisan?.profile?.avatar
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return { backgroundColor: 'rgba(0, 204, 102, 0.2)', color: '#00CC66' };
            case 'accepted':
                return { backgroundColor: 'rgba(255, 204, 0, 0.2)', color: '#FFCC00' };
            case 'pending':
                return { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' };
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
                <Text style={[styles.headerTitle, { color: theme.text }]}>Booking Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Artisan Information */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Artisan Information</Text>
                    <View style={styles.artisanRow}>
                        <Image
                            source={{ uri: bookingData.artisan?.profile?.avatar || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <View style={styles.artisanInfo}>
                            <Text style={[styles.artisanName, { color: theme.text }]}>
                                {bookingData.artisan?.profile?.name || 'Unknown Artisan'}
                            </Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                                    {bookingData.artisan?.profile?.rating || '0.0'} ({bookingData.artisan?.profile?.reviewCount || 0} reviews)
                                </Text>
                            </View>
                            {bookingData.artisan?.profile?.phone && (
                                <View style={styles.phoneContainer}>
                                    <Ionicons name="call-outline" size={12} color={theme.textSecondary} />
                                    <Text style={[styles.phoneText, { color: theme.textSecondary }]}>
                                        {bookingData.artisan.profile.phone}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Booking Information */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Booking Information</Text>
                    
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
                <View style={styles.actionSection}>
                    {/* Mark Complete button for accepted bookings */}
                    {bookingData.status === 'accepted' && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#00CC66' }]}
                            onPress={() => {
                                Alert.alert(
                                    'Mark as Complete',
                                    'Are you sure the job has been completed?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Yes, Complete',
                                            onPress: async () => {
                                                try {
                                                    await BookingService.updateBookingStatus(bookingData._id, 'completed');
                                                    setBookingData({ ...bookingData, status: 'completed' });
                                                    Alert.alert('Success', 'Booking marked as completed!');
                                                } catch (error: any) {
                                                    Alert.alert('Error', error.message || 'Failed to update status');
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mark as Complete</Text>
                        </TouchableOpacity>
                    )}

                    {/* Leave Review button for completed bookings */}
                    {bookingData.status === 'completed' && !hasReview && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary }]}
                            onPress={() => navigation.navigate('Review', {
                                bookingId: bookingData._id,
                                artisanId: bookingData.artisan?._id,
                                artisanName: bookingData.artisan?.profile?.name,
                                artisanAvatar: bookingData.artisan?.profile?.avatar
                            })}
                        >
                            <Ionicons name="star" size={20} color={theme.background} style={{ marginRight: 8 }} />
                            <Text style={[styles.actionButtonText, { color: theme.background }]}>Leave a Review</Text>
                        </TouchableOpacity>
                    )}

                    {/* Already reviewed indicator */}
                    {bookingData.status === 'completed' && hasReview && (
                        <View style={[styles.actionButton, { backgroundColor: 'rgba(0, 204, 102, 0.15)' }]}>
                            <Ionicons name="checkmark-circle" size={20} color="#00CC66" style={{ marginRight: 8 }} />
                            <Text style={[styles.actionButtonText, { color: '#00CC66' }]}>Review Submitted</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={handleCall}
                    >
                        <Ionicons name="call" size={20} color={theme.background} style={{ marginRight: 8 }} />
                        <Text style={[styles.actionButtonText, { color: theme.background }]}>Call Artisan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: 'transparent', borderColor: theme.primary, borderWidth: 1 }]}
                        onPress={handleMessage}
                    >
                        <Ionicons name="chatbubble" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.actionButtonText, { color: theme.primary }]}>Send Message</Text>
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
    artisanRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    artisanInfo: {
        flex: 1,
    },
    artisanName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    ratingText: {
        fontSize: 12,
        marginLeft: 5,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneText: {
        fontSize: 12,
        marginLeft: 3,
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
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
