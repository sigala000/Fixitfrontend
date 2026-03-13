import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ClientServiceHistoryScreen } from '../screens/ClientServiceHistoryScreen'; // "Bookings"
import { ConversationsListScreen } from '../screens/ConversationsListScreen';
import { ClientProfileScreen } from '../screens/ClientProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useUnreadMessages } from '../context/UnreadMessagesContext';

const Tab = createBottomTabNavigator();

export const ClientNavigator = () => {
    const { totalUnreadCount } = useUnreadMessages();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: 'transparent',
                    height: 60,
                    paddingBottom: Platform.OS === 'ios' ? 15 : 8,
                    paddingTop: 8,
                    borderTopWidth: 0,
                    elevation: 15,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -4,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    borderRadius: 20,
                    marginHorizontal: 30,
                    marginBottom: Platform.OS === 'ios' ? 20 : 10,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    paddingVertical: 8,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'BookingsTab') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'MessagesTab') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    // Add badge dot for Messages tab if there are unread messages
                    if (route.name === 'MessagesTab' && totalUnreadCount > 0) {
                        return (
                            <View style={styles.iconContainer}>
                                <Ionicons name={iconName} size={size} color={color} />
                                <View style={styles.badgeDot} />
                            </View>
                        );
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="BookingsTab"
                component={ClientServiceHistoryScreen}
                options={{ title: 'Bookings' }}
            />
            <Tab.Screen
                name="MessagesTab"
                component={ConversationsListScreen}
                options={{ title: 'Messages' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ClientProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        position: 'relative',
    },
    badgeDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        borderWidth: 1.5,
        borderColor: colors.surface,
    },
});
