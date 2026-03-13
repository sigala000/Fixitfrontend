import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../config';

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public async connect(): Promise<Socket | null> {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return null;

            if (this.socket && this.socket.connected) {
                return this.socket;
            }

            // In React Native/Expo, we don't need .js extension for imports usually, 
            // but for socket.io-client URL, we just point to base URL
            this.socket = io(SERVER_URL, {
                auth: { token },
                transports: ['websocket'],
                autoConnect: true
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('connect_error', (err: any) => {
                console.error('Socket connection error:', err);
            });

            return this.socket;
        } catch (error) {
            console.error('Error initializing socket:', error);
            return null;
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public joinChat(chatId: string) {
        if (this.socket) {
            this.socket.emit('join_chat', chatId);
        }
    }

    public sendMessage(recipientId: string, content: string) {
        // We emit via REST API usually for persistence, but if we wanted pure socket:
        // this.socket.emit('send_message', { recipientId, content });
    }

    public markAsRead(senderId: string) {
        if (this.socket) {
            this.socket.emit('mark_read', { senderId });
        }
    }

    public onMessageReceived(callback: (message: any) => void) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    public onMessagesRead(callback: (data: { readerId: string }) => void) {
        if (this.socket) {
            this.socket.on('messages_read', callback);
        }
    }

    public onMessageSent(callback: (message: any) => void) {
        if (this.socket) {
            this.socket.on('message_sent', callback);
        }
    }

    public off(event: string) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export const socketService = SocketService.getInstance();
