import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { ChatService } from '../services/chat';
import { socketService } from '../services/socket';
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
        return 'Yesterday';
    } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    } else {
        // Format as date (e.g., "Oct 24")
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

export const ConversationsListScreen = ({ navigation }: any) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { refreshUnreadCount } = useUnreadMessages();

    const loadConversations = useCallback(async () => {
        try {
            // Check if user is authenticated
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setConversations([]);
                return;
            }

            const data = await ChatService.getConversations();
            setConversations(data);
            // Refresh unread count in context
            refreshUnreadCount();
        } catch (error: any) {
            // Handle session expired gracefully
            if (error.message?.includes('Session expired') || error.message?.includes('401')) {
                setConversations([]);
                // Don't log this as it's expected when user is not logged in
                return;
            }
            console.error('Failed to load conversations:', error);
        }
    }, [refreshUnreadCount]);

    useEffect(() => {
        // Get current user
        AsyncStorage.getItem('user').then((userStr) => {
            if (userStr) {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id || user._id);
            }
        });

        // Load conversations
        loadConversations();

        // Connect socket and listen for real-time updates
        const setupSocket = async () => {
            const socket = await socketService.connect();
            if (socket) {
                // Handle new messages - update conversation list
                const handleNewMessage = (newMsg: any) => {
                    const msgSenderId = String(newMsg.sender?._id || newMsg.sender);
                    const msgRecipientId = String(newMsg.recipient?._id || newMsg.recipient);
                    const currentUserIdStr = String(currentUserId);

                    setConversations(prev => {
                        const updated = [...prev];
                        const conversationIndex = updated.findIndex(conv => 
                            String(conv._id) === msgSenderId || String(conv._id) === msgRecipientId
                        );

                        if (conversationIndex !== -1) {
                            // Update existing conversation
                            updated[conversationIndex] = {
                                ...updated[conversationIndex],
                                lastMessage: {
                                    content: newMsg.content,
                                    createdAt: newMsg.createdAt,
                                    read: newMsg.read,
                                    sender: newMsg.sender
                                },
                                unreadCount: msgRecipientId === currentUserIdStr 
                                    ? (updated[conversationIndex].unreadCount || 0) + 1 
                                    : updated[conversationIndex].unreadCount || 0
                            };
                            // Move to top
                            const [moved] = updated.splice(conversationIndex, 1);
                            updated.unshift(moved);
                        } else {
                            // New conversation - reload to get full data
                            loadConversations();
                        }
                        return updated;
                    });
                    // Refresh unread count in context
                    refreshUnreadCount();
                };

                // Handle read receipts - update unread count
                const handleMessagesRead = ({ readerId }: { readerId: string }) => {
                    const readerIdStr = String(readerId);
                    setConversations(prev => prev.map(conv => {
                        if (String(conv._id) === readerIdStr) {
                            return {
                                ...conv,
                                unreadCount: 0,
                                lastMessage: {
                                    ...conv.lastMessage,
                                    read: true
                                }
                            };
                        }
                        return conv;
                    }));
                    // Refresh unread count in context
                    refreshUnreadCount();
                };

                socket.on('new_message', handleNewMessage);
                socket.on('messages_read', handleMessagesRead);

                return () => {
                    socket.off('new_message', handleNewMessage);
                    socket.off('messages_read', handleMessagesRead);
                };
            }
        };

        setupSocket();

        // Reload when screen comes into focus
        const unsubscribe = navigation.addListener('focus', loadConversations);
        return () => {
            unsubscribe();
        };
    }, [navigation, loadConversations, currentUserId, refreshUnreadCount]);

    // Filter conversations based on search query
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery.trim()) return true;
        const name = conv.otherUser?.profile?.name || '';
        const message = conv.lastMessage?.content || '';
        const searchLower = searchQuery.toLowerCase();
        return name.toLowerCase().includes(searchLower) || message.toLowerCase().includes(searchLower);
    });

    const renderItem = ({ item }: any) => {
        const otherUser = item.otherUser;
        const lastMessage = item.lastMessage;
        const unreadCount = item.unreadCount || 0;
        const isUnread = unreadCount > 0;
        const relativeTime = formatRelativeTime(lastMessage.createdAt);
        const hasOnlineStatus = false; // You can implement online status tracking later

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                activeOpacity={0.7}
                onPress={() => {
                    navigation.navigate('Chat', {
                        recipientId: otherUser._id,
                        recipientName: otherUser.profile.name,
                        recipientAvatar: otherUser.profile.avatar
                    });
                    // Reload conversations after navigating back to update unread counts
                    setTimeout(() => loadConversations(), 500);
                }}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: otherUser.profile.avatar || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    {hasOnlineStatus && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <Text style={[styles.name, isUnread && styles.nameUnread]} numberOfLines={1}>
                            {otherUser.profile.name || 'Unknown User'}
                        </Text>
                        <Text style={[styles.time, isUnread && styles.timeUnread]}>{relativeTime}</Text>
                    </View>
                    <View style={styles.lastMessageRow}>
                        <Text 
                            style={[styles.lastMessage, isUnread && styles.lastMessageUnread]} 
                            numberOfLines={1}
                        >
                            {lastMessage.content}
                        </Text>
                        {isUnread && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadBadgeText}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.newMessageButton}>
                    <Ionicons name="create-outline" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search messages"
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Conversations List */}
            <FlatList
                data={filteredConversations}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={50} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No conversations found' : 'No conversations yet.'}
                        </Text>
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
        paddingTop: Platform.OS === 'ios' ? 50 : 50,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: colors.background,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 28,
        fontWeight: 'bold',
    },
    newMessageButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 8,
        paddingHorizontal: 16,
        height: 44,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        color: colors.white,
        fontSize: 15,
        paddingVertical: 0,
    },
    list: {
        paddingHorizontal: 0,
        paddingTop: 8,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    nameUnread: {
        fontWeight: '700',
    },
    time: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    timeUnread: {
        color: colors.primary,
        fontWeight: '600',
    },
    lastMessageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        color: colors.textSecondary,
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    lastMessageUnread: {
        color: colors.white,
        fontWeight: '500',
    },
    unreadBadge: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadBadgeText: {
        color: colors.black,
        fontSize: 11,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        color: colors.textSecondary,
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
});
