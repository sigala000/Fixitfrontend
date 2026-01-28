import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BookingService } from '../services/booking';

export const BookingScreen = ({ route, navigation }: any) => {
    const { theme, isDarkMode } = useTheme();
    const artisan = route.params?.artisan || { profile: { name: 'John Doe', skill: 'Professional' } };

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState<'date' | 'time'>('date');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM',
        '01:30 PM', '02:30 PM', '03:30 PM',
        '04:30 PM'
    ];

    const onChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = (currentMode: 'date' | 'time') => {
        setShow(true);
        setMode(currentMode);
    };

    const handleBooking = async () => {
        if (!selectedTimeSlot) {
            Alert.alert('Required', 'Please select a time slot.');
            return;
        }

        setLoading(true);
        try {
            // Mock location for now
            const location = {
                address: 'My Current Location',
                coordinates: [0, 0]
            };

            await BookingService.createBooking({
                artisanId: artisan._id,
                serviceType: artisan.profile.skills?.[0] || 'General Service',
                date: date,
                time: selectedTimeSlot,
                description: 'Service request from mobile app',
                location: location
            });

            navigation.navigate('BookingConfirmation', {
                bookingDetails: {
                    artisan: artisan,
                    date: date.toISOString(),
                    time: selectedTimeSlot
                }
            });
        } catch (error: any) {
            console.error(error);
            Alert.alert('Booking Failed', error.message || 'Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Select Date & Time</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.calenderContainer, { backgroundColor: theme.surface }]}>
                    <View style={styles.monthHeader}>
                        <TouchableOpacity>
                            <Ionicons name="chevron-back" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[styles.monthText, { color: theme.text }]}>
                            {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity>
                            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Date Picker Integration */}
                    <View style={styles.nativePickerContainer}>
                        {Platform.OS === 'ios' ? (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode="date"
                                display="spinner"
                                onChange={onChange}
                                themeVariant={isDarkMode ? "dark" : "light"}
                                textColor={theme.text}
                                style={{ height: 120 }}
                            />
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.androidDateButton, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                                    onPress={() => setShow(true)}
                                >
                                    <Text style={[styles.androidDateText, { color: theme.text }]}>Select Date</Text>
                                    <Ionicons name="calendar" size={24} color={theme.primary} />
                                </TouchableOpacity>

                                {show && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        mode="date"
                                        display="default"
                                        onChange={onChange}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Available Slots</Text>
                    <View style={styles.slotsContainer}>
                        {timeSlots.map((slot, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.timeSlot,
                                    { backgroundColor: theme.inputBackground, borderColor: theme.border },
                                    selectedTimeSlot === slot && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                                onPress={() => setSelectedTimeSlot(slot)}
                            >
                                <Text style={[
                                    styles.timeSlotText,
                                    { color: theme.textSecondary },
                                    selectedTimeSlot === slot && { color: theme.background, fontWeight: 'bold' } // Contrast text on primary
                                ]}>
                                    {slot}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.infoSummary}>
                    <Text style={[styles.summaryText, { color: theme.textSecondary }]}>All times are in WAT</Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.primary }]} onPress={handleBooking} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={theme.background} />
                    ) : (
                        <Text style={[styles.confirmButtonText, { color: theme.background }]}>Confirm & Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
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
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    calenderContainer: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 25,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    nativePickerContainer: {
        alignItems: 'center',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    slotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    timeSlot: {
        width: '30%',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
    },
    timeSlotText: {
        fontSize: 12,
        fontWeight: '600',
    },
    infoSummary: {
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryText: {
        fontSize: 12,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    confirmButton: {
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    androidDateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        borderWidth: 1,
    },
    androidDateText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
