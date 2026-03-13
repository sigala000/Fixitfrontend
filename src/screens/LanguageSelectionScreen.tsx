import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const LanguageSelectionScreen = ({ navigation }: any) => {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    const languages = [
        { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
        { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
    ];

    const handleLanguageSelect = async (code: string) => {
        setSelectedLanguage(code);
        await i18n.changeLanguage(code);
        await AsyncStorage.setItem('user-language', code);
    };

    const handleContinue = () => {
        navigation.navigate('PhoneVerification');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {t('language_selection.title')}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {t('language_selection.subtitle')}
                    </Text>
                </View>

                <View style={styles.languageList}>
                    {languages.map((item) => (
                        <TouchableOpacity
                            key={item.code}
                            style={[
                                styles.languageItem,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                selectedLanguage === item.code && { borderColor: theme.primary, borderWidth: 2 }
                            ]}
                            onPress={() => handleLanguageSelect(item.code)}
                        >
                            <View style={styles.languageInfo}>
                                <Text style={styles.flag}>{item.flag}</Text>
                                <View>
                                    <Text style={[styles.languageLabel, { color: theme.text }]}>{item.label}</Text>
                                    <Text style={[styles.nativeLabel, { color: theme.textSecondary }]}>{item.nativeLabel}</Text>
                                </View>
                            </View>
                            {selectedLanguage === item.code && (
                                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: theme.primary }]}
                    onPress={handleContinue}
                >
                    <Text style={[styles.continueText, { color: theme.background }]}>
                        {t('language_selection.continue')}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color={theme.background} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    languageList: {
        marginBottom: 40,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flag: {
        fontSize: 32,
        marginRight: 16,
    },
    languageLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    nativeLabel: {
        fontSize: 14,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 8,
    },
    continueText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
