import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { ChatService } from '../services/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ConversationsListScreen = ({ navigation }: any) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadConversations = async () => {
            try {
                // Get current user to filter names if needed or styling
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setCurrentUserId(user.id || user._id);
                }

                const data = await ChatService.getConversations();
                setConversations(data);
            } catch (error) {
                console.error('Failed to load conversations:', error);
            }
        };

        loadConversations();
        const unsubscribe = navigation.addListener('focus', loadConversations);
        return unsubscribe;
    }, [navigation]);

    const renderItem = ({ item }: any) => {
        const otherUser = item.otherUser;
        const lastMessage = item.lastMessage;
        const time = new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => navigation.navigate('Chat', {
                    recipientId: otherUser._id,
                    recipientName: otherUser.profile.name,
                    recipientAvatar: otherUser.profile.avatar
                })}
            >
                <Image
                    source={{ uri: otherUser.profile.avatar || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <Text style={styles.name}>{otherUser.profile.name || 'Unknown User'}</Text>
                        <Text style={styles.time}>{time}</Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {lastMessage.content}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={50} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No conversations yet.</Text>
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
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        color: colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        padding: 20,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    name: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    lastMessage: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: colors.textSecondary,
        marginTop: 10,
        fontSize: 16,
    },
});
