import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/auth';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

export const SignupScreen = ({ route, navigation }: any) => {
    const { theme } = useTheme();
    const { role: initialRole } = route.params || {};
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'customer' | 'artisan'>(initialRole === 'client' ? 'customer' : initialRole === 'artisan' ? 'artisan' : 'customer');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.signup({
                name,
                email,
                password,
                role
            });

            // Navigate directly to appropriate tabs based on role
            if (role === 'artisan') {
                navigation.replace('ArtisanQuestionnaire'); // New artisans should go to questionnaire
            } else {
                navigation.replace('ClientTabs');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
                <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join FixIt today</Text>

                <View style={[styles.roleContainer, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity
                        style={[styles.roleButton, role === 'customer' && { backgroundColor: theme.border }]}
                        onPress={() => setRole('customer')}
                    >
                        <Text style={[styles.roleText, { color: theme.textSecondary }, role === 'customer' && { color: theme.primary }]}>Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleButton, role === 'artisan' && { backgroundColor: theme.border }]}
                        onPress={() => setRole('artisan')}
                    >
                        <Text style={[styles.roleText, { color: theme.textSecondary }, role === 'artisan' && { color: theme.primary }]}>Artisan</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        placeholder="Full Name"
                        placeholderTextColor={theme.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />
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

                <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSignup} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={theme.background} />
                    ) : (
                        <Text style={[styles.buttonText, { color: theme.background }]}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.linkText, { color: theme.primary }]}>Already have an account? Login</Text>
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
        flexGrow: 1,
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
        marginBottom: 30,
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        borderRadius: 10,
        padding: 5,
    },
    roleButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    roleText: {
        fontWeight: 'bold',
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
