import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const BookingConfirmationScreen = ({ route, navigation }: any) => {
    const { theme } = useTheme();
    const { bookingDetails } = route.params || {};
    const { artisan, date, time } = bookingDetails || {
        artisan: { profile: { name: 'Isabelle Dubois' } },
        date: new Date().toISOString(),
        time: '10:00 AM'
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Booking Confirmation</Text>
            </View>

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
                        <Image source={{ uri: artisan.profile?.image || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                        <View>
                            <Text style={[styles.artisanName, { color: theme.text }]}>{artisan.profile?.name}</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>4.8 (120 reviews)</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="construct-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Service</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>Plumbing: Leaky Faucet Repair</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Date & Time</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{time}, {new Date(date).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="location-outline" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Location</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>123 Rue de la Liberté, Douala</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.callButton, { backgroundColor: theme.primary }]}>
                        <Ionicons name="call" size={20} color={theme.background} style={{ marginRight: 8 }} />
                        <Text style={[styles.callButtonText, { color: theme.background }]}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.messageButton, { borderColor: theme.primary }]} onPress={() => navigation.navigate('Chat', {
                        recipientId: artisan._id || artisan.id,
                        recipientName: artisan.profile?.name,
                        recipientAvatar: artisan.profile?.image
                    })}>
                        <Ionicons name="chatbubble" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.messageButtonText, { color: theme.primary }]}>Message</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.doneButton, { backgroundColor: theme.primary }]}
                    onPress={() => navigation.navigate('ClientTabs')}
                >
                    <Text style={[styles.doneButtonText, { color: theme.background }]}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
});
