import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import userService from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '@/services/notifications';

export interface User {
    id: string;
    name: string;
    email: string;
    streak: number;
    longestStreak: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
    signup: (userData: { name: string; email: string }, password: string) => Promise<{success: boolean, error?: string}>;

    logout: () => void;
    updateProfile: (userData: Partial<{ name: string; email: string }>) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for saved token and restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (token) {
                    const currentUser = await userService.getCurrentUser();
                    if (currentUser) {
                        setUser(currentUser);
                    } else {
                        // Token invalid — clear it
                        await AsyncStorage.removeItem('authToken');
                    }
                }
            } catch (error) {
                console.error('Failed to restore session:', error);
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    // Register push notification token when a user is authenticated
    useEffect(() => {
        if (user) {
            registerForPushNotificationsAsync().then((token) => {
                if (token) userService.updatePushToken(token);
            });
            // Sync user timezone
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                userService.updateTimezone(tz);
            } catch (error) {
                console.error('Failed to update timezone:', error);
            }
        }
    }, [user?.id]);

    const signup = async (userData: { name: string; email: string }, password: string): Promise<{success: boolean, error?: string}> => {
        try {
            const response = await userService.createUser(
                userData.email,
                password,
                userData.name
            );
            if (response) {
                console.log(' User signed up:', response.user);
                setUser(response.user);
                return { success: true };
            }
            return { success: false, error: 'Signup failed. Please try again.' };
        } catch (error: any) {
            console.error('Signup failed:', error);
            return { success: false, error: error.message || 'An error occurred during signup.' };
        }
    };

    const login = async (email: string, password: string): Promise<{success: boolean, error?: string}> => {
        try {
            const response = await userService.authenticateUser(email, password);
            if (response) {
                console.log(' User logged in:', response.user);
                setUser(response.user);
                return { success: true };
            }
            console.log(' Login failed: Invalid credentials');
            return { success: false, error: 'Invalid credentials' };
        } catch (error: any) {
            console.error('Login failed:', error);
            return { success: false, error: error.message || 'An error occurred during login.' };
        }
    };



    const logout = async () => {
        await userService.logout();
        setUser(null);
    };

    const updateProfile = async (userData: Partial<{ name: string; email: string }>) => {
        if (!user) return;
        try {
            const success = await userService.updateUser(
                userData.name || user.name,
                userData.email || user.email
            );
            if (success) {
                setUser({ ...user, ...userData, streak: user.streak });
            }
        } catch (error) {
            console.error('Profile update failed:', error);
        }
    };

    const refreshUser = async () => {
        try {
            const currentUser = await userService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,

                logout,
                updateProfile,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
