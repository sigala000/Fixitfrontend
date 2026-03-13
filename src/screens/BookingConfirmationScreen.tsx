import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BookingService } from '../services/booking';

export const BookingConfirmationScreen = ({ route, navigation }: any) => {
    const { theme } = useTheme();
    const { bookingDetails } = route.params || {};
    const { bookingId, artisan, date, time, serviceType, location, description } = bookingDetails || {};
    const [bookingReason, setBookingReason] = useState(description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCall = () => {
        const phoneNumber = artisan.profile?.phone;
        if (phoneNumber) {
            Alert.alert(
                'Call Artisan',
                `Would you like to call ${artisan.profile?.name} at ${phoneNumber}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => console.log('Making call to:', phoneNumber) }
                ]
            );
        } else {
            Alert.alert('Phone Number', 'Phone number not available');
        }
    };

    const handleDone = async () => {
        if (!bookingReason.trim()) {
            Alert.alert('Required', 'Please describe what problem you have.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Update booking with user's reason
            await BookingService.updateBookingDescription(bookingId, bookingReason);
            console.log('Booking updated with reason:', bookingReason);
            // Navigate to client tabs after successful submission
            navigation.navigate('ClientTabs');
        } catch (error) {
            console.error('Failed to update booking description:', error);
            Alert.alert('Error', 'Failed to update booking description. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Booking Confirmation</Text>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View style={styles.content}>
                <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark-circle" size={80} color={theme.primary} />
                </View>

                <Text style={[styles.successTitle, { color: theme.text }]}>Your Booking is Confirmed!</Text>
                <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                    The artisan has been notified and will be in touch shortly regarding your request.
                </Text>

                <View style={[styles.bookingCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.artisanRow}>
                        <Image source={{ uri: artisan.profile?.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                        <View>
                            <Text style={[styles.artisanName, { color: theme.text }]}>{artisan.profile?.name || 'Artisan'}</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                                    {artisan.profile?.rating || '0.0'} ({artisan.profile?.reviewCount || 0} reviews)
                                </Text>
                            </View>
                            {artisan.profile?.phone && (
                                <View style={styles.phoneContainer}>
                                    <Ionicons name="call-outline" size={12} color={theme.textSecondary} />
                                    <Text style={[styles.phoneText, { color: theme.textSecondary }]}>{artisan.profile.phone}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="construct-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Service</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{serviceType || 'General Service'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Date & Time</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {time}, {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="location-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Location</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{location?.address || 'Client Location'}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.actionButtons]}>
                    <TouchableOpacity style={[styles.callButton, { backgroundColor: theme.primary }]} onPress={handleCall}>
                        <Ionicons name="call" size={20} color={theme.background} style={{ marginRight: 8 }} />
                        <Text style={[styles.callButtonText, { color: theme.background }]}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.messageButton, { borderColor: theme.primary }]} onPress={() => navigation.navigate('Chat', {
                        recipientId: artisan._id || artisan.id,
                        recipientName: artisan.profile?.name,
                        recipientAvatar: artisan.profile?.avatar
                    })}>
                        <Ionicons name="chatbubble" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.messageButtonText, { color: theme.primary }]}>Message</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.reasonSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.reasonTitle, { color: theme.text }]}>Booking Reason</Text>
                    <Text style={[styles.reasonSubtitle, { color: theme.textSecondary }]}>
                        Please describe what problem you have
                    </Text>
                    <TextInput
                        style={[styles.reasonInput, { 
                            backgroundColor: theme.inputBackground, 
                            borderColor: theme.border,
                            color: theme.text 
                        }]}
                        multiline
                        numberOfLines={4}
                        placeholder="Please describe what problem you have..."
                        placeholderTextColor={theme.textSecondary}
                        value={bookingReason}
                        onChangeText={setBookingReason}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.doneButton, { backgroundColor: theme.primary }]}
                    onPress={handleDone}
                    disabled={isSubmitting}
                >
                    <Text style={[styles.doneButtonText, { color: theme.background }]}>
                        {isSubmitting ? 'Submitting...' : 'Done'}
                    </Text>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    successIconContainer: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    successSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    bookingCard: {
        width: '100%',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
    },
    artisanRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    artisanName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    ratingText: {
        fontSize: 12,
        marginLeft: 5,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    phoneText: {
        fontSize: 11,
        marginLeft: 3,
    },
    divider: {
        height: 1,
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
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
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    callButton: {
        flex: 0.48,
        flexDirection: 'row',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    callButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    messageButton: {
        flex: 0.48,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderWidth: 1,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    doneButton: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    doneButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    reasonSection: {
        width: '100%',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    reasonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    reasonSubtitle: {
        fontSize: 12,
        marginBottom: 15,
    },
    reasonInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        marginBottom: 15,
        minHeight: 100,
    },
    submitReasonButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitReasonButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
