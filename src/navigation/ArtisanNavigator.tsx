import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ArtisanDashboardScreen } from '../screens/ArtisanDashboardScreen';
import { ArtisanPortfolioScreen } from '../screens/ArtisanPortfolioScreen';
import { ArtisanProfileScreen } from '../screens/ArtisanProfileScreen'; // Settings/Profile
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

// Note: For "Jobs", ideally we'd have a list of jobs. 
// Reusing Dashboard or creating a specific Job List screen would be better.
// For now, I'll point "Jobs" to Dashboard as well or a placeholder if needed.
// Based on current mock files, Dashboard has the job requests. 
// Let's make "Jobs" tab also point to Dashboard or a new Job List screen if we had one.
// I will use ArtisanDashboardScreen for now as the main hub.

export const ArtisanNavigator = () => {
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

                    if (route.name === 'DashboardTab') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'JobsTab') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'PortfolioTab') {
                        iconName = focused ? 'images' : 'images-outline';
                    } else if (route.name === 'SettingsTab') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="DashboardTab"
                component={ArtisanDashboardScreen}
                options={{ title: 'Dashboard' }}
            />
            {/* Ideally this is a separate Jobs List screen, reusing Dashboard for now or we can make a simple placeholder */}
            <Tab.Screen
                name="JobsTab"
                component={ArtisanDashboardScreen}
                options={{ title: 'Jobs' }}
            />
            <Tab.Screen
                name="PortfolioTab"
                component={ArtisanPortfolioScreen}
                options={{ title: 'Portfolio' }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={ArtisanProfileScreen}
                options={{ title: 'Settings' }}
            />
        </Tab.Navigator>
    );
};
