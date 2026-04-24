import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from './sidebar-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

const MENU_ITEMS = [
    { name: 'Analytics', icon: 'bar-chart-outline', route: '/(tabs)/analytics' },
    { name: 'Settings', icon: 'settings-outline', route: '/(tabs)/settings' },
];

export default function Sidebar() {
    const { isOpen, closeSidebar } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#161D2A' : '#FFFFFF';
    const textColor = isDark ? '#E4E9F4' : '#0F172A';
    const subtextColor = isDark ? '#6A80A4' : '#64748B';
    const borderColor = isDark ? '#273548' : '#F1F5F9';
    const activeBackground = isDark ? '#1E2B3C' : '#EFF6FF';
    const accentColor = '#7C6AF7';


    if (!isOpen) return null;

    const handleNavigation = (route: string) => {
        // @ts-ignore
        router.push(route);
        closeSidebar();
    };

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={styles.backdrop} onPress={closeSidebar} activeOpacity={1} />
            <View style={[styles.sidebar, { backgroundColor }]}>
                <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
                    <View style={[styles.header, { borderBottomColor: borderColor }]}>
                        <Text style={[styles.title, { color: textColor }]}>LearnTrack Pro</Text>
                        <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.menu}>
                        {MENU_ITEMS.map((item) => {
                            const isActive = pathname === item.route || (item.route !== '/(tabs)' && pathname.startsWith(item.route));
                            return (
                                <TouchableOpacity
                                    key={item.name}
                                    style={[styles.menuItem, isActive && { backgroundColor: activeBackground }]}
                                    onPress={() => handleNavigation(item.route)}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={22}
                                        color={isActive ? accentColor : subtextColor}
                                    />
                                    <Text style={[styles.menuText, { color: isActive ? accentColor : subtextColor }]}>
                                        {item.name}
                                    </Text>

                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        zIndex: 1000,
        flexDirection: 'row',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sidebar: {
        width: width * 0.8,
        maxWidth: 300,
        height: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    menu: {
        padding: 16,
        gap: 8,
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
