import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import { ChatService } from '../services/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ChatScreen = ({ route, navigation }: any) => {
    const { recipientId, recipientName, recipientAvatar } = route.params || {};
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Load current user ID for determining message side
        AsyncStorage.getItem('user').then(userStr => {
            if (userStr) {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id || user._id);
            }
        });
    }, []);

    const fetchMessages = async () => {
        if (!recipientId) return;
        try {
            const data = await ChatService.getConversation(recipientId);
            setMessages(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [recipientId]);

    const sendMessage = async () => {
        if (message.trim().length === 0 || !recipientId) return;

        const tempId = Date.now().toString();
        const optimisticMessage = {
            _id: tempId,
            content: message,
            sender: currentUserId,
            recipient: recipientId,
            createdAt: new Date().toISOString()
        };

        // Optimistic UI update
        setMessages(prev => [...prev, optimisticMessage]);
        setMessage('');

        try {
            await ChatService.sendMessage(recipientId, optimisticMessage.content);
            fetchMessages(); // Refresh to get server ID/timestamp
            flatListRef.current?.scrollToEnd({ animated: true });
        } catch (error) {
            console.error('Failed to send messages:', error);
            // Optionally remove the optimistic message on failure
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const renderMessage = ({ item }: any) => {
        const isMe = item.sender === currentUserId;
        return (
            <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
                {!isMe && <Image source={{ uri: recipientAvatar || 'https://via.placeholder.com/50' }} style={styles.avatar} />}

                <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
                    <Text style={[styles.messageText, isMe ? { color: colors.black } : { color: colors.white }]}>{item.content}</Text>
                    <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {isMe && <View style={{ width: 30 }} />}
            </View>
        );
    };

    if (!recipientId && !recipientName) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.white }}>No conversation selected.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Image source={{ uri: recipientAvatar || 'https://via.placeholder.com/50' }} style={styles.headerAvatar} />
                    <View>
                        <Text style={styles.headerName}>{recipientName || 'Unknown User'}</Text>
                        <Text style={styles.headerStatus}>Online</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerActionBtn}>
                        <Ionicons name="call" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        placeholderTextColor={colors.textSecondary}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color={colors.black} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        backgroundColor: colors.surface,
    },
    backButton: {
        marginRight: 15,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    headerName: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    headerStatus: {
        color: colors.primary,
        fontSize: 12,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerActionBtn: {
        marginLeft: 15,
    },
    messagesList: {
        padding: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 10,
    },
    messageBubble: {
        maxWidth: '70%',
        padding: 15,
        borderRadius: 20,
    },
    myMessageBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 5,
    },
    theirMessageBubble: {
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.white, // Default for dark bg
    },
    timestamp: {
        fontSize: 10,
        marginTop: 5,
        alignSelf: 'flex-end',
    },
    myTimestamp: {
        color: 'rgba(0,0,0,0.6)',
    },
    theirTimestamp: {
        color: colors.textSecondary,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    attachButton: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#2C2C2C',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: colors.white,
        maxHeight: 100,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

/* Patch for text color in my bubble since primary is lime green (light), text should be black */
styles.myMessageBubble = {
    ...styles.myMessageBubble,
};
/* But I cannot easy modify style object after definition in StyleSheet.create with spread like this outside.
I should update the keys inside StyleSheet.create */

/* Correcting style for messageText based on bubble type is tricky without prop. 
I'll just add logic in render: style={[styles.messageText, isMe ? {color: colors.black} : {color: colors.white}]} */

