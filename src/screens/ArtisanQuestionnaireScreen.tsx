import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

export const ArtisanQuestionnaireScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({
        q1: '', q2: '', q3: '', q4: '', q5: '',
        q6: '', q7: '', q8: '', q9: '', q10: ''
    });

    const questions = [
        "1. What is your primary area of expertise?",
        "2. How many years of professional experience do you have?",
        "3. Do you possess a valid certification for your trade?",
        "4. Are you available for emergency service calls?",
        "5. Do you own your own set of professional tools?",
        "6. Can you provide at least two professional references?",
        "7. What is your estimated hourly rate range?",
        "8. Do you have professional liability insurance?",
        "9. Are you willing to undergo a background check?",
        "10. Briefly describe your work philosophy."
    ];

    const handleChange = (key: string, text: string) => {
        setAnswers(prev => ({ ...prev, [key]: text }));
    };

    const handleSubmit = async () => {
        // Check if all fields are filled
        if (Object.values(answers).some(a => a.trim() === '')) {
            Alert.alert('Incomplete', 'Please answer all 10 questions to proceed.');
            return;
        }

        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            if (!userStr || !token) throw new Error('Authentication failed');

            const user = JSON.parse(userStr);

            const response = await fetch(`${API_URL}/artisan/${user.id}/onboarding/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answers: Object.values(answers)
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

            Alert.alert('Success', 'Questionnaire completed!', [
                { text: 'Next', onPress: () => navigation.replace('ArtisanIDUpload') }
            ]);

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
                    <Text style={[styles.title, { color: theme.text }]}>Data Collection</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Please answer the following questions to verify your expertise.</Text>

                    {questions.map((q, index) => (
                        <View key={index} style={styles.questionContainer}>
                            <Text style={[styles.questionText, { color: theme.primary }]}>{q}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="Your answer..."
                                placeholderTextColor={theme.textSecondary}
                                value={answers[`q${index + 1}` as keyof typeof answers]}
                                onChangeText={(text) => handleChange(`q${index + 1}`, text)}
                            />
                        </View>
                    ))}

                    <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={theme.background} />
                        ) : (
                            <Text style={[styles.buttonText, { color: theme.background }]}>Next: Upload ID</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    input: {
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
