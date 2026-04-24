import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function UpcomingBlocksScreen() {
    const router = useRouter();
    const { upcomingBlocks } = useStudy();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
    const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
    const textColor = isDark ? '#ECEDEE' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? '#334155' : '#E2E8F0';

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Upcoming Focus Blocks</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.grid}>
                    {upcomingBlocks.map(block => (
                        <TouchableOpacity
                            key={block.id}
                            style={[styles.focusBlock, { backgroundColor: block.color + '10', borderColor: block.color + '30' }]}
                            onPress={() => router.push({ pathname: '/study/session', params: { blockId: block.id } } as any)}
                        >
                            <View style={styles.blockHeader}>
                                <View style={[styles.blockIcon, { backgroundColor: block.color }]}>
                                    <Ionicons name="time" size={16} color="#FFFFFF" />
                                </View>
                            </View>
                            <Text style={[styles.blockTitle, { color: textColor }]} numberOfLines={1}>{block.title}</Text>
                            <Text style={[styles.blockTime, { color: subtextColor }]}>{block.day} · {block.time}</Text>
                            <Text style={[styles.blockDuration, { color: textColor }]}>{block.duration} min</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    container: {
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    focusBlock: {
        width: (width - 44) / 2,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 8,
    },
    blockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    blockIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blockTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
        marginTop: 4,
    },
    blockTime: {
        fontSize: 13,
        color: '#64748B',
    },
    blockDuration: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0F172A',
        marginTop: 4,
    },
});
