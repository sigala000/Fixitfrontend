import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ArtisanService } from '../services/artisan';
import { Artisan } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const CATEGORIES = [
    { id: '1', name: 'Plumber', icon: 'wrench-outline' },
    { id: '2', name: 'Electrician', icon: 'flash-outline' },
    { id: '3', name: 'Carpenter', icon: 'hammer-outline' },
    { id: '4', name: 'Painter', icon: 'color-palette-outline' },
    { id: '5', name: 'Mechanic', icon: 'car-outline' },
];

export const HomeScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [artisans, setArtisans] = useState<Artisan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState('');

    const loadUserName = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const name = user?.profile?.name || user?.name || 'Client';
                setUserName(name);
            }
        } catch (error) {
            console.error('Failed to load user name', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadUserName();
        }, [])
    );

    useEffect(() => {
        loadArtisans();
    }, [selectedCategory]);

    const loadArtisans = async () => {
        setLoading(true);
        try {
            const data = await ArtisanService.getAllArtisans(selectedCategory || undefined);
            setArtisans(data);
        } catch (error) {
            console.error('Failed to load artisans', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCategory = ({ item }: any) => (
        <TouchableOpacity
            style={[
                styles.categoryCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedCategory === item.name && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
            onPress={() => setSelectedCategory(item.name === selectedCategory ? null : item.name)}
        >
            <View style={[
                styles.iconContainer,
                { backgroundColor: theme.inputBackground },
                selectedCategory === item.name && { backgroundColor: theme.background }
            ]}>
                <Ionicons
                    name={item.icon}
                    size={24}
                    color={selectedCategory === item.name ? theme.text : theme.primary}
                />
            </View>
            <Text style={[
                styles.categoryName,
                { color: theme.textSecondary },
                selectedCategory === item.name && { color: theme.text, fontWeight: 'bold' }
            ]}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderNearbyArtisan = ({ item }: { item: Artisan }) => (
        <TouchableOpacity
            style={[styles.nearbyCard, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate('ArtisanProfile', { artisan: item })}
        >
            <Image source={{ uri: item.profile.avatar || 'https://via.placeholder.com/150' }} style={styles.nearbyImage} />
            <View style={styles.nearbyOverlay}>
                <Text style={[styles.nearbyName, { color: '#FFFFFF' }]}>{item.profile.name}</Text>
                <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyRating}><Ionicons name="star" size={12} color="#FFD700" /> {item.profile.rating || 0}</Text>
                    <Text style={[styles.nearbyDistance, { color: '#FFFFFF' }]}>| 2.5 km away</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFeaturedArtisan = ({ item }: { item: Artisan }) => (
        <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate('ArtisanProfile', { artisan: item })}
        >
            <Image source={{ uri: item.profile.avatar || 'https://via.placeholder.com/150' }} style={styles.featuredAvatar} />
            <View style={styles.featuredInfo}>
                <Text style={[styles.featuredName, { color: theme.text }]}>{item.profile.name}</Text>
                <Text style={[styles.featuredSkill, { color: theme.textSecondary }]}>{item.profile.skills?.[0] || 'Artisan'}</Text>
                <Text style={[styles.featuredDistance, { color: theme.textSecondary }]}><Ionicons name="location-outline" size={12} color={theme.primary} /> 2.5 km away</Text>
            </View>
            <View style={styles.featuredAction}>
                <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    // Filter artisans based on search query
    const filteredArtisans = artisans.filter(artisan => {
        const query = searchQuery.toLowerCase();
        const nameMatches = artisan.profile.name.toLowerCase().includes(query);
        const skillMatches = artisan.profile.skills?.some(skill => skill.toLowerCase().includes(query));
        return nameMatches || skillMatches;
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerGreeting, { color: theme.text }]}>Hello, {userName}</Text>
                </View>
                <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={theme.text} />
                    <View style={[styles.notificationBadge, { backgroundColor: theme.primary }]} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
                <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search for a service..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sectionHeader}>
                    <FlatList
                        data={CATEGORIES}
                        renderItem={renderCategory}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Artisans</Text>
                        <TouchableOpacity>
                            <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {filteredArtisans.length === 0 ? (
                        <View style={[styles.emptyStateContainer, { backgroundColor: theme.surface }]}>
                            <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
                            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>No artisans found matching "{searchQuery}".</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredArtisans}
                            renderItem={renderNearbyArtisan}
                            keyExtractor={(item: any) => item._id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.nearbyList}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Artisans</Text>
                        <TouchableOpacity>
                            <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {filteredArtisans.map((item: any) => (
                        <View key={item._id} style={{ marginBottom: 10 }}>
                            {renderFeaturedArtisan({ item })}
                        </View>
                    ))}
                </View>
                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerGreeting: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    notificationButton: {
        padding: 5,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 20,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    sectionHeader: {
        marginBottom: 20,
    },
    categoriesList: {
        paddingRight: 20,
    },
    categoryCard: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAllText: {
        fontSize: 14,
    },
    nearbyList: {
        paddingRight: 20,
    },
    nearbyCard: {
        width: 140,
        height: 180,
        marginRight: 15,
        borderRadius: 15,
        overflow: 'hidden',
    },
    nearbyImage: {
        width: '100%',
        height: '100%',
    },
    nearbyOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
    },
    nearbyName: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
    nearbyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nearbyRating: {
        color: '#FFD700',
        fontSize: 10,
        marginRight: 5,
    },
    nearbyDistance: {
        fontSize: 10,
    },
    featuredCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
    },
    featuredAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    featuredInfo: {
        flex: 1,
    },
    featuredName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    featuredSkill: {
        fontSize: 14,
        marginBottom: 5,
    },
    featuredDistance: {
        fontSize: 12,
    },
    featuredAction: {
        justifyContent: 'center',
    },
    emptyStateContainer: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        marginVertical: 10,
    },
    emptyStateText: {
        marginTop: 10,
        fontSize: 14,
    },
});
