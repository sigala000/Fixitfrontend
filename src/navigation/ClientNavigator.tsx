import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ClientServiceHistoryScreen } from '../screens/ClientServiceHistoryScreen'; // "Bookings"
import { ConversationsListScreen } from '../screens/ConversationsListScreen';
import { ClientProfileScreen } from '../screens/ClientProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

export const ClientNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: '#333',
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
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
