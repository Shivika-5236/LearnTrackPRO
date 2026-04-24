import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses, Course } from '@/context/CourseContext';
import { useTasks } from '@/context/TaskContext';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';

import { format, differenceInDays, parseISO } from 'date-fns';

const { width } = Dimensions.get('window');

export default function CourseDetailsScreen() {
  const { courseId, initialTab } = useLocalSearchParams();
  const router = useRouter();
  const { courses, deleteCourse, updateCourse, addAssignment, deleteAssignment, addNote, updateNote, deleteNote, addProject, deleteProject } = useCourses();
  const { tasks, updateTaskStatus, deleteTask } = useTasks();
  const { isDark } = useTheme();
  const course = courses.find(c => c.id === courseId);

  const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
  const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
  const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
  const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
  const inputBackground = isDark ? '#1E2B3C' : '#F8FAFC';
  const borderColor = isDark ? '#273548' : '#C5D9EE';

  const [activeTab, setActiveTab] = useState<'Assignment' | 'Notes' | 'Project'>((initialTab as any) || 'Assignment');
  const [searchQuery, setSearchQuery] = useState('');

  const calculateProjectProgress = (tasks: any[] = []) => {
    if (!tasks || tasks.length === 0) return 0;
    const completedCount = tasks.filter(t => t.completed).length;
    return Math.round((completedCount / tasks.length) * 100);
  };

  const getWordCount = (html: string) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>?/gm, '');
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return null;
    try {
      const due = parseISO(dueDate);
      return differenceInDays(due, new Date());
    } catch (e) {
      return null;
    }
  };



  if (!course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Course not found</Text>
          <TouchableOpacity onPress={() => router.back()}><Text>Go Back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const linkedTasks = tasks.filter(t => t.courseId === courseId);

  const handleDelete = () => {
    Alert.alert('Delete Course', 'Are you sure you want to delete this course?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          deleteCourse(course.id);
          router.back();
        }
      }
    ]);
  };



  const renderContent = () => {
    const searchPlaceholder = `Search your ${activeTab.toLowerCase()}...`;
    
    const filterBySearch = (itemTitle: string) => {
        if (!searchQuery) return true;
        return itemTitle.toLowerCase().includes(searchQuery.toLowerCase());
    };

    const renderSearchBar = () => (
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1E2B3C' : '#E5E5E5' }]}>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={searchPlaceholder}
          placeholderTextColor={subtextColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search-outline" size={20} color={subtextColor} />
      </View>
    );

    switch (activeTab) {
      case 'Assignment':
        return (
          <View style={styles.section}>
            {renderSearchBar()}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.sectionCount, { color: subtextColor, marginBottom: 0, marginTop: 0 }]}>
                {course.assignments.length} {course.assignments.length === 1 ? 'ASSIGNMENT' : 'ASSIGNMENTS'}
              </Text>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={async () => {
                  const newAssignment = await addAssignment(course.id, { 
                    title: 'New Assignment', 
                    status: 'Not Submitted',
                    dueDate: new Date().toISOString(),
                    problemStatement: 'Describe the assignment...',
                    content: '',
                    wordCount: 0,
                    lastEdited: new Date().toISOString()
                  });
                  if (newAssignment) {
                    router.push({ pathname: '/courses/assignment-details', params: { courseId: course.id, assignmentId: newAssignment.id } });
                  }
                }}
              >
                <Text style={{ color: '#7C6AF7', fontWeight: '800', fontSize: 13 }}>+Add</Text>
              </TouchableOpacity>
            </View>
            {course.assignments.filter(a => filterBySearch(a.title)).map((a, index) => {
              const daysLeft = getDaysRemaining(a.dueDate || '');
              return (
                <TouchableOpacity
                  key={a.id || `assignment-${index}`}
                  style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
                  onPress={() => router.push({ pathname: '/courses/assignment-details', params: { courseId: course.id, assignmentId: a.id } })}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>{a.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.statusBadge, { backgroundColor: a.status === 'Submitted' ? (isDark ? '#064E3B' : '#ECFDF5') : (isDark ? '#451A1A' : '#FEF9C3') }]}>
                        <Text style={[styles.statusBadgeText, { color: a.status === 'Submitted' ? '#3ECFA8' : '#97712C' }]}>
                          {a.status || 'Pending'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => {
                        Alert.alert('Delete Assignment', 'Are you sure?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteAssignment(course.id, a.id) }
                        ]);
                      }}>
                        <Ionicons name="trash-outline" size={18} color="#E8627A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.cardMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={subtextColor} />
                      <Text style={[styles.metaItemText, { color: subtextColor }]}>{a.dueDate || 'No date'}</Text>
                    </View>
                    {daysLeft !== null && (
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={subtextColor} />
                        <Text style={[styles.metaItemText, { color: subtextColor }]}>{daysLeft}d left</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      case 'Notes':
        return (
          <View style={styles.section}>
            {renderSearchBar()}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.sectionCount, { color: subtextColor, marginBottom: 0, marginTop: 0 }]}>
                {course.notes.length} {course.notes.length === 1 ? 'NOTE' : 'NOTES'}
              </Text>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={async () => {
                  const newNote = await addNote(course.id, { heading: 'New Note', content: '', lastEdited: new Date().toISOString() });
                  if (newNote) {
                    router.push({ pathname: '/courses/note-details', params: { courseId: course.id, noteId: newNote.id } });
                  }
                }}
              >
                <Text style={{ color: '#7C6AF7', fontWeight: '800', fontSize: 13 }}>+Add</Text>
              </TouchableOpacity>
            </View>
            {course.notes.filter(n => filterBySearch(n.heading)).map((n, index) => (
              <TouchableOpacity 
                key={n.id || `note-${index}`} 
                style={[styles.card, { backgroundColor: cardBackground, borderColor }]} 
                onPress={() => router.push({ pathname: '/courses/note-details', params: { courseId: course.id, noteId: n.id } })}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>{n.heading}</Text>
                  <TouchableOpacity onPress={() => {
                    Alert.alert('Delete Note', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteNote(course.id, n.id) }
                    ]);
                  }}>
                    <Ionicons name="trash-outline" size={18} color="#E8627A" />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardMetaRow}>
                  <Text style={[styles.metaItemText, { color: subtextColor }]}>{getWordCount(n.content)} words</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'Project':
        return (
          <View style={styles.section}>
            {renderSearchBar()}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.sectionCount, { color: subtextColor, marginBottom: 0, marginTop: 0 }]}>
                {course.projects.length} {course.projects.length === 1 ? 'PROJECT' : 'PROJECTS'}
              </Text>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => router.push(`/courses/add-item?courseId=${course.id}&type=Project`)}
              >
                <Text style={{ color: '#7C6AF7', fontWeight: '800', fontSize: 13 }}>+Add</Text>
              </TouchableOpacity>
            </View>
            {course.projects.filter(p => filterBySearch(p.name)).map((p, index) => (
              <TouchableOpacity
                key={p.id || `project-${index}`}
                style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
                onPress={() => router.push({ pathname: '/courses/project-details', params: { courseId: course.id, projectId: p.id } })}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>{p.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={[styles.metaItemText, { color: subtextColor }]}>Due {p.dueDate || 'N/A'}</Text>
                    <TouchableOpacity onPress={() => {
                      Alert.alert('Delete Project', 'Are you sure?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteProject(course.id, p.id) }
                      ]);
                    }}>
                      <Ionicons name="trash-outline" size={18} color="#E8627A" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.tagRow}>
                  <View style={[styles.miniTag, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}>
                    <Text style={[styles.miniTagText, { color: subtextColor }]}>{course.tag}</Text>
                  </View>
                  <View style={[styles.miniTag, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
                    <Text style={[styles.miniTagText, { color: '#7C6AF7' }]}>{p.status || 'In Progress'}</Text>
                  </View>
                </View>
                <View style={styles.progressSection}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={[styles.progressLabel, { color: subtextColor }]}>Progress</Text>
                    <Text style={[styles.progressValue, { color: '#7C6AF7' }]}>{calculateProjectProgress(p.tasks)}%</Text>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}>
                    <View style={[styles.progressBarFill, { width: `${calculateProjectProgress(p.tasks)}%`, backgroundColor: '#7C6AF7' }]} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: textColor }]}>{course.title}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#E8627A" />
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View style={[styles.metadataContainer, { borderBottomColor: borderColor }]}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: textColor }]}>Description : </Text>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Text style={[styles.metaValue, { color: textColor, flex: 1, marginRight: 8 }]} numberOfLines={3}>{course.description || 'No description provided.'}</Text>
              <TouchableOpacity onPress={() => router.push(`/courses/add?courseId=${course.id}`)}>
                <Ionicons name="create-outline" size={20} color="#7C6AF7" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: textColor }]}>Mentor name : </Text>
            <Text style={[styles.metaValue, { color: textColor, flex: 1 }]}>{course.instructor || 'Not assigned'}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: textColor }]}>Subject label : </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {course.label ? (
                <>
                  <Ionicons name={(course.label.split(' ')[0] || 'book-outline') as any} size={16} color={course.labelColor || textColor} style={{ marginRight: 4 }} />
                  <Text style={[styles.metaValue, { color: textColor }]}>{course.label.substring(course.label.indexOf(' ') + 1)}</Text>
                </>
              ) : (
                <Text style={[styles.metaValue, { color: textColor }]}>No label</Text>
              )}
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: textColor }]}>Course duration : </Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.metaValue, { color: textColor }]}>{(course.durationValue || course.totalHours || '0') + ' ' + (course.durationUnit || 'hrs')}</Text>
              <View style={[styles.tagPill, { backgroundColor: isDark ? '#273548' : '#E5E5E5' }]}>
                <Text style={[styles.tagPillText, { color: textColor }]}>{course.tag === 'Personal Learning' ? 'Self' : course.tag.toLowerCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ width: '100%', height: 60, backgroundColor }}>
          <View style={{ 
            flexDirection: 'row', 
            flex: 1, 
            paddingHorizontal: 16, 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: backgroundColor
          }}>
            {(['Notes', 'Project', 'Assignment'] as const).map(tab => {
              const isActive = activeTab === tab;
              let iconName: any = 'document-text-outline';
              if (tab === 'Project') iconName = 'git-branch-outline';
              if (tab === 'Assignment') iconName = 'pencil-outline';
              
              return (
                <View key={tab} style={{ flex: 1, paddingHorizontal: 4 }}>
                  <TouchableOpacity
                    onPress={() => { setActiveTab(tab); setSearchQuery(''); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                      borderRadius: 14,
                      gap: 6,
                      backgroundColor: isActive ? (isDark ? '#273548' : '#F1F5F9') : 'transparent',
                      width: '100%'
                    }}
                  >
                    <Ionicons 
                      name={iconName} 
                      size={18} 
                      color={isActive ? textColor : subtextColor} 
                    />
                    <Text style={{ 
                      color: isActive ? textColor : subtextColor, 
                      fontSize: 13,
                      fontWeight: isActive ? '700' : '600'
                    }}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.content, { backgroundColor }]}>
          {renderContent()}
        </View>
      </ScrollView>



    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  courseHeaderContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  instructor: {
    fontSize: 16,
    color: '#64748B',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    borderBottomColor: '#0F172A',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
  },
  content: {
    padding: 20,
    minHeight: 500,
  },
  section: {
    gap: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#64748B',
    opacity: 0.5,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  miniTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  editButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  primaryModalButton: {
    backgroundColor: '#0F172A',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  primaryModalButtonText: {
    color: '#FFFFFF',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  metadataContainer: {
    padding: 20,
    gap: 8,
    borderBottomWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  metaLabel: {
    width: 140,
    fontSize: 14,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  listItemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  listDeleteButton: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
