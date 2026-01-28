import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SplashScreen = () => {
    const navigation = useNavigation<any>();

    useEffect(() => {
        const checkFirstTime = async () => {
            try {
                // Simulate loading or wait for assets
                await new Promise(resolve => setTimeout(resolve, 2000));

                const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
                const user = await AsyncStorage.getItem('user');

                if (user) {
                    // Check role and navigate accordingly
                    const userData = JSON.parse(user);
                    if (userData.userType === 'ARTISAN') {
                        navigation.replace('ArtisanTabs');
                    } else {
                        navigation.replace('ClientTabs'); // Or Home
                    }
                } else if (!hasSeenOnboarding) {
                    navigation.replace('Onboarding');
                } else {
                    navigation.replace('Welcome');
                }
            } catch (error) {
                console.error("Splash screen error:", error);
                navigation.replace('Welcome');
            }
        };

        checkFirstTime();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                {/*  Using the text emoji as placeholder, replace with actual Logo image if available */}
                <Text style={styles.iconText}>🛠️</Text>
                <Text style={styles.title}>FixIt237</Text>
            </View>
        </View>
    );
};

// Need to import Text since I used it above
import { Text } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
    },
    iconText: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 1,
    }
});
