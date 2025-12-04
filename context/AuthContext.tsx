import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { initDatabase } from '@/services/database';
import userService, { User as DBUser } from '@/services/userService';

export interface User {
    id: number;
    name: string;
    email: string;
    college: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (userData: Omit<User, 'id'>, password: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (userData: Partial<Omit<User, 'id'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize database on mount
    useEffect(() => {
        try {
            initDatabase();
            console.log('Database initialized');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = async (userData: Omit<User, 'id'>, password: string): Promise<boolean> => {
        try {
            // Check if email already exists
            if (userService.emailExists(userData.email)) {
                console.log('❌ Signup failed: Email already exists');
                return false;
            }

            // Create new user
            const newUser = userService.createUser(
                userData.email,
                password,
                userData.name,
                userData.college
            );

            if (newUser) {
                console.log('✅ User created in SQLite:', newUser);
                setUser({
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    college: newUser.college,
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Signup failed:', error);
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const dbUser = userService.authenticateUser(email, password);

            if (dbUser) {
                console.log('✅ User logged in from SQLite:', dbUser);
                setUser({
                    id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    college: dbUser.college,
                });
                return true;
            }
            console.log('❌ Login failed: Invalid credentials');
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    const updateProfile = (userData: Partial<Omit<User, 'id'>>) => {
        if (!user) return;

        try {
            const updatedUser = {
                name: userData.name || user.name,
                email: userData.email || user.email,
                college: userData.college || user.college,
            };

            const success = userService.updateUser(
                user.id,
                updatedUser.name,
                updatedUser.email,
                updatedUser.college
            );

            if (success) {
                setUser({
                    ...user,
                    ...updatedUser,
                });
            }
        } catch (error) {
            console.error('Profile update failed:', error);
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
