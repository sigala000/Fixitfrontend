import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export const ArtisanJobRequestScreen = ({ route, navigation }: any) => {
    const job = route.params?.job || {
        service: 'Plumbing - Leaky Faucet Repair',
        client: 'Esther Howard',
        rating: 4.8,
        location: '123 Fictional St. Douala, Cameroon',
        date: 'Mon, 28 Oct. 10:00 AM',
        description: 'The faucet in the main bathroom is dripping continuously. It seems to be a slow but steady leak from the base of the spout.',
        specialInstructions: 'Please call 30 minutes before arriving. We have a small dog, but he is friendly.',
        images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Request Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.clientCard}>
                    <Image source={{ uri: job.avatar }} style={styles.avatar} />
                    <View>
                        <Text style={styles.clientName}>{job.client}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>{job.rating}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.detailsCard}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Job Details</Text>
                        <Text style={styles.detailValueBold}>{job.service}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="location-outline" size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.detailLabel}>Location</Text>
                            <Text style={styles.detailValue}>{job.location}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.detailLabel}>Preferred Date & Time</Text>
                            <Text style={styles.detailValue}>{job.date}</Text>
                        </View>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Description</Text>
                        <Text style={styles.detailText}>{job.description}</Text>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Special Instructions</Text>
                        <Text style={styles.detailText}>{job.specialInstructions}</Text>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Attached Media</Text>
                        <View style={styles.mediaRow}>
                            {job.images.map((img: string, index: number) => (
                                <Image key={index} source={{ uri: img }} style={styles.jobImage} />
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.declineButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton}>
                    <Text style={styles.acceptText}>Accept Job</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    clientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    clientName: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    ratingText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
    },
    detailsCard: {
        backgroundColor: colors.surface,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    detailItem: {
        marginBottom: 20,
    },
    detailLabel: {
        color: colors.primary, // Using primary for labels here for contrast
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    detailValueBold: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2C2C2C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    detailValue: {
        color: colors.white,
        fontSize: 15,
    },
    detailSection: {
        marginBottom: 20,
    },
    detailText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 22,
    },
    mediaRow: {
        flexDirection: 'row',
    },
    jobImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
        backgroundColor: '#333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    declineButton: {
        width: '45%',
        paddingVertical: 15,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#FF4444',
        alignItems: 'center',
    },
    declineText: {
        color: '#FF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    acceptButton: {
        width: '45%',
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    acceptText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
