import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: (value?: boolean) => void;
    // Theme colors
    colors: any;
    textColor: string;
    subtextColor: string;
    backgroundColor: string;
    cardBackground: string;
    borderColor: string;
    inputBackground: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemScheme = useSystemColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        // Load saved theme preference
        AsyncStorage.getItem('themeMode').then((saved) => {
            if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
                setThemeModeState(saved as ThemeMode);
            }
        });
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await AsyncStorage.setItem('themeMode', mode);
    };

    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

    const toggleTheme = (value?: boolean) => {
        const newMode = (value !== undefined ? value : !isDark) ? 'dark' : 'light';
        setThemeMode(newMode);
    };

    const themeColors = isDark ? Colors.dark : Colors.light;

    const value = {
        themeMode,
        isDark,
        setThemeMode,
        toggleTheme,
        colors: themeColors,
        textColor: themeColors.text,
        subtextColor: themeColors.subtext,
        backgroundColor: themeColors.background,
        cardBackground: themeColors.card,
        borderColor: themeColors.border,
        inputBackground: themeColors.input,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
