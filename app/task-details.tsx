import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, TaskPriority, TaskStatus } from '@/context/TaskContext';
import { useTheme } from '@/context/ThemeContext';

export default function TaskDetailsScreen() {
    const { taskId } = useLocalSearchParams();
    const router = useRouter();
    const { tasks, deleteTask, updateTask, updateTaskStatus } = useTasks();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
    const textColor = isDark ? '#ECEDEE' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const inputBackground = isDark ? '#1E293B' : '#F1F5F9';
    const borderColor = isDark ? '#334155' : '#F1F5F9';

    const task = tasks.find((t) => t.id === taskId);

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDetails, setEditDetails] = useState('');
    const [editDeadline, setEditDeadline] = useState('');
    const [editPriority, setEditPriority] = useState<TaskPriority>('Medium');

    if (!task) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Task not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const startEditing = () => {
        setEditTitle(task.title);
        setEditDetails(task.details || '');
        setEditDeadline(task.deadline || '');
        setEditPriority(task.priority);
        setIsEditing(true);
    };

    const saveChanges = () => {
        updateTask(task.id, {
            title: editTitle,
            details: editDetails,
            deadline: editDeadline,
            priority: editPriority,
        });
        setIsEditing(false);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteTask(task.id);
                        router.back();
                    },
                },
            ]
        );
    };

    const handleStatusChange = () => {
        const nextStatus: TaskStatus = task.status === 'Not started' ? 'Doing' : task.status === 'Doing' ? 'Completed' : 'Not started';
        updateTaskStatus(task.id, nextStatus);
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'High': return '#EF4444';
            case 'Medium': return '#F97316';
            case 'Low': return '#10B981';
            default: return '#64748B';
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'Completed': return '#10B981';
            case 'Doing': return '#3B82F6';
            case 'Not started': return '#64748B';
            default: return '#64748B';
        }
    };

    if (isEditing) {
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Edit Task</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: subtextColor }]}>Title</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBackground, color: textColor, borderColor }]}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            placeholderTextColor={subtextColor}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: subtextColor }]}>Details</Text>
                        <TextInput
                            style={[styles.input, { minHeight: 80, textAlignVertical: 'top', backgroundColor: inputBackground, color: textColor, borderColor }]}
                            multiline
                            value={editDetails}
                            onChangeText={setEditDetails}
                            placeholderTextColor={subtextColor}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: subtextColor }]}>Deadline</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBackground, color: textColor, borderColor }]}
                            value={editDeadline}
                            onChangeText={setEditDeadline}
                            placeholderTextColor={subtextColor}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: subtextColor }]}>Priority</Text>
                        <View style={styles.priorityRow}>
                            {(['Low', 'Medium', 'High'] as TaskPriority[]).map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.priorityOption, { backgroundColor: inputBackground, borderColor }, editPriority === p && { backgroundColor: isDark ? '#5B6BFA' : '#0F172A', borderColor: isDark ? '#5B6BFA' : '#0F172A' }]}
                                    onPress={() => setEditPriority(p)}
                                >
                                    <Text style={[styles.priorityOptionText, { color: subtextColor }, editPriority === p && { color: '#FFFFFF' }]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
                <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                        <Text style={[styles.cancelButtonText, { color: subtextColor }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: isDark ? '#5B6BFA' : '#5B6BFA' }]} onPress={saveChanges}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(task.priority) + '20' }
                    ]}>
                        <Text style={[
                            styles.priorityText,
                            { color: getPriorityColor(task.priority) }
                        ]}>{task.priority} Priority</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(task.status) + '20' }
                        ]}
                        onPress={handleStatusChange}
                    >
                        <Text style={[
                            styles.statusText,
                            { color: getStatusColor(task.status) }
                        ]}>{task.status}</Text>
                        <Ionicons name="refresh" size={14} color={getStatusColor(task.status)} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.title, { color: textColor }]}>{task.title}</Text>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="calendar-outline" size={20} color={subtextColor} />
                        <Text style={[styles.sectionTitle, { color: subtextColor }]}>Deadline</Text>
                    </View>
                    <Text style={[styles.sectionContent, { color: textColor }]}>{task.deadline || 'No deadline'}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text-outline" size={20} color={subtextColor} />
                        <Text style={[styles.sectionTitle, { color: subtextColor }]}>Details</Text>
                    </View>
                    <Text style={[styles.sectionContent, { color: textColor }]}>{task.details || 'No details provided.'}</Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF' }]} onPress={startEditing}>
                    <Ionicons name="pencil" size={20} color="#3B82F6" />
                    <Text style={styles.editButtonText}>Edit Task</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? '#3F1515' : '#FEF2F2' }]} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>Delete Task</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 24,
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 32,
    },
    section: {
        gap: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    sectionContent: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 24,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        flexDirection: 'row',
        gap: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3B82F6',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
    },
    errorText: {
        fontSize: 18,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 40,
    },
    backButton: {
        alignSelf: 'center',
        marginTop: 20,
        padding: 12,
    },
    backButtonText: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#0F172A',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    priorityActive: {
        backgroundColor: '#0F172A',
    },
    priorityOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    priorityTextActive: {
        color: '#FFFFFF',
    },
    cancelButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    saveButton: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#5B6BFA',
        borderRadius: 16,
        paddingVertical: 16,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
