import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';

export default function HistoryScreen() {
    const router = useRouter();
    const { recentSessions, deleteSession } = useStudy();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
    const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
    const textColor = isDark ? '#ECEDEE' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? '#334155' : '#E2E8F0';

    const handleDelete = (id: string) => {
        deleteSession(id);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Study History</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.list}>
                    {recentSessions.map(session => (
                        <TouchableOpacity key={session.id} style={[styles.sessionCard, { backgroundColor: cardBackground }]}>
                            <View style={[styles.sessionIcon, { backgroundColor: session.color }]}>
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            </View>
                            <View style={styles.sessionInfo}>
                                <Text style={[styles.sessionCourse, { color: textColor }]} numberOfLines={1}>{session.course}</Text>
                                <Text style={[styles.sessionFocus, { color: subtextColor }]} numberOfLines={1}>{session.focus}</Text>
                            </View>
                            <View style={styles.sessionMeta}>
                                <Text style={[styles.sessionDuration, { color: textColor }]}>{session.duration}</Text>
                                <Text style={[styles.sessionTime, { color: subtextColor }]}>{session.loggedAt}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(session.id)} style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                    {recentSessions.length === 0 && (
                        <Text style={[styles.emptyText, { color: subtextColor }]}>No sessions found</Text>
                    )}
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
    searchContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
    },
    container: {
        padding: 16,
    },
    list: {
        gap: 12,
    },
    sessionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    sessionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionInfo: {
        flex: 1,
        gap: 4,
    },
    sessionCourse: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
    },
    sessionFocus: {
        fontSize: 13,
        color: '#64748B',
    },
    sessionMeta: {
        alignItems: 'flex-end',
        gap: 4,
    },
    sessionDuration: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    sessionTime: {
        fontSize: 12,
        color: '#94A3B8',
    },
    deleteButton: {
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94A3B8',
        marginTop: 40,
        fontSize: 16,
    },
});
