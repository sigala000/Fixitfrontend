import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/auth';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

export const LoginScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.login(email, password);

            // Check user role and navigate accordingly
            if (response.user.role === 'artisan') {
                const onboardingStep = response.user.profile?.onboardingStep || 0;

                if (onboardingStep === 0) {
                    navigation.replace('ArtisanQuestionnaire');
                } else if (onboardingStep === 1) {
                    navigation.replace('ArtisanIDUpload');
                } else {
                    navigation.replace('ArtisanTabs');
                }
            } else {
                navigation.replace('ClientTabs');
            }
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.message || 'An error occurred during login. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to continue</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        placeholder="Email"
                        placeholderTextColor={theme.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, styles.passwordInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Password"
                            placeholderTextColor={theme.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={24}
                                color={theme.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={theme.background} />
                    ) : (
                        <Text style={[styles.buttonText, { color: theme.background }]}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={[styles.linkText, { color: theme.primary }]}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.debugContainer}>
                    <Text style={styles.debugText}>
                        Debug Config: {API_URL}
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        marginBottom: 0,
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        height: '100%',
        justifyContent: 'center',
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkText: {
        textAlign: 'center',
        fontSize: 14,
    },
    debugContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 5,
    },
    debugText: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
    },
});
