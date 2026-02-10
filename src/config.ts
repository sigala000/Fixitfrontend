import { Platform } from 'react-native';

// CHANGE THIS to your computer's local IP address if testing on a physical device
// e.g., 'http://192.168.1.5:8000/api'
// For Android Emulator, use 'http://10.0.2.2:8000/api'
// For iOS Simulator, 'http://localhost:8000/api' works

const BASE_URL = 'http://192.168.43.5:8000';

export const API_URL = `${BASE_URL}/api`;
export const SERVER_URL = BASE_URL; // Exporting as SERVER_URL for clarity
