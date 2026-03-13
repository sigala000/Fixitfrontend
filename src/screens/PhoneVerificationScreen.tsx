import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PhoneVerificationScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const [generatedCode, setGeneratedCode] = useState('');

    const handleSendCode = () => {
        if (!phoneNumber || phoneNumber.length < 8) {
            Alert.alert(t('phone_verification.error'), t('phone_verification.invalid_number'));
            return;
        }
        setLoading(true);
        // Simulate sending code
        setTimeout(() => {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedCode(code);
            setLoading(false);
            setIsCodeSent(true);
            Alert.alert(
                'Local Test OTP',
                `Your verification code is: ${code}\n\n(In production, this would be sent via SMS)`
            );
            console.log(`[LOCAL TEST] OTP for ${phoneNumber}: ${code}`);
        }, 1500);
    };

    const handleVerify = () => {
        Keyboard.dismiss();
        if (!verificationCode || verificationCode.length !== 6) {
            Alert.alert(t('phone_verification.error'), t('phone_verification.invalid_code'));
            return;
        }

        if (verificationCode !== generatedCode) {
            Alert.alert(t('phone_verification.error'), 'Invalid verification code. Please try again.');
            return;
        }

        setLoading(true);
        // Simulate verification
        setTimeout(async () => {
            try {
                // Store the verified phone number for the signup screen
                await AsyncStorage.setItem('verifiedPhoneNumber', phoneNumber);
                // No need to setLoading(false) here as the screen is being replaced
                navigation.replace('Login');
            } catch (error) {
                console.error('Failed to store phone number:', error);
                setLoading(false);
                Alert.alert('Error', 'Something went wrong. Please try again.');
            }
        }, 1000);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {isCodeSent ? t('phone_verification.verify_title') : t('phone_verification.title')}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {isCodeSent
                            ? t('phone_verification.verify_subtitle')
                            : t('phone_verification.subtitle')}
                    </Text>
                </View>

                <View style={styles.form}>
                    {!isCodeSent ? (
                        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Ionicons name="call-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder={t('phone_verification.placeholder')}
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                            />
                        </View>
                    ) : (
                        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder={t('phone_verification.code_placeholder')}
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="number-pad"
                                maxLength={6}
                                value={verificationCode}
                                onChangeText={setVerificationCode}
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary }]}
                        onPress={isCodeSent ? handleVerify : handleSendCode}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.background} />
                        ) : (
                            <>
                                <Text style={[styles.buttonText, { color: theme.background }]}>
                                    {isCodeSent ? t('phone_verification.verify') : t('phone_verification.send_code')}
                                </Text>
                                <Ionicons
                                    name={isCodeSent ? "checkmark-circle" : "send"}
                                    size={20}
                                    color={theme.background}
                                />
                            </>
                        )}
                    </TouchableOpacity>

                    {isCodeSent && (
                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={() => setIsCodeSent(false)}
                        >
                            <Text style={[styles.resendText, { color: theme.primary }]}>
                                {t('phone_verification.change_number')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 32,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        height: 60,
        marginBottom: 24,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
