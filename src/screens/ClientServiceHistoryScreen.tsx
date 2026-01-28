import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import { BookingService } from '../services/booking';
import { useFocusEffect } from '@react-navigation/native';

export const ClientServiceHistoryScreen = ({ navigation }: any) => {
    const [selectedTab, setSelectedTab] = useState<'pending' | 'accepted' | 'completed' | 'declined'>('accepted');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await BookingService.getBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchBookings();
        }, [])
    );

    const filteredBookings = bookings.filter(b => {
        if (selectedTab === 'declined') {
            return b.status === 'declined' || b.status === 'cancelled';
        }
        return b.status === selectedTab;
    });

    const renderItem = ({ item }: any) => {
        const artisanName = item.artisan?.profile?.name || 'Unknown Artisan';
        const servicePrice = '$50.00'; // Placeholder as price isn't in model yet

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: item.artisan?.profile?.avatar || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    <View style={styles.cardHeaderInfo}>
                        <Text style={styles.artisanName}>{artisanName}</Text>
                        <Text style={styles.serviceType}>{item.serviceType}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#000" />
                        <Text style={styles.ratingText}>4.8</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.serviceTitle}>{item.serviceType}</Text>
                    <Text style={styles.dateText}>
                        {new Date(item.date).toLocaleDateString()} - {item.time}
                    </Text>
                    <Text style={[styles.dateText, { marginTop: 5, fontSize: 12 }]}>
                        {item.description}
                    </Text>
                </View>

                <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge,
                    item.status === 'completed' ? styles.statusCompleted :
                        item.status === 'accepted' ? styles.statusUpcoming :
                            item.status === 'pending' ? { backgroundColor: 'rgba(255, 255, 255, 0.2)' } :
                                styles.statusCancelled
                    ]}>
                        <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
                    </View>

                    <View style={styles.actionButtons}>
                        {item.status === 'accepted' && (
                            <TouchableOpacity
                                style={styles.rebookButton}
                                onPress={() => navigation.navigate('Chat', {
                                    recipientId: item.artisan?._id,
                                    recipientName: item.artisan?.profile?.name,
                                    recipientAvatar: item.artisan?.profile?.avatar
                                })}
                            >
                                <Text style={styles.rebookButtonText}>Message</Text>
                            </TouchableOpacity>
                        )}
                        {item.status === 'completed' && (
                            <TouchableOpacity style={styles.reviewButton}>
                                <Text style={styles.reviewButtonText}>Review</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Bookings</Text>
                <TouchableOpacity onPress={fetchBookings}>
                    <Ionicons name="refresh" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
                {['pending', 'accepted', 'completed', 'declined'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, selectedTab === tab && styles.tabActive]}
                        onPress={() => setSelectedTab(tab as any)}
                    >
                        <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredBookings}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
                refreshing={loading}
                onRefresh={fetchBookings}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No {selectedTab} bookings found.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#1E1E1E', // Darker surface
        borderRadius: 20,
        marginHorizontal: 5,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    tabTextActive: {
        color: colors.black,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    cardHeaderInfo: {
        flex: 1,
    },
    artisanName: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    serviceType: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        color: colors.black,
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 4,
    },
    cardBody: {
        marginBottom: 15,
    },
    serviceTitle: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dateText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 15,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusCompleted: {
        backgroundColor: 'rgba(0, 204, 102, 0.2)', // Green tint
    },
    statusUpcoming: {
        backgroundColor: 'rgba(255, 204, 0, 0.2)', // Yellow tint
    },
    statusCancelled: {
        backgroundColor: 'rgba(255, 68, 68, 0.2)', // Red tint
    },
    statusText: {
        color: colors.white, // Or specific colors
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    reviewButton: {
        backgroundColor: '#333',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    reviewButtonText: {
        color: colors.white,
        fontSize: 12,
    },
    rebookButton: {
        backgroundColor: colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    rebookButtonText: {
        color: colors.black,
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: colors.textSecondary,
    },
});
