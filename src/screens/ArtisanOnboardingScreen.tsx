import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const ArtisanOnboardingScreen = ({ navigation }: any) => {
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!bio || !skills || !experience || !phone) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');

            if (!userStr || !token) {
                throw new Error('User not authenticated');
            }

            const user = JSON.parse(userStr);

            // Convert comma-separated skills to array
            const skillsArray = skills.split(',').map(s => s.trim());

            const response = await fetch(`${API_URL}/artisan/${user.id}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bio,
                    skills: skillsArray,
                    experience,
                    phone,
                    // Location would be captured here via Expo Location
                    location: [0, 0] // Placeholder
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Update failed');
            }

            Alert.alert('Success', 'Profile updated! Waiting for admin approval.');
            // Navigate to Dashboard or Status Screen
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Complete Profile</Text>
            <Text style={styles.subtitle}>Tell customers about your services</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Professional Bio</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your expertise..."
                    placeholderTextColor="#666"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Skills (comma separated)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Plumbing, Electrical, Painting..."
                    placeholderTextColor="#666"
                    value={skills}
                    onChangeText={setSkills}
                />

                <Text style={styles.label}>Years of Experience</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 5 years"
                    placeholderTextColor="#666"
                    value={experience}
                    onChangeText={setExperience}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="+237 ..."
                    placeholderTextColor="#666"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Submit for Review</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#00E5FF',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#00E5FF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
