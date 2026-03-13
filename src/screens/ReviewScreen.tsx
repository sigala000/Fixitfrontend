import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ReviewService } from '../services/review';

export const ReviewScreen = ({ route, navigation }: any) => {
    const { theme } = useTheme();
    const { bookingId, artisanId, artisanName, artisanAvatar } = route.params;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating.');
            return;
        }
        if (!comment.trim()) {
            Alert.alert('Comment Required', 'Please write a short review.');
            return;
        }

        setSubmitting(true);
        try {
            await ReviewService.createReview(bookingId, artisanId, rating, comment.trim());
            Alert.alert('Thank You!', 'Your review has been submitted successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Leave a Review</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Artisan Info */}
                <View style={styles.artisanSection}>
                    <Image
                        source={{ uri: artisanAvatar || 'https://via.placeholder.com/80' }}
                        style={[styles.artisanImage, { borderColor: theme.primary }]}
                    />
                    <Text style={[styles.artisanName, { color: theme.text }]}>{artisanName || 'Artisan'}</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>How was your experience?</Text>
                </View>

                {/* Star Rating */}
                <View style={styles.ratingSection}>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                style={styles.starButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={44}
                                    color={star <= rating ? '#FFD700' : theme.textSecondary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {rating > 0 && (
                        <Text style={[styles.ratingLabel, { color: theme.primary }]}>
                            {ratingLabels[rating]}
                        </Text>
                    )}
                </View>

                {/* Comment Input */}
                <View style={styles.commentSection}>
                    <Text style={[styles.commentLabel, { color: theme.text }]}>Write your review</Text>
                    <TextInput
                        style={[styles.commentInput, {
                            backgroundColor: theme.surface,
                            color: theme.text,
                            borderColor: theme.border,
                        }]}
                        placeholder="Share details about your experience..."
                        placeholderTextColor={theme.textSecondary}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        maxLength={500}
                    />
                    <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                        {comment.length}/500
                    </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, {
                        backgroundColor: (rating > 0 && comment.trim()) ? theme.primary : theme.border,
                    }]}
                    onPress={handleSubmit}
                    disabled={submitting || rating === 0 || !comment.trim()}
                    activeOpacity={0.8}
                >
                    {submitting ? (
                        <ActivityIndicator color={theme.black} />
                    ) : (
                        <Text style={[styles.submitButtonText, { color: theme.black }]}>Submit Review</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    artisanSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    artisanImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        marginBottom: 12,
    },
    artisanName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    starButton: {
        paddingHorizontal: 6,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    commentSection: {
        marginBottom: 30,
    },
    commentLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    commentInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        fontSize: 14,
        lineHeight: 22,
        minHeight: 120,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        marginTop: 5,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
