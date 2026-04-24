import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, TaskPriority } from '@/context/TaskContext';
import { useCourses } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';
import CalendarPicker from '@/components/CalendarPicker';

export default function CreateTaskScreen() {
    const router = useRouter();
    const { courseId } = useLocalSearchParams();
    const { addTask } = useTasks();
    const { courses } = useCourses();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0D1117' : '#F8FAFC';
    const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
    const textColor = isDark ? '#E4E9F4' : '#0F172A';
    const subtextColor = isDark ? '#6A80A4' : '#64748B';
    const inputBackground = isDark ? '#1E2B3C' : '#F1F5F9';

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDetails, setNewTaskDetails] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>((courseId as string) || null);
    const [showCoursePicker, setShowCoursePicker] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());

    const selectedCourseName = courses.find(c => c.id === selectedCourseId)?.title || null;

    const handleDateConfirm = (date: Date) => {
        setSelectedDate(date);
    };

    const handleTimeConfirm = () => {
        const hours = selectedTime.getHours();
        const minutes = selectedTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        const month = selectedDate.getMonth() + 1;
        const day = selectedDate.getDate();
        const year = selectedDate.getFullYear();
        const dateStr = `${month}/${day}/${year}`;

        setNewTaskDeadline(`${dateStr} · ${timeStr}`);
        setShowTimePicker(false);
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) {
            return;
        }

        const combinedDate = new Date(selectedDate);
        combinedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

        addTask({
            title: newTaskTitle,
            details: newTaskDetails || undefined,
            priority: newTaskPriority,
            deadline: newTaskDeadline || undefined,
            parsedDeadline: newTaskDeadline ? combinedDate.toISOString() : undefined,
            status: 'Not started',
            courseId: selectedCourseId || undefined,
        });

        router.back();
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <View style={[styles.header, { backgroundColor: cardBackground }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>New Task</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <TextInput
                    placeholder="Task Name *"
                    placeholderTextColor={subtextColor}
                    style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                />
                <TextInput
                    placeholder="Details (optional)"
                    placeholderTextColor={subtextColor}
                    style={[styles.input, styles.textArea, { backgroundColor: inputBackground, color: textColor }]}
                    multiline
                    value={newTaskDetails}
                    onChangeText={setNewTaskDetails}
                />

                {/* Course Picker */}
                <View style={styles.courseContainer}>
                    <Text style={[styles.label, { color: subtextColor }]}>Link to Course (optional):</Text>
                    <TouchableOpacity
                        style={[styles.coursePickerButton, { backgroundColor: inputBackground }]}
                        onPress={() => setShowCoursePicker(true)}
                    >
                        <Ionicons name="book-outline" size={18} color="#7C6AF7" />
                        <Text style={[styles.coursePickerText, { color: selectedCourseName ? textColor : subtextColor }]} numberOfLines={1}>
                            {selectedCourseName || 'Select a course'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={subtextColor} />
                    </TouchableOpacity>
                </View>

                <View style={styles.deadlineContainer}>
                    <Text style={[styles.label, { color: subtextColor }]}>Deadline (optional):</Text>
                    <View style={styles.deadlineRow}>
                        <TouchableOpacity
                            style={[styles.deadlineButton, { backgroundColor: inputBackground }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={18} color="#7C6AF7" />
                            <Text style={[styles.deadlineButtonText, { color: subtextColor }]}>
                                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.deadlineButton, { backgroundColor: inputBackground }]}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Ionicons name="time-outline" size={18} color="#7C6AF7" />
                            <Text style={[styles.deadlineButtonText, { color: subtextColor }]}>
                                {newTaskDeadline ? newTaskDeadline.split(' · ')[1] : 'Select Time'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.priorityContainer}>
                    <Text style={[styles.label, { color: subtextColor }]}>Priority:</Text>
                    <View style={styles.priorityRow}>
                        {(['Low', 'Medium', 'High'] as TaskPriority[]).map(p => (
                            <TouchableOpacity
                                key={p}
                                style={[styles.priorityOption, { backgroundColor: isDark ? '#273548' : '#F1F5F9' }, newTaskPriority === p && { backgroundColor: isDark ? '#7C6AF7' : '#0F172A' }]}
                                onPress={() => setNewTaskPriority(p)}
                            >
                                <Text style={[styles.priorityOptionText, { color: subtextColor }, newTaskPriority === p && { color: '#FFFFFF' }]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: cardBackground }]}>
                <TouchableOpacity style={[styles.cancelButton, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} onPress={() => router.back()}>
                    <Text style={[styles.cancelButtonText, { color: subtextColor }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#7C6AF7' }]} onPress={handleAddTask}>
                    <Text style={styles.saveButtonText}>Save Task</Text>
                </TouchableOpacity>
            </View>

            {/* Course Picker Modal */}
            <Modal visible={showCoursePicker} transparent animationType="fade" onRequestClose={() => setShowCoursePicker(false)}>
                <TouchableOpacity style={styles.courseModalOverlay} activeOpacity={1} onPress={() => setShowCoursePicker(false)}>
                    <View style={[styles.courseModalContent, { backgroundColor: cardBackground }]}>
                        <Text style={[styles.courseModalTitle, { color: textColor }]}>Select Course</Text>
                        <TouchableOpacity
                            style={[styles.courseModalItem, { borderBottomColor: isDark ? '#334155' : '#F1F5F9' }, !selectedCourseId && { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}
                            onPress={() => { setSelectedCourseId(null); setShowCoursePicker(false); }}
                        >
                            <Text style={[styles.courseModalItemText, { color: subtextColor }, !selectedCourseId && { color: '#7C6AF7', fontWeight: '600' }]}>None</Text>
                            {!selectedCourseId && <Ionicons name="checkmark" size={18} color="#7C6AF7" />}
                        </TouchableOpacity>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {courses.map(course => {
                                const isActive = selectedCourseId === course.id;
                                return (
                                    <TouchableOpacity
                                        key={course.id}
                                        style={[styles.courseModalItem, { borderBottomColor: isDark ? '#334155' : '#F1F5F9' }, isActive && { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}
                                        onPress={() => { setSelectedCourseId(course.id); setShowCoursePicker(false); }}
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

            {/* Date Picker Modal */}
            <CalendarPicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={handleDateConfirm}
                initialDate={selectedDate}
            />

            {/* Time Picker Modal */}
            {showTimePicker && (
                <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
                    <View style={styles.pickerModal}>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerTitle}>Select Time</Text>
                            <View style={styles.timeInputRow}>
                                <TextInput style={styles.timeInput} placeholder="Hour (1-12)" keyboardType="numeric" value={String(selectedTime.getHours() % 12 || 12)} onChangeText={(text) => { const hour = parseInt(text); if (hour >= 1 && hour <= 12) { const currentHour = selectedTime.getHours(); const isPM = currentHour >= 12; const newHour = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour); setSelectedTime(new Date(selectedTime.setHours(newHour))); } }} />
                                <Text style={styles.timeSeparator}>:</Text>
                                <TextInput style={styles.timeInput} placeholder="Minute (0-59)" keyboardType="numeric" value={selectedTime.getMinutes().toString().padStart(2, '0')} onChangeText={(text) => { const minute = parseInt(text); if (minute >= 0 && minute < 60) setSelectedTime(new Date(selectedTime.setMinutes(minute))); }} />
                                <View style={styles.amPmContainer}>
                                    <TouchableOpacity style={[styles.amPmButton, selectedTime.getHours() < 12 && styles.amPmActive, { backgroundColor: selectedTime.getHours() < 12 ? '#7C6AF7' : inputBackground }]} onPress={() => { const newTime = new Date(selectedTime); if (newTime.getHours() >= 12) newTime.setHours(newTime.getHours() - 12); setSelectedTime(newTime); }}><Text style={[styles.amPmText, selectedTime.getHours() < 12 && styles.amPmTextActive]}>AM</Text></TouchableOpacity>
                                    <TouchableOpacity style={[styles.amPmButton, selectedTime.getHours() >= 12 && styles.amPmActive, { backgroundColor: selectedTime.getHours() >= 12 ? '#7C6AF7' : inputBackground }]} onPress={() => { const newTime = new Date(selectedTime); if (newTime.getHours() < 12) newTime.setHours(newTime.getHours() + 12); setSelectedTime(newTime); }}><Text style={[styles.amPmText, selectedTime.getHours() >= 12 && styles.amPmTextActive]}>PM</Text></TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.pickerActions}>
                                <TouchableOpacity style={styles.pickerCancelButton} onPress={() => setShowTimePicker(false)}><Text style={[styles.pickerCancelText, { color: subtextColor }]}>Cancel</Text></TouchableOpacity>
                                <TouchableOpacity style={[styles.pickerDoneButton, { backgroundColor: '#7C6AF7' }]} onPress={handleTimeConfirm}><Text style={styles.pickerDoneText}>Done</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    container: {
        padding: 16,
        gap: 20,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    deadlineContainer: {
        gap: 8,
    },
    deadlineRow: {
        flexDirection: 'row',
        gap: 12,
    },
    deadlineButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
    },
    deadlineButtonText: {
        fontSize: 14,
    },
    priorityContainer: {
        gap: 8,
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    priorityOptionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    courseContainer: {
        gap: 8,
    },
    coursePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    coursePickerText: {
        flex: 1,
        fontSize: 16,
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
    pickerModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        padding: 20,
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 16,
        textAlign: 'center',
    },
    dateInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    dateInput: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlign: 'center',
    },
    dateSeparator: {
        fontSize: 20,
        color: '#64748B',
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    timeInput: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 20,
        color: '#64748B',
    },
    amPmContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    amPmButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    amPmActive: {
        backgroundColor: '#5B6BFA',
    },
    amPmText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    amPmTextActive: {
        color: '#FFFFFF',
    },
    pickerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    pickerCancelButton: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        alignItems: 'center',
    },
    pickerCancelText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '600',
    },
    pickerDoneButton: {
        flex: 1,
        padding: 16,
        backgroundColor: '#5B6BFA',
        borderRadius: 12,
        alignItems: 'center',
    },
    pickerDoneText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
