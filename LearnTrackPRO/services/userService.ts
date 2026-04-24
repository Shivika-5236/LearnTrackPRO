import api from './database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  streak: number;
  longestStreak: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const userService = {
  // Create new user (signup)
  createUser: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/signup', { email, password, name });
      await AsyncStorage.setItem('authToken', data.token);
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error creating user. Please try again.';
      console.error('Error creating user:', message);
      throw new Error(message);
    }
  },

  // Authenticate user (login)
  authenticateUser: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
      await AsyncStorage.setItem('authToken', data.token);
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Error authenticating user. Please check your credentials.';
      console.error('Error authenticating user:', message);
      throw new Error(message);
    }
  },



  // Get current user profile
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data } = await api.get<User>('/api/auth/me');
      return data;
    } catch (error: any) {
      console.error('Error getting current user:', error.response?.data?.message || error.message);
      return null;
    }
  },

  // Update user profile
  updateUser: async (name: string, email: string): Promise<boolean> => {
    try {
      await api.put('/api/auth/me', { name, email });
      return true;
    } catch (error: any) {
      console.error('Error updating user:', error.response?.data?.message || error.message);
      return false;
    }
  },

  // Save expo push token
  updatePushToken: async (expoPushToken: string): Promise<boolean> => {
    try {
      await api.put('/api/auth/token', { expoPushToken });
      return true;
    } catch (error: any) {
      console.error('Error updating push token:', error.response?.data?.message || error.message);
      return false;
    }
  },

  // Save timezone
  updateTimezone: async (timezone: string): Promise<boolean> => {
    try {
      await api.put('/api/auth/timezone', { timezone });
      return true;
    } catch (error: any) {
      console.error('Error updating timezone:', error.response?.data?.message || error.message);
      return false;
    }
  },

  // Logout - clear token
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('authToken');
  },
};

export default userService;
