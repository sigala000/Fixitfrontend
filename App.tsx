import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

import { registerRootComponent } from 'expo';

import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <StatusBar style="auto" />
                <AppNavigator />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

registerRootComponent(App);
