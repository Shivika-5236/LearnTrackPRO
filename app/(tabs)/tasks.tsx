import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '@/components/sidebar-context';
import { useTasks, TaskPriority, TaskStatus } from '@/context/TaskContext';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function TasksScreen() {
  const { openSidebar } = useSidebar();
  const { tasks, addTask } = useTasks();
  const router = useRouter();
  const { isDark } = useTheme();

  const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const inputBackground = isDark ? '#1E293B' : '#F1F5F9';

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDetails, setNewTaskDetails] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  const [isAdding, setIsAdding] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const formatDateTime = (date: Date, time: Date) => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} · ${timeStr}`;
  };

  const handleDateConfirm = () => {
    setNewTaskDeadline(formatDateTime(selectedDate, selectedTime));
    setShowDatePicker(false);
  };

  const handleTimeConfirm = () => {
    setNewTaskDeadline(formatDateTime(selectedDate, selectedTime));
    setShowTimePicker(false);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Validation Error', 'Task Name cannot be empty.');
      return;
    }

    addTask({
      title: newTaskTitle,
      details: newTaskDetails,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      status: 'Not started',
    });

    setNewTaskTitle('');
    setNewTaskDetails('');
    setNewTaskDeadline('');
    setNewTaskPriority('Medium');
    setIsAdding(false);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#64748B';
    }
  };

  const renderTaskSection = (title: string, status: TaskStatus, color: string) => {
    const sectionTasks = getTasksByStatus(status);
    const task = sectionTasks[0]; // Display only one task

    return (
      <View key={title} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIndicator, { backgroundColor: color }]} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
          </View>
          {sectionTasks.length > 0 && (
            <TouchableOpacity onPress={() => router.push({ pathname: '/tasks/see-all', params: { status } } as any)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {task ? (
          <TouchableOpacity
            style={[styles.taskCard, { backgroundColor: cardBackground }]}
            onPress={() => router.push({ pathname: '/task-details', params: { taskId: task.id } })}
          >
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: textColor }]} numberOfLines={1}>{task.title}</Text>
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
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks in this section</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }]}>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Tasks</Text>
          <Text style={[styles.headerSubtitle, { color: subtextColor }]}>Manage your workflow</Text>
        </View>
        <TouchableOpacity onPress={openSidebar} style={[styles.menuButton, { backgroundColor: cardBackground }]}>
          <Ionicons name="menu-outline" size={28} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {renderTaskSection('Not Started', 'Not started', '#F59E0B')}
        {renderTaskSection('Doing', 'Doing', '#3B82F6')}
        {renderTaskSection('Completed', 'Completed', '#10B981')}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]}
        onPress={() => router.push('/tasks/create-task')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  addTaskContainer: {
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B6BFA',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#5B6BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  composer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  composerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  priorityOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#5B6BFA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 14,
    color: '#5B6BFA',
    fontWeight: '600',
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
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
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
  },
  deadlineButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  pickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#0F172A',
  },
  dateSeparator: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  timeInput: {
    width: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#0F172A',
  },
  timeSeparator: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
  },
  amPmContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  amPmButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
    marginTop: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
