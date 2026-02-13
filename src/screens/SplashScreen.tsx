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
                    const userData = JSON.parse(user);
                    console.log("Splash Screen - User Logic:", {
                        role: userData.role,
                        onboardingStep: userData.profile?.onboardingStep,
                        id: userData.id || userData._id
                    });

                    // Check role and navigate accordingly
                    if (userData.role === 'artisan') {
                        const onboardingStep = userData.profile?.onboardingStep || 0;

                        if (onboardingStep === 0) {
                            navigation.replace('ArtisanQuestionnaire');
                        } else if (onboardingStep === 1) {
                            navigation.replace('ArtisanIDUpload');
                        } else {
                            navigation.replace('ArtisanTabs');
                        }
                    } else {
                        // All non-artisans (customers/admins) go to client tabs for now
                        navigation.replace('ClientTabs');
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
