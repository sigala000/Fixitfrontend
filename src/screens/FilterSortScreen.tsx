import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// Note: Slider component needs to be installed via @react-native-community/slider in a real app.
// I will simulate it with a View logic or use a simple placeholder if not available.
// Checking package.json... it's not listed. I'll mock a slider or stick to simple options.

export const FilterSortScreen = ({ navigation }: any) => {
    const [sortBy, setSortBy] = useState('Newest');
    const [category, setCategory] = useState('All');
    const [rating, setRating] = useState(4);
    const [isAvailableNow, setIsAvailableNow] = useState(false);

    const categories = ['All', 'Plumber', 'Electrician', 'Painter'];
    const sortOptions = ['Newest', 'Rating', 'Distance'];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Filter & Sort</Text>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sort by</Text>
                <View style={styles.chipsContainer}>
                    {sortOptions.map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.chip, sortBy === opt && styles.chipActive]}
                            onPress={() => setSortBy(opt)}
                        >
                            <Text style={[styles.chipText, sortBy === opt && styles.chipTextActive]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filter by Category</Text>
                <View style={styles.chipsContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, category === cat && styles.chipActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Minimum Rating</Text>
                <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons
                                name="star"
                                size={30}
                                color={star <= rating ? "#FFD700" : colors.textSecondary}
                                style={{ marginHorizontal: 5 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Available Now</Text>
                    <Switch
                        value={isAvailableNow}
                        onValueChange={setIsAvailableNow}
                        trackColor={{ false: '#767577', true: colors.primary }}
                        thumbColor={isAvailableNow ? colors.black : '#f4f3f4'}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.applyButton} onPress={() => navigation.goBack()}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetText: {
        color: colors.primary,
        fontSize: 14,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: colors.surface,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    chipTextActive: {
        color: colors.black,
        fontWeight: 'bold',
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchLabel: {
        color: colors.white,
        fontSize: 16,
    },
    applyButton: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 'auto',
    },
    applyButtonText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
