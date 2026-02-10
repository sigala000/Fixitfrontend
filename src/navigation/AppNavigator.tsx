import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { ArtisanOnboardingScreen } from '../screens/ArtisanOnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { ArtisanProfileScreen } from '../screens/ArtisanProfileScreen';
import { ClientProfileScreen } from '../screens/ClientProfileScreen';
import { ClientServiceHistoryScreen } from '../screens/ClientServiceHistoryScreen';
import { ArtisanDashboardScreen } from '../screens/ArtisanDashboardScreen';
import { ArtisanJobRequestScreen } from '../screens/ArtisanJobRequestScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
import { FilterSortScreen } from '../screens/FilterSortScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ArtisanEditProfileScreen } from '../screens/ArtisanEditProfileScreen';
import { ClientEditProfileScreen } from '../screens/ClientEditProfileScreen';
import { ConversationsListScreen } from '../screens/ConversationsListScreen';
import { PaymentMethodsScreen } from '../screens/PaymentMethodsScreen';
import { LanguageScreen } from '../screens/LanguageScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { ArtisanQuestionnaireScreen } from '../screens/ArtisanQuestionnaireScreen';
import { ArtisanIDUploadScreen } from '../screens/ArtisanIDUploadScreen';
import { ClientNavigator } from './ClientNavigator';
import { ArtisanNavigator } from './ArtisanNavigator';

import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();

export const AppNavigator = () => {
    const { theme } = useTheme();

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: theme.background }
                }}
                initialRouteName="Splash"
            >
                {/* Onboarding */}
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />

                {/* Client Flow */}
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Booking" component={BookingScreen} />
                <Stack.Screen name="ArtisanProfile" component={ArtisanProfileScreen} />
                <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
                <Stack.Screen name="ClientServiceHistory" component={ClientServiceHistoryScreen} />

                {/* Artisan Flow */}


                {/* Artisan Flow */}
                <Stack.Screen name="ArtisanOnboarding" component={ArtisanOnboardingScreen} />
                <Stack.Screen name="ArtisanQuestionnaire" component={ArtisanQuestionnaireScreen} />
                <Stack.Screen name="ArtisanIDUpload" component={ArtisanIDUploadScreen} />
                <Stack.Screen name="ArtisanDashboard" component={ArtisanDashboardScreen} />
                <Stack.Screen name="ArtisanJobRequest" component={ArtisanJobRequestScreen} />
                <Stack.Screen name="ArtisanEditProfile" component={ArtisanEditProfileScreen} />

                {/* Shared */}
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="ConversationsList" component={ConversationsListScreen} />
                <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
                <Stack.Screen name="FilterSort" component={FilterSortScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="ClientEditProfile" component={ClientEditProfileScreen} />
                <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
                <Stack.Screen name="Language" component={LanguageScreen} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

                {/* Tab Navigators */}
                <Stack.Screen name="ClientTabs" component={ClientNavigator} />
                <Stack.Screen name="ArtisanTabs" component={ArtisanNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
