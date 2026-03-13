import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Design constants based on the provided screenshot
const THEME_COLORS = {
    background: '#121212', // Dark background
    cardBackground: '#1E1E1E', // Slightly lighter for cards
    primary: '#4ADE2A', // Bright green accent
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333'
};

interface Question {
    question: string;
    options: string[];
}

export const ArtisanQuestionnaireScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { theme } = useTheme(); // We will override with our specific dark theme for this screen
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]); // Store index of selected option for each question

    const questions = t('artisan_questionnaire.questions', { returnObjects: true }) as Question[];
    const totalSteps = questions.length;

    const handleOptionSelect = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentStep] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            if (!userStr || !token) throw new Error('Authentication failed');

            const user = JSON.parse(userStr);

            // Format answers to send the actual text selections
            const formattedAnswers = answers.map((ansIndex, qIndex) => ({
                question: questions[qIndex].question,
                answer: questions[qIndex].options[ansIndex]
            }));

            // Simplified payload as per previous implementation logic, but can be adjusted
            const payload = formattedAnswers.map(a => a.answer);

            const response = await fetch(`${API_URL}/artisan/${user.id}/onboarding/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answers: payload
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Submission failed');
            }

            // Update local user object
            user.profile = user.profile || {};
            user.profile.onboardingStep = 1;
            await AsyncStorage.setItem('user', JSON.stringify(user));

            Alert.alert(t('artisan_questionnaire.success'), t('artisan_questionnaire.success_message'), [
                { text: t('artisan_questionnaire.next'), onPress: () => navigation.replace('ArtisanIDUpload') }
            ]);

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
    const currentQuestion = questions[currentStep];
    const isOptionSelected = answers[currentStep] !== undefined;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={THEME_COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHeader}>
                    <Ionicons name="arrow-back" size={24} color={THEME_COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('artisan_questionnaire.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTextContainer}>
                    <Text style={styles.progressLabel}>CURRENT PROGRESS</Text>
                    <Text style={styles.progressStep}>Step {currentStep + 1} of {totalSteps}</Text>
                    <View style={styles.percentageContainer}>
                        <Text style={styles.percentageText}>{Math.round(progressPercentage)}% Complete</Text>
                    </View>
                </View>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Question */}
                <Text style={styles.questionText}>
                    {currentQuestion?.question}
                </Text>
                <Text style={styles.subText}>
                    Select the option that best describes your needs.
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {currentQuestion?.options.map((option, index) => {
                        const isSelected = answers[currentStep] === index;
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                style={[
                                    styles.optionCard,
                                    isSelected && styles.optionCardSelected
                                ]}
                                onPress={() => handleOptionSelect(index)}
                            >
                                <View style={styles.optionContent}>
                                    <View style={styles.iconPlaceholder}>
                                        <Ionicons name="construct" size={20} color={isSelected ? THEME_COLORS.background : THEME_COLORS.primary} />
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </View>
                                <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                                    {isSelected && <View style={styles.radioButtonInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer Navigation */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.navButton, styles.navButtonBack, currentStep === 0 && styles.disabledButton]}
                    onPress={handleBack}
                    disabled={currentStep === 0}
                >
                    <Ionicons name="chevron-back" size={20} color={currentStep === 0 ? THEME_COLORS.textSecondary : THEME_COLORS.text} />
                    <Text style={[styles.navButtonText, { color: currentStep === 0 ? THEME_COLORS.textSecondary : THEME_COLORS.text }]}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navButton, styles.navButtonNext, !isOptionSelected && styles.disabledNextButton]}
                    onPress={handleNext}
                    disabled={!isOptionSelected || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={THEME_COLORS.background} />
                    ) : (
                        <>
                            <Text style={styles.navButtonTextNext}>
                                {currentStep === totalSteps - 1 ? 'Submit' : 'Next Step'}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={THEME_COLORS.background} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME_COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButtonHeader: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME_COLORS.text,
    },
    progressContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    progressTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap'
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: THEME_COLORS.primary,
        textTransform: 'uppercase',
        width: '100%',
        marginBottom: 5
    },
    progressStep: {
        fontSize: 14,
        color: THEME_COLORS.text,
    },
    percentageContainer: {
        backgroundColor: '#2A2A2A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    percentageText: {
        fontSize: 12,
        color: THEME_COLORS.primary,
        fontWeight: 'bold',
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: THEME_COLORS.primary,
        borderRadius: 3,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    questionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME_COLORS.text,
        marginBottom: 10,
        lineHeight: 32,
    },
    subText: {
        fontSize: 16,
        color: THEME_COLORS.textSecondary,
        marginBottom: 30,
    },
    optionsContainer: {
        gap: 15,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: THEME_COLORS.cardBackground,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME_COLORS.border,
    },
    optionCardSelected: {
        borderColor: THEME_COLORS.primary,
        backgroundColor: 'rgba(74, 222, 42, 0.1)', // Very slight green tint
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    optionText: {
        fontSize: 16,
        color: THEME_COLORS.text,
        flex: 1,
        paddingRight: 10,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: THEME_COLORS.primary,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: THEME_COLORS.primary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: THEME_COLORS.background,
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#222',
        justifyContent: 'space-between',
        gap: 15
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 12,
        flex: 1,
    },
    navButtonBack: {
        backgroundColor: '#222',
    },
    navButtonNext: {
        backgroundColor: THEME_COLORS.primary,
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledNextButton: {
        backgroundColor: '#333',
        opacity: 0.7,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    navButtonTextNext: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME_COLORS.background, // Black text on green button
        marginRight: 5,
    }
});
