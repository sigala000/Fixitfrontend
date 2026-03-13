import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Location from 'expo-location';
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
            // Get user's current location
            let location: {
                address: string;
                coordinates: number[];
                fullAddress?: string;
            };
            try {
                // Request location permission and get current location
                const locationPermission = await Location.requestForegroundPermissionsAsync();
                if (locationPermission.status === 'granted') {
                    const currentLocation = await Location.getCurrentPositionAsync({});
                    const { latitude, longitude } = currentLocation.coords;
                    
                    // Use OpenStreetMap Nominatim reverse geocoding
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                            headers: {
                                'User-Agent': 'FixitApp/1.0' // Required by OSM policy
                            }
                        });
                        
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        
                        const contentType = response.headers.get('content-type');
                        if (!contentType || !contentType.includes('application/json')) {
                            throw new Error('Response is not JSON');
                        }
                        
                        const data = await response.json();
                        
                        if (data && data.address) {
                            // Extract meaningful location information
                            const suburb = data.address.suburb || data.address.neighbourhood;
                            const city = data.address.city || data.address.town || data.address.village;
                            const municipality = data.address.municipality;
                            
                            // Create readable location string
                            let address = '';
                            if (suburb) address = suburb;
                            else if (municipality) address = municipality;
                            else if (city) address = city;
                            else address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                            
                            location = {
                                address: address,
                                coordinates: [latitude, longitude],
                                fullAddress: data.display_name || address
                            };
                        } else {
                            // Fallback to coordinates if geocoding fails
                            location = {
                                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                                coordinates: [latitude, longitude]
                            };
                        }
                    } catch (geocodingError) {
                        console.error('Geocoding failed:', geocodingError);
                        // Fallback to coordinates
                        location = {
                            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                            coordinates: [latitude, longitude]
                        };
                    }
                } else {
                    // Fallback to mock location if permission denied
                    location = {
                        address: 'Location permission denied',
                        coordinates: [0, 0]
                    };
                }
            } catch (error) {
                console.error('Error getting location:', error);
                // Fallback location
                location = {
                    address: 'Unable to get location',
                    coordinates: [0, 0]
                };
            }

            const bookingResponse = await BookingService.createBooking({
                artisanId: artisan._id,
                serviceType: artisan.profile.skills?.[0] || 'General Service',
                date: date,
                time: selectedTimeSlot,
                description: 'Service request from mobile app',
                location: location
            });

            navigation.navigate('BookingConfirmation', {
                bookingDetails: {
                    bookingId: bookingResponse._id || bookingResponse.id,
                    artisan: artisan,
                    date: date.toISOString(),
                    time: selectedTimeSlot,
                    serviceType: artisan.profile.skills?.[0] || 'General Service',
                    location: location,
                    description: 'Service request from mobile app'
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
                                    <Text style={[styles.androidDateText, { color: theme.text }]}>
                                        {date.toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </Text>
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

                {(selectedTimeSlot) && (
                    <View style={[styles.selectedSummaryContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.selectedSummaryTitle, { color: theme.text }]}>Selected Appointment</Text>
                        <View style={styles.selectedSummaryRow}>
                            <View style={styles.selectedSummaryItem}>
                                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                                <Text style={[styles.selectedSummaryText, { color: theme.text }]}>
                                    {date.toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        month: 'long', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}
                                </Text>
                            </View>
                            <View style={styles.selectedSummaryItem}>
                                <Ionicons name="time-outline" size={20} color={theme.primary} />
                                <Text style={[styles.selectedSummaryText, { color: theme.text }]}>{selectedTimeSlot}</Text>
                            </View>
                        </View>
                    </View>
                )}
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
    selectedSummaryContainer: {
        borderRadius: 12,
        padding: 15,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
    },
    selectedSummaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    selectedSummaryRow: {
        gap: 10,
    },
    selectedSummaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectedSummaryText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
