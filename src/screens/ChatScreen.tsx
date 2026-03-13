import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { ChatService } from '../services/chat';
import { socketService } from '../services/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to format date groups
const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
};

export const ChatScreen = ({ route, navigation }: any) => {
    const { recipientId, recipientName, recipientAvatar } = route.params || {};
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        let isMounted = true;
        let socketCleanup: (() => void) | undefined;
        
        const setupSocket = async () => {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr || !isMounted) return;
            
            const user = JSON.parse(userStr);
            const userId = user.id || user._id;
            setCurrentUserId(userId);

            // Connect to socket
            const socket = await socketService.connect();
            if (!socket || !isMounted) return;

            // Join the chat room for this conversation
            socketService.joinChat(recipientId);

                    // Handle incoming messages (only from recipient, not our own)
                    const handleNewMessage = (newMsg: any) => {
                        if (!isMounted) return;
                        
                        const msgSenderId = String(newMsg.sender?._id || newMsg.sender);
                        const msgRecipientId = String(newMsg.recipient?._id || newMsg.recipient);
                        const currentUserIdStr = String(userId);
                        const recipientIdStr = String(recipientId);

                        // Only process messages in this conversation
                        if (msgSenderId === recipientIdStr || msgRecipientId === recipientIdStr) {
                            // Skip messages we sent ourselves (we handle those via message_sent event)
                            if (msgSenderId === currentUserIdStr) {
                                return;
                            }
                            
                            // Check if message already exists (avoid duplicates)
                            setMessages(prev => {
                                const exists = prev.some(m => {
                                    const mId = String(m._id);
                                    const newMsgId = String(newMsg._id);
                                    return mId === newMsgId || (m.tempId && mId === newMsgId);
                                });
                                if (exists) return prev;
                                
                                // If I'm receiving a message from recipient, mark as read immediately
                                if (msgSenderId === recipientIdStr && msgRecipientId === currentUserIdStr) {
                                    // Mark as read via API
                                    ChatService.markAsRead(recipientIdStr).catch(console.error);
                                }
                                
                                return [...prev, newMsg];
                            });
                        }
                    };

            // Handle message sent confirmation (for delivered status)
            const handleMessageSent = (sentMsg: any) => {
                if (!isMounted) return;
                
                const msgRecipientId = String(sentMsg.recipient?._id || sentMsg.recipient);
                const recipientIdStr = String(recipientId);
                const sentMsgId = String(sentMsg._id);
                
                if (msgRecipientId === recipientIdStr) {
                    setMessages(prev => {
                        // Check if message already exists with this ID
                        const existingIndex = prev.findIndex(m => String(m._id) === sentMsgId);
                        if (existingIndex !== -1) {
                            // Update existing message
                            const updated = [...prev];
                            updated[existingIndex] = { ...sentMsg, deliveredAt: sentMsg.deliveredAt };
                            return updated;
                        }
                        
                        // Replace optimistic message (tempId) with actual message
                        const tempIndex = prev.findIndex(m => m.tempId);
                        if (tempIndex !== -1) {
                            const updated = [...prev];
                            updated[tempIndex] = { ...sentMsg, deliveredAt: sentMsg.deliveredAt };
                            return updated;
                        }
                        
                        // If no temp message found, add the new message (shouldn't happen, but safety check)
                        return prev;
                    });
                }
            };

                    // Handle read receipts
                    const handleMessagesRead = ({ readerId }: { readerId: string }) => {
                        if (!isMounted) return;
                        
                        const readerIdStr = String(readerId);
                        const recipientIdStr = String(recipientId);
                        const currentUserIdStr = String(userId);
                        
                        if (readerIdStr === recipientIdStr) {
                            // Recipient read my messages
                            setMessages(prev => prev.map(msg => {
                                const msgSenderId = String(msg.sender?._id || msg.sender);
                                if (msgSenderId === currentUserIdStr && !msg.read) {
                                    return { ...msg, read: true, readAt: new Date() };
                                }
                                return msg;
                            }));
                        }
                    };

            socket.on('new_message', handleNewMessage);
            socket.on('message_sent', handleMessageSent);
            socket.on('messages_read', handleMessagesRead);

            socketCleanup = () => {
                socket.off('new_message', handleNewMessage);
                socket.off('message_sent', handleMessageSent);
                socket.off('messages_read', handleMessagesRead);
            };
        };

        setupSocket();

        return () => {
            isMounted = false;
            if (socketCleanup) socketCleanup();
        };
    }, [recipientId]);

    const fetchMessages = async () => {
        if (!recipientId || !currentUserId) return;
        try {
            const data = await ChatService.getConversation(recipientId);
            setMessages(data);
            // Mark fetched messages as read (both socket and API)
            socketService.markAsRead(recipientId);
            ChatService.markAsRead(recipientId).catch(console.error);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (currentUserId) {
            fetchMessages();
        }
    }, [recipientId, currentUserId]);

    const sendMessage = async () => {
        if (message.trim().length === 0 || !recipientId || !currentUserId) return;

        const tempId = `temp_${Date.now()}`;
        const messageContent = message.trim();
        const optimisticMessage = {
            _id: tempId,
            tempId: tempId,
            content: messageContent,
            sender: currentUserId,
            recipient: recipientId,
            createdAt: new Date().toISOString(),
            read: false,
            deliveredAt: null
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setMessage('');

        try {
            const sentMessage = await ChatService.sendMessage(recipientId, messageContent);
            // The socket 'message_sent' event will update the optimistic message with actual data
            // So we don't need to update here - just let the socket handler do it
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
            setMessage(messageContent); // Restore message text
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    // Handle keyboard show/hide
    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const renderMessage = ({ item, index }: any) => {
        // Normalize sender ID comparison (handle both ObjectId and string formats)
        const itemSenderId = String(item.sender?._id || item.sender);
        const currentUserIdStr = String(currentUserId);
        const isMe = itemSenderId === currentUserIdStr;
        
        const prevMessage = messages[index - 1];
        const showDateGroup = !prevMessage || getFormattedDate(prevMessage.createdAt) !== getFormattedDate(item.createdAt);

        return (
            <View>
                {showDateGroup && (
                    <View style={styles.dateGroupContainer}>
                        <Text style={styles.dateGroupText}>{getFormattedDate(item.createdAt)}</Text>
                    </View>
                )}
                <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
                    <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
                        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.content}</Text>
                        <View style={styles.metaContainer}>
                            <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            {isMe && (
                                <View style={styles.statusContainer}>
                                    {item.deliveredAt ? (
                                        <Ionicons
                                            name={item.read ? "checkmark-done" : "checkmark-done-outline"}
                                            size={16}
                                            color={item.read ? "#34B7F1" : "rgba(255,255,255,0.6)"}
                                            style={{ marginLeft: 5 }}
                                        />
                                    ) : (
                                        <Ionicons
                                            name="checkmark-outline"
                                            size={16}
                                            color="rgba(255,255,255,0.6)"
                                            style={{ marginLeft: 5 }}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    if (!recipientId && !recipientName) return null;

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Image source={{ uri: recipientAvatar || 'https://via.placeholder.com/50' }} style={styles.headerAvatar} />
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{recipientName || 'Unknown'}</Text>
                    <Text style={styles.headerStatus}>Online</Text>
                </View>
                <TouchableOpacity style={styles.headerActionBtn}>
                    <Ionicons name="videocam" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerActionBtn}>
                    <Ionicons name="call" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* KeyboardAvoidingView wraps messages and input */}
            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => {
                        // Use a more unique key to prevent duplicates
                        const id = item._id || item.tempId;
                        return id ? String(id) : `msg-${index}-${item.createdAt}`;
                    }}
                    contentContainerStyle={styles.messagesList}
                    keyboardShouldPersistTaps="handled"
                    style={styles.messagesContainer}
                    showsVerticalScrollIndicator={false}
                />

                {/* Input Container */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message"
                        placeholderTextColor="#aaa"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        onFocus={() => {
                            setTimeout(() => {
                                flatListRef.current?.scrollToEnd({ animated: true });
                            }, 300);
                        }}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b141a' }, // WhatsApp dark bg usually #0b141a
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 10 : 50,
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#1f2c34', // WhatsApp dark header
        zIndex: 10,
    },
    keyboardView: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    backButton: { marginRight: 10 },
    headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    headerInfo: { flex: 1 },
    headerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    headerStatus: { color: '#aaa', fontSize: 12 },
    headerActionBtn: { marginLeft: 20 },

    messagesList: { paddingHorizontal: 10, paddingBottom: 20 },
    dateGroupContainer: { alignItems: 'center', marginVertical: 10 },
    dateGroupText: { color: '#8696a0', backgroundColor: '#1f2c34', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, fontSize: 12 },

    messageRow: { marginBottom: 10, flexDirection: 'row' },
    myMessageRow: { justifyContent: 'flex-end' },
    theirMessageRow: { justifyContent: 'flex-start' },

    messageBubble: {
        maxWidth: '75%',
        padding: 10,
        borderRadius: 10,
    },
    myMessageBubble: { backgroundColor: '#005c4b', borderTopRightRadius: 0 }, // WhatsApp dark outgoing
    theirMessageBubble: { backgroundColor: '#1f2c34', borderTopLeftRadius: 0 }, // WhatsApp dark incoming

    messageText: { fontSize: 16 },
    myMessageText: { color: '#fff' }, // White text on dark green bubble
    theirMessageText: { color: '#fff' }, // White text on dark grey bubble
    metaContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 3 },
    timestamp: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
    myTimestamp: { color: 'rgba(255,255,255,0.6)' }, // In dark mode bubble is dark green so white text
    statusContainer: { marginLeft: 4 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#1f2c34',
        marginHorizontal: 10,
        marginBottom: Platform.OS === 'ios' ? 10 : 20,
        borderRadius: 25,
    },
    attachButton: { marginRight: 10 },
    input: { flex: 1, color: '#fff', maxHeight: 100, fontSize: 16 },
    sendButton: { backgroundColor: '#00a884', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});

// Little patch for my bubble text color if needed, but styling above handles it
