import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import './src/i18n';

import { registerRootComponent } from 'expo';

import { ThemeProvider } from './src/context/ThemeContext';
import { UnreadMessagesProvider } from './src/context/UnreadMessagesContext';

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <UnreadMessagesProvider>
                    <StatusBar style="auto" />
                    <AppNavigator />
                </UnreadMessagesProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

registerRootComponent(App);
