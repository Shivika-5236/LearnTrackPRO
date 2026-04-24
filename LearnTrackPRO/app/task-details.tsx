import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, TaskPriority, TaskStatus } from '@/context/TaskContext';
import { useCourses } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';
import { Stack as RouterStack } from 'expo-router';

export default function TaskDetailsScreen() {
    const { taskId } = useLocalSearchParams();
    const router = useRouter();
    const { tasks, deleteTask, updateTask, updateTaskStatus } = useTasks();
    const { courses } = useCourses();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0D1117' : '#FFFFFF';
    const textColor = isDark ? '#E4E9F4' : '#0F172A';
    const subtextColor = isDark ? '#6A80A4' : '#64748B';
    const inputBackground = isDark ? '#1E2B3C' : '#F1F5F9';
    const borderColor = isDark ? '#273548' : '#F1F5F9';
    const cardBackground = isDark ? '#161D2A' : '#FFFFFF';

    const task = tasks.find((t) => t.id === taskId);

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDetails, setEditDetails] = useState('');
    const [editDeadline, setEditDeadline] = useState('');
    const [editPriority, setEditPriority] = useState<TaskPriority>('Medium');
    const [editCourseId, setEditCourseId] = useState<string | null>(null);
    const [showCoursePicker, setShowCoursePicker] = useState(false);

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

    const linkedCourse = courses.find(c => c.id === task.courseId);
    const selectedCourseName = courses.find(c => c.id === editCourseId)?.title || null;

    const startEditing = () => {
        setEditTitle(task.title);
        setEditDetails(task.details || '');
        setEditDeadline(task.deadline || '');
        setEditPriority(task.priority);
        setEditCourseId(task.courseId || null);
        setIsEditing(true);
    };

    const saveChanges = () => {
        updateTask(task.id, {
            title: editTitle,
            details: editDetails,
            deadline: editDeadline,
            priority: editPriority,
            courseId: editCourseId || undefined,
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
            case 'High': return '#E8627A';
            case 'Medium': return '#F5A23A';
            case 'Low': return '#F5C842';
            default: return '#6A80A4';
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'Completed': return '#3ECFA8';
            case 'Doing': return '#7C6AF7';
            case 'Not started': return '#6A80A4';
            default: return '#6A80A4';
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
                        <Text style={[styles.label, { color: subtextColor }]}>Link to Course</Text>
                        <TouchableOpacity
                            style={[styles.input, { backgroundColor: inputBackground, borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                            onPress={() => setShowCoursePicker(true)}
                        >
                            <Text style={{ color: selectedCourseName ? textColor : subtextColor }}>
                                {selectedCourseName || 'No course linked'}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={subtextColor} />
                        </TouchableOpacity>
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
                                    style={[styles.priorityOption, { backgroundColor: inputBackground, borderColor }, editPriority === p && { backgroundColor: isDark ? '#7C6AF7' : '#0F172A', borderColor: isDark ? '#7C6AF7' : '#0F172A' }]}
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
                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#7C6AF7' }]} onPress={saveChanges}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>

                {/* Course Picker Modal */}
                <Modal visible={showCoursePicker} transparent animationType="fade" onRequestClose={() => setShowCoursePicker(false)}>
                    <TouchableOpacity style={styles.courseModalOverlay} activeOpacity={1} onPress={() => setShowCoursePicker(false)}>
                        <View style={[styles.courseModalContent, { backgroundColor: cardBackground }]}>
                            <Text style={[styles.courseModalTitle, { color: textColor }]}>Select Course</Text>
                            <TouchableOpacity
                                style={[styles.courseModalItem, { borderBottomColor: borderColor }, !editCourseId && { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}
                                onPress={() => { setEditCourseId(null); setShowCoursePicker(false); }}
                            >
                                <Text style={[styles.courseModalItemText, { color: subtextColor }, !editCourseId && { color: '#7C6AF7', fontWeight: '600' }]}>None</Text>
                                {!editCourseId && <Ionicons name="checkmark" size={18} color="#7C6AF7" />}
                            </TouchableOpacity>
                            <ScrollView style={{ maxHeight: 300 }}>
                                {courses.map(course => {
                                    const isActive = editCourseId === course.id;
                                    return (
                                        <TouchableOpacity
                                            key={course.id}
                                            style={[styles.courseModalItem, { borderBottomColor: borderColor }, isActive && { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}
                                            onPress={() => { setEditCourseId(course.id); setShowCoursePicker(false); }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.courseModalItemText, { color: textColor }, isActive && { color: '#7C6AF7', fontWeight: '600' }]} numberOfLines={1}>{course.title}</Text>
                                                <Text style={[styles.courseModalItemSub, { color: subtextColor }]}>{course.tag}</Text>
                                            </View>
                                            {isActive && <Ionicons name="checkmark" size={18} color="#7C6AF7" />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <RouterStack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={[styles.customHeader, { backgroundColor, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
                    <Ionicons name="chevron-back" size={26} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerCenterTitle, { color: textColor }]} numberOfLines={1}>
                    {task.title}
                </Text>
                <View style={styles.headerRightGroup}>
                    <TouchableOpacity onPress={startEditing} style={styles.headerIconBtn}>
                        <Ionicons name="pencil-outline" size={22} color={subtextColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.headerIconBtn}>
                        <Ionicons name="trash-outline" size={22} color="#E8627A" />
                    </TouchableOpacity>
                </View>
            </View>

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

                <View style={styles.titleArea}>
                    {isEditing ? (
                        <View style={styles.editingHeader}>
                            <TextInput
                                style={[styles.titleInput, { color: textColor, borderBottomColor: '#7C6AF7' }]}
                                value={editedTitle}
                                onChangeText={setEditedTitle}
                                placeholder="Task Title"
                                placeholderTextColor={subtextColor}
                                autoFocus
                            />
                            <TouchableOpacity onPress={saveEdits} style={[styles.saveButtonSmall, { backgroundColor: '#10B981' }]}>
                                <Ionicons name="checkmark" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={[styles.mainTitle, { color: textColor }]}>{task.title}</Text>
                    )}
                </View>

                {linkedCourse && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="book-outline" size={20} color={subtextColor} />
                            <Text style={[styles.sectionTitle, { color: subtextColor }]}>Linked Course</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.linkedCourseCard, { backgroundColor: inputBackground }]}
                            onPress={() => router.push({ pathname: '/courses/[courseId]', params: { courseId: linkedCourse.id } })}
                        >
                            <Text style={[styles.linkedCourseName, { color: textColor }]}>{linkedCourse.title}</Text>
                            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
                        </TouchableOpacity>
                    </View>
                )}

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

            {/* Removed Footer */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 10,
        paddingTop: Platform.OS === 'ios' ? 45 : 10,
        borderBottomWidth: 1,
    },
    headerIconBtn: {
        padding: 8,
    },
    headerCenterTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    headerRightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
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
    titleRow: {
        marginBottom: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    titleArea: {
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '800',
    },
    editingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    titleInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '800',
        paddingVertical: 4,
        borderBottomWidth: 2,
    },
    saveButtonSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        lineHeight: 34,
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
    linkedCourseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'space-between',
        marginTop: 4,
    },
    linkedCourseName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    courseModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        padding: 20,
    },
    courseModalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 20,
        gap: 16,
    },
    courseModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    courseModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    courseModalItemActive: {
    },
    courseModalItemText: {
        fontSize: 16,
    },
    courseModalItemSub: {
        fontSize: 13,
        marginTop: 2,
    },
});
