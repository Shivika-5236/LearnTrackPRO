import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses, Course } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function CourseDetailsScreen() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const { courses, deleteCourse, addAssignment, addNote, updateNote, deleteNote, addProject } = useCourses();
  const { isDark } = useTheme();
  const course = courses.find(c => c.id === courseId);

  const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
  const inputBackground = isDark ? '#0F172A' : '#F8FAFC';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const [activeTab, setActiveTab] = useState<'Assignments' | 'Notes' | 'Projects'>('Assignments');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'Assignment' | 'Note' | 'Project' | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [techStack, setTechStack] = useState('');
  const [projectDetails, setProjectDetails] = useState('');

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

  const handleAdd = () => {
    if (modalType === 'Assignment') {
      if (!title || !description) return Alert.alert('Error', 'Fill all fields');
      addAssignment(course.id, { title, description });
    } else if (modalType === 'Note') {
      if (!title || !content) return Alert.alert('Error', 'Fill all fields');
      if (editingNoteId) {
        updateNote(course.id, editingNoteId, { heading: title, content });
        setEditingNoteId(null);
      } else {
        addNote(course.id, { heading: title, content });
      }
    } else if (modalType === 'Project') {
      if (!title || !techStack) return Alert.alert('Error', 'Fill all fields');
      addProject(course.id, { name: title, techStack, details: projectDetails });
    }
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setTechStack('');
    setProjectDetails('');
    setModalType(null);
    setEditingNoteId(null);
  };

  const openModal = (type: 'Assignment' | 'Note' | 'Project') => {
    setModalType(type);
    setModalVisible(true);
  };

  const startEditingNote = (noteId: string) => {
    const note = course.notes.find(n => n.id === noteId);
    if (note) {
      setTitle(note.heading);
      setContent(note.content);
      setEditingNoteId(noteId);
      setModalType('Note');
      setModalVisible(true);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Assignments':
        return (
          <View style={styles.section}>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]} onPress={() => openModal('Assignment')}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Assignment</Text>
            </TouchableOpacity>
            {course.assignments.map(a => (
              <TouchableOpacity
                key={a.id}
                style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
                onPress={() => router.push({ pathname: '/courses/assignment-details', params: { courseId: course.id, assignmentId: a.id } })}
              >
                <Ionicons name="document-text" size={24} color="#5B6BFA" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: textColor }]}>{a.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: subtextColor }]} numberOfLines={2}>{a.description || 'No description'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={subtextColor} />
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'Notes':
        return (
          <View style={styles.section}>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]} onPress={() => openModal('Note')}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Note</Text>
            </TouchableOpacity>
            {course.notes.map(n => (
              <View key={n.id} style={styles.card}>
                <Ionicons name="journal" size={24} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{n.heading}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>{n.content}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => startEditingNote(n.id)}
                  style={styles.editButton}
                >
                  <Ionicons name="pencil" size={18} color="#5B6BFA" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Delete Note', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteNote(course.id, n.id) }
                    ]);
                  }}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      case 'Projects':
        return (
          <View style={styles.section}>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]} onPress={() => openModal('Project')}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Project</Text>
            </TouchableOpacity>
            {course.projects.map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/courses/project-details', params: { courseId: course.id, projectId: p.id } })}
              >
                <Ionicons name="code-slash" size={24} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{p.name}</Text>
                  <Text style={styles.cardSubtitle}>{p.techStack}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[1]}>
        <View style={[styles.courseHeaderContainer, { backgroundColor }]}>
          <View style={styles.headerContent}>
            <View style={[styles.tag, { backgroundColor: course.tag === 'College' ? '#EFF6FF' : '#F0FDF4' }]}>
              <Text style={[styles.tagText, { color: course.tag === 'College' ? '#3B82F6' : '#16A34A' }]}>{course.tag}</Text>
            </View>
            <Text style={[styles.title, { color: textColor }]}>{course.title}</Text>
            <Text style={[styles.instructor, { color: subtextColor }]}>{course.instructor}</Text>
          </View>
        </View>

        <View style={[styles.tabs, { backgroundColor }]}>
          {(['Assignments', 'Notes', 'Projects'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { borderBottomColor: textColor }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && { color: textColor }, { color: subtextColor }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.content, { backgroundColor }]}>
          {renderContent()}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContentWrapper}
            >
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.modalContent, { backgroundColor }]}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>{editingNoteId ? 'Edit' : 'Add'} {modalType}</Text>

                  {(modalType === 'Assignment' || modalType === 'Note' || modalType === 'Project') && (
                    <TextInput
                      style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                      placeholder={modalType === 'Project' ? 'Project Name' : 'Title'}
                      placeholderTextColor={subtextColor}
                      value={title}
                      onChangeText={setTitle}
                    />
                  )}

                  {modalType === 'Assignment' && (
                    <TextInput
                      style={[styles.input, { height: 100, textAlignVertical: 'top', backgroundColor: inputBackground, borderColor, color: textColor }]}
                      placeholder="Description"
                      placeholderTextColor={subtextColor}
                      multiline
                      value={description}
                      onChangeText={setDescription}
                    />
                  )}

                  {modalType === 'Note' && (
                    <TextInput
                      style={[styles.input, { height: 100, textAlignVertical: 'top', backgroundColor: inputBackground, borderColor, color: textColor }]}
                      placeholder="Content"
                      placeholderTextColor={subtextColor}
                      multiline
                      value={content}
                      onChangeText={setContent}
                    />
                  )}

                  {modalType === 'Project' && (
                    <>
                      <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                        placeholder="Tech Stack"
                        placeholderTextColor={subtextColor}
                        value={techStack}
                        onChangeText={setTechStack}
                      />
                      <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top', backgroundColor: inputBackground, borderColor, color: textColor }]}
                        placeholder="Details"
                        placeholderTextColor={subtextColor}
                        multiline
                        value={projectDetails}
                        onChangeText={setProjectDetails}
                      />
                    </>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                      <Text style={[styles.modalButtonText, { color: subtextColor }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAdd} style={[styles.modalButton, styles.primaryModalButton, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]}>
                      <Text style={styles.primaryModalButtonText}>{editingNoteId ? 'Save' : 'Add'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    paddingVertical: 16,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
});
