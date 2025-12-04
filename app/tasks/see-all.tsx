import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, TaskPriority, TaskStatus } from '@/context/TaskContext';
import { useTheme } from '@/context/ThemeContext';

export default function SeeAllTasksScreen() {
    const { status } = useLocalSearchParams<{ status: TaskStatus }>();
    const router = useRouter();
    const { tasks, deleteTask } = useTasks();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
    const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
    const textColor = isDark ? '#ECEDEE' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? '#334155' : '#E2E8F0';


    const [sortBy, setSortBy] = useState<'priority' | 'deadline'>('priority');
    const [filterPriority, setFilterPriority] = useState<TaskPriority | 'All'>('All');

    const filteredTasks = useMemo(() => {
        let result = tasks.filter(t => t.status === status);

        if (filterPriority !== 'All') {
            result = result.filter(t => t.priority === filterPriority);
        }

        result.sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            // Simple string comparison for deadline for now
            return (a.deadline || '').localeCompare(b.deadline || '');
        });

        return result;
    }, [tasks, status, filterPriority, sortBy]);

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'High': return '#EF4444';
            case 'Medium': return '#F59E0B';
            case 'Low': return '#10B981';
            default: return '#64748B';
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>{status} Tasks</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={[styles.controls, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity
                        style={[styles.filterChip, { backgroundColor: isDark ? '#334155' : '#F1F5F9', borderColor }, sortBy === 'priority' && { backgroundColor: isDark ? '#5B6BFA' : '#0F172A', borderColor: isDark ? '#5B6BFA' : '#0F172A' }]}
                        onPress={() => setSortBy('priority')}
                    >
                        <Text style={[styles.filterText, { color: subtextColor }, sortBy === 'priority' && styles.filterTextActive]}>Sort: Priority</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, { backgroundColor: isDark ? '#334155' : '#F1F5F9', borderColor }, sortBy === 'deadline' && { backgroundColor: isDark ? '#5B6BFA' : '#0F172A', borderColor: isDark ? '#5B6BFA' : '#0F172A' }]}
                        onPress={() => setSortBy('deadline')}
                    >
                        <Text style={[styles.filterText, { color: subtextColor }, sortBy === 'deadline' && styles.filterTextActive]}>Sort: Deadline</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {(['All', 'High', 'Medium', 'Low'] as const).map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.filterChip, { backgroundColor: isDark ? '#334155' : '#F1F5F9', borderColor }, filterPriority === p && { backgroundColor: isDark ? '#5B6BFA' : '#0F172A', borderColor: isDark ? '#5B6BFA' : '#0F172A' }]}
                            onPress={() => setFilterPriority(p)}
                        >
                            <Text style={[styles.filterText, { color: subtextColor }, filterPriority === p && styles.filterTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {filteredTasks.map(task => (
                    <View key={task.id} style={[styles.taskCard, { backgroundColor: cardBackground }]}>
                        <TouchableOpacity
                            style={styles.taskCardContent}
                            onPress={() => router.push({ pathname: '/task-details', params: { taskId: task.id } })}
                        >
                            <View style={styles.taskHeader}>
                                <Text style={[styles.taskTitle, { color: textColor }]}>{task.title}</Text>
                                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                                    <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>{task.priority}</Text>
                                </View>
                            </View>
                            {task.details ? <Text style={[styles.taskDetails, { color: subtextColor }]} numberOfLines={2}>{task.details}</Text> : null}
                            <View style={styles.taskFooter}>
                                <Ionicons name="calendar-outline" size={14} color={subtextColor} />
                                <Text style={[styles.taskDeadline, { color: subtextColor }]}>{task.deadline || 'No deadline'}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => {
                                Alert.alert(
                                    'Delete Task',
                                    'Are you sure you want to delete this task?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: () => deleteTask(task.id),
                                        },
                                    ]
                                );
                            }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                ))}
                {filteredTasks.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: subtextColor }]}>No tasks found</Text>
                    </View>
                )}
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
    controls: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    filterScroll: {
        paddingHorizontal: 16,
        gap: 8,
        alignItems: 'center',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterChipActive: {
        backgroundColor: '#0F172A',
        borderColor: '#0F172A',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 4,
    },
    container: {
        padding: 16,
        gap: 12,
    },
    taskCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskCardContent: {
        flex: 1,
        gap: 10,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    taskTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    taskDetails: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    taskFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    taskDeadline: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 16,
    },
});
