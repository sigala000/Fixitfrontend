import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChatService } from '../services/chat';
import { socketService } from '../services/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UnreadMessagesContextType {
    totalUnreadCount: number;
    refreshUnreadCount: () => Promise<void>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({
    totalUnreadCount: 0,
    refreshUnreadCount: async () => {},
});

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

export const UnreadMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    const refreshUnreadCount = useCallback(async () => {
        try {
            // Check if user is authenticated before fetching
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setTotalUnreadCount(0);
                return;
            }

            const conversations = await ChatService.getConversations();
            const total = conversations.reduce((sum: number, conv: any) => {
                return sum + (conv.unreadCount || 0);
            }, 0);
            setTotalUnreadCount(total);
        } catch (error: any) {
            // Handle session expired gracefully - just set count to 0
            if (error.message?.includes('Session expired') || error.message?.includes('401')) {
                setTotalUnreadCount(0);
                return;
            }
            // For other errors, just log and keep current count
            console.error('Error refreshing unread count:', error);
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let socketCleanup: (() => void) | undefined;

        // Check authentication before initial load
        const initialize = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                // Only fetch if user is authenticated
                refreshUnreadCount();

                // Setup socket listeners for real-time updates
                const setupSocket = async () => {
                    const socket = await socketService.connect();
                    if (socket) {
                        const handleNewMessage = () => {
                            refreshUnreadCount();
                        };

                        const handleMessagesRead = () => {
                            refreshUnreadCount();
                        };

                        socket.on('new_message', handleNewMessage);
                        socket.on('messages_read', handleMessagesRead);

                        socketCleanup = () => {
                            socket.off('new_message', handleNewMessage);
                            socket.off('messages_read', handleMessagesRead);
                        };
                    }
                };

                setupSocket();

                // Refresh periodically only if authenticated
                interval = setInterval(async () => {
                    const currentToken = await AsyncStorage.getItem('token');
                    if (currentToken) {
                        refreshUnreadCount();
                    } else {
                        setTotalUnreadCount(0);
                    }
                }, 30000); // Every 30 seconds
            } else {
                setTotalUnreadCount(0);
            }
        };

        initialize();

        return () => {
            if (interval) clearInterval(interval);
            if (socketCleanup) socketCleanup();
        };
    }, [refreshUnreadCount]);

    return (
        <UnreadMessagesContext.Provider value={{ totalUnreadCount, refreshUnreadCount }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
};
