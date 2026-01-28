import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { NotificationService } from '../services/notification';

export const NotificationsScreen = ({ navigation }: any) => {
    const [notifications, setNotifications] = React.useState<any[]>([]);

    const fetchNotifications = async () => {
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
        const unsubscribe = navigation.addListener('focus', fetchNotifications);
        return unsubscribe;
    }, [navigation]);

    const handleMarkAsRead = async (item: any) => {
        if (!item.read) {
            try {
                await NotificationService.markAsRead(item._id);
                // Optimistic update
                setNotifications(prev =>
                    prev.map(n => n._id === item._id ? { ...n, read: true } : n)
                );
            } catch (error) {
                console.error(error);
            }
        }

        // Navigate based on type
        if (item.type === 'booking_update' || item.type === 'message') {
            // For now just stay here or maybe navigate to booking history/chat
            // navigation.navigate('BookingHistory');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking_update': return 'calendar';
            case 'message': return 'chatbubble-ellipses';
            case 'review': return 'star';
            case 'promo': return 'pricetag';
            default: return 'notifications';
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.notificationItem, item.read ? null : styles.unreadItem]}
            onPress={() => handleMarkAsRead(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.read ? '#333' : colors.primary }]}>
                <Ionicons name={getIcon(item.type) as any} size={20} color={item.read ? colors.textSecondary : colors.black} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ color: colors.textSecondary }}>No notifications yet</Text>
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
    headerTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    markAllText: {
        color: colors.primary,
        fontSize: 12,
    },
    filterTabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    activeTabText: {
        color: colors.black,
        fontSize: 12,
        fontWeight: 'bold',
    },
    list: {
        paddingHorizontal: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        backgroundColor: colors.surface,
        marginBottom: 10,
        alignItems: 'flex-start',
    },
    unreadItem: {
        borderWidth: 1,
        borderColor: colors.primary, // Highlight unread
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    content: {
        flex: 1,
    },
    title: {
        color: colors.white,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    message: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 5,
        lineHeight: 18,
    },
    time: {
        color: colors.textSecondary,
        fontSize: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: 10,
        marginTop: 5,
    },
});
