import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const RoleSelectionScreen = ({ navigation }: any) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                    <Text style={styles.iconText}>🔧</Text>
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Welcome to FixIt237</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Find skilled labor or offer your services.</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.label, { color: theme.text }]}>I am a...</Text>
                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => navigation.navigate('Signup', { role: 'client' })}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
                            <Text style={styles.cardIcon}>👤</Text>
                        </View>
                        <Text style={[styles.cardText, { color: theme.text }]}>Client</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => navigation.navigate('Signup', { role: 'artisan' })}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: theme.surface === '#FFFFFF' ? '#F0F0F0' : '#2C2C2C' }]}>
                            <Text style={styles.cardIcon}>🛠️</Text>
                        </View>
                        <Text style={[styles.cardText, { color: theme.text }]}>Artisan</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={[styles.line, { backgroundColor: theme.border }]} />
                    <Text style={[styles.orText, { color: theme.textSecondary }]}>OR</Text>
                    <View style={[styles.line, { backgroundColor: theme.border }]} />
                </View>

                <TouchableOpacity style={[styles.googleButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.googleButtonIcon, { color: theme.text }]}>G</Text>
                    <Text style={[styles.googleButtonText, { color: theme.text }]}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.emailButton, { backgroundColor: theme.primary }]}
                    onPress={() => navigation.navigate('Signup')}
                >
                    <Text style={[styles.emailButtonIcon, { color: theme.background }]}>✉️</Text>
                    <Text style={[styles.emailButtonText, { color: theme.background }]}>Sign Up with Email</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                        Already have an account? <Text style={[styles.loginLink, { color: theme.primary }]}>Log in</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginTop: 60,
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        marginBottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    iconText: {
        fontSize: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        marginBottom: 15,
        fontWeight: '600',
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    card: {
        width: '48%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardIcon: {
        fontSize: 24,
    },
    cardText: {
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    line: {
        flex: 1,
        height: 1,
    },
    orText: {
        marginHorizontal: 10,
        fontSize: 12,
    },
    googleButton: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
    },
    googleButtonIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    googleButtonText: {
        fontWeight: '600',
    },
    emailButton: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    emailButtonIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    emailButtonText: {
        fontWeight: 'bold',
    },
    loginText: {
        textAlign: 'center',
    },
    loginLink: {
        fontWeight: 'bold',
    },
});
