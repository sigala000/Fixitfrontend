import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const LocationService = {
    requestPermissions: async (): Promise<boolean> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Permission to access location was denied. Distance calculations will not be accurate.'
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return false;
        }
    },

    getCurrentLocation: async (): Promise<{ latitude: number; longitude: number } | null> => {
        try {
            const hasPermission = await LocationService.requestPermissions();
            if (!hasPermission) return null;

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error('Error getting current location:', error);
            return null;
        }
    }
};
