import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Dimensions, Linking, TextInput, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const { width } = Dimensions.get('window');

export default function ProjectDetailsScreen() {
  const { courseId, projectId } = useLocalSearchParams();
  const router = useRouter();
  const { courses, deleteProject, updateProject } = useCourses();
  const { isDark } = useTheme();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields state
  const [editedName, setEditedName] = useState('');
  const [editedTech, setEditedTech] = useState('');
  const [editedDeadline, setEditedDeadline] = useState('');
  const [editedDetails, setEditedDetails] = useState('');
  const [editedGithub, setEditedGithub] = useState('');

  // PDF Viewer state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [viewingPdfUri, setViewingPdfUri] = useState<string | null>(null);

  // Task editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  const course = courses.find(c => c.id === courseId);
  const project = course?.projects.find(p => p.id === projectId);

  useEffect(() => {
    if (project && !isEditing) {
      setEditedName(project.name);
      setEditedTech(project.techStack);
      setEditedDeadline(project.deadline || '');
      setEditedDetails(project.details || '');
      setEditedGithub(project.githubLink || '');
    }
  }, [project, isEditing]);

  const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
  const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
  const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
  const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
  const borderColor = isDark ? '#273548' : '#C5D9EE';
  const accentColor = isDark ? '#7C6AF7' : '#2E6DA4';
  const successColor = '#3ECFA8';
  const destructiveColor = '#E8627A';

  if (!course || !project) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.container}>
          <Text style={{ color: textColor }}>Project not found</Text>
          <TouchableOpacity onPress={() => router.back()}><Text style={{ color: accentColor }}>Go Back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tasks = project.tasks || [];
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const handleDelete = () => {
    Alert.alert('Delete Project', 'Are you sure you want to delete this project?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteProject(courseId as string, projectId as string); router.back(); } }
    ]);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    updateProject(courseId as string, projectId as string, { tasks: updatedTasks });
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      completed: false
    };
    const updatedTasks = [...tasks, newTask];
    updateProject(courseId as string, projectId as string, { tasks: updatedTasks });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    updateProject(courseId as string, projectId as string, { tasks: updatedTasks });
  };

  const startEditingTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const saveTaskTitle = (taskId: string) => {
    if (!editingTaskTitle.trim()) return setEditingTaskId(null);
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, title: editingTaskTitle } : t);
    updateProject(courseId as string, projectId as string, { tasks: updatedTasks });
    setEditingTaskId(null);
  };

  const handleImportPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled) {
        updateProject(courseId as string, projectId as string, { pdfUrl: result.assets[0].uri });
        Alert.alert('Success', 'PDF linked to project');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleViewPdf = async () => {
    if (project.pdfUrl) {
      setViewingPdfUri(project.pdfUrl);
      setShowPdfModal(true);
    }
  };

  const toggleStatus = () => {
    const statuses: ('Pending' | 'In Progress' | 'Completed')[] = ['Pending', 'In Progress', 'Completed'];
    const currentIndex = statuses.indexOf(project.status || 'Pending');
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateProject(courseId as string, projectId as string, { status: nextStatus });
  };
  const handleDeletePdf = () => {
    Alert.alert('Delete PDF', 'Are you sure you want to remove this PDF?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateProject(courseId as string, project.id, { pdfUrl: undefined }) }
    ]);
  };

  const handleExportPdf = async () => {
    try {
      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; background: #0D1117; color: #E4E9F4;">
            <h1 style="color: #7C6AF7; font-size: 32px; margin-bottom: 8px;">${project.name}</h1>
            <p style="color: #6A80A4; font-size: 16px; margin-bottom: 24px;">Course: ${course.title}</p>
            
            <div style="background: #161D2A; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
              <p><strong>Tech Stack:</strong> ${project.techStack || 'Not set'}</p>
              <p><strong>Status:</strong> ${project.status || 'Pending'}</p>
              <p><strong>Deadline:</strong> ${project.deadline || 'None'}</p>
              <p><strong>Progress:</strong> ${completedTasks} / ${totalTasks} tasks completed</p>
            </div>

            <h2 style="color: #7C6AF7; border-bottom: 1px solid #273548; padding-bottom: 8px;">Description</h2>
            <p style="line-height: 1.6;">${project.details || 'No description provided.'}</p>

            <h2 style="color: #7C6AF7; border-bottom: 1px solid #273548; padding-bottom: 8px; margin-top: 32px;">Tasks</h2>
            <ul style="list-style: none; padding: 0;">
              ${tasks.map(t => `
                <li style="padding: 12px; border-bottom: 1px solid #273548; display: flex; align-items: center;">
                  <span style="margin-right: 12px;">${t.completed ? '☑' : '☐'}</span>
                  <span style="${t.completed ? 'text-decoration: line-through; color: #6A80A4;' : ''}">${t.title}</span>
                </li>
              `).join('')}
            </ul>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export project PDF');
    }
  };

  const saveEdits = () => {
    updateProject(courseId as string, projectId as string, {
      name: editedName,
      techStack: editedTech,
      deadline: editedDeadline,
      details: editedDetails,
      githubLink: editedGithub
    });
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          {isEditing ? (
            <TextInput
              style={[styles.headerTitleInput, { color: textColor }]}
              value={editedName}
              onChangeText={setEditedName}
              autoFocus
            />
          ) : (
            <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>{project.name}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => isEditing ? saveEdits() : setIsEditing(true)} style={[styles.actionIcon, { backgroundColor: isEditing ? (isDark ? '#064E3B' : '#ECFDF5') : (isDark ? '#1E2B3C' : '#F1F5F9') }]}>
            <Ionicons name={isEditing ? "checkmark" : "pencil-outline"} size={20} color={isEditing ? successColor : subtextColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.actionIcon, { backgroundColor: isDark ? '#2C1D2A' : '#FFF1F2' }]}>
            <Ionicons name="trash-outline" size={20} color={destructiveColor} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: subtextColor }]}>Tasks progress</Text>
            <Text style={[styles.progressValue, { color: accentColor }]}>{completedTasks} / {totalTasks} done</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
              <Text style={[styles.cardLabel, { color: subtextColor }]}>TECH STACK</Text>
              {isEditing ? (
                <TextInput style={[styles.cardValue, { color: textColor }]} value={editedTech} onChangeText={setEditedTech} placeholder="e.g. React" placeholderTextColor={subtextColor} />
              ) : (
                <Text style={[styles.cardValue, { color: textColor }]}>{project.techStack || 'Not set'}</Text>
              )}
            </View>
            <TouchableOpacity onPress={toggleStatus} style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
              <Text style={[styles.cardLabel, { color: subtextColor }]}>STATUS</Text>
              <Text style={[styles.cardValue, { color: project.status === 'Completed' ? successColor : project.status === 'In Progress' ? accentColor : textColor }]}>
                {project.status || 'Pending'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
              <Text style={[styles.cardLabel, { color: subtextColor }]}>DEADLINE</Text>
              {isEditing ? (
                <TextInput style={[styles.cardValue, { color: textColor }]} value={editedDeadline} onChangeText={setEditedDeadline} placeholder="DD-MM-YYYY" placeholderTextColor={subtextColor} />
              ) : (
                <Text style={[styles.cardValue, { color: textColor }]}>{project.deadline || 'None'}</Text>
              )}
            </View>
            <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
              <Text style={[styles.cardLabel, { color: subtextColor }]}>DETAILS</Text>
              {isEditing ? (
                <TextInput style={[styles.cardValue, { color: textColor }]} value={editedDetails} onChangeText={setEditedDetails} multiline placeholder="Project details..." placeholderTextColor={subtextColor} />
              ) : (
                <Text style={[styles.cardValue, { color: textColor }]}>{project.details || 'No description'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* GitHub Link Card - PERMANENT */}
        <View style={[styles.linkCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.linkLeft}>
            <View style={[styles.linkIconContainer, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}>
              <Ionicons name="logo-github" size={20} color={textColor} />
            </View>
            {isEditing ? (
              <TextInput 
                style={[styles.linkText, { color: textColor, flex: 1 }]} 
                value={editedGithub} 
                onChangeText={setEditedGithub}
                placeholder="GitHub Repository URL"
                placeholderTextColor={subtextColor}
              />
            ) : (
              <Text style={[styles.linkText, { color: textColor }]} numberOfLines={1}>
                {project.githubLink ? project.githubLink.replace('https://', '') : 'No GitHub link added'}
              </Text>
            )}
          </View>
          {!isEditing && project.githubLink && (
            <TouchableOpacity onPress={() => {
              const url = project.githubLink!.startsWith('http') ? project.githubLink! : `https://${project.githubLink}`;
              Linking.openURL(url).catch(() => Alert.alert('Error', 'Invalid GitHub URL'));
            }}>
              <Text style={[styles.openText, { color: accentColor }]}>Open</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* PDF ATTACHMENT - BELOW GITHUB */}
        {project.pdfUrl && (
          <View style={[styles.pdfChip, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.pdfIconContainer}>
              <Ionicons name="document-outline" size={24} color={destructiveColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pdfName, { color: textColor }]} numberOfLines={1}>
                {project.pdfUrl.split('/').pop()}
              </Text>
              <Text style={{ color: subtextColor, fontSize: 12 }}>Project Resource</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={handleViewPdf}>
                <Text style={{ color: accentColor, fontWeight: '700' }}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeletePdf}>
                <Ionicons name="trash-outline" size={20} color={destructiveColor} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tasks Section */}
        <View style={styles.tasksHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Tasks</Text>
          <TouchableOpacity onPress={() => setShowAddTask(true)}>
            <Text style={[styles.addText, { color: accentColor }]}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {showAddTask && (
          <View style={[styles.addTaskRow, { backgroundColor: cardBackground, borderColor }]}>
            <TextInput
              style={[styles.addTaskInput, { color: textColor }]}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={subtextColor}
              autoFocus
              onSubmitEditing={addTask}
            />
            <TouchableOpacity onPress={addTask}>
              <Ionicons name="arrow-forward-circle" size={32} color={accentColor} />
            </TouchableOpacity>
          </View>
        )}

        {tasks.length > 0 ? (
          tasks.map((task) => (
            <View 
              key={task.id} 
              style={[styles.taskItem, { backgroundColor: cardBackground, borderColor }]}
            >
              <TouchableOpacity 
                style={styles.taskLeft}
                onPress={() => toggleTask(task.id)}
              >
                <View style={[styles.checkbox, { borderColor: task.completed ? successColor : subtextColor, backgroundColor: task.completed ? successColor : 'transparent' }]}>
                  {task.completed && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
                {editingTaskId === task.id ? (
                  <TextInput
                    style={[styles.taskTitleInput, { color: textColor }]}
                    value={editingTaskTitle}
                    onChangeText={setEditingTaskTitle}
                    autoFocus
                    onBlur={() => saveTaskTitle(task.id)}
                    onSubmitEditing={() => saveTaskTitle(task.id)}
                  />
                ) : (
                  <Text style={[styles.taskTitle, { color: task.completed ? subtextColor : textColor, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>
                    {task.title}
                  </Text>
                )}
              </TouchableOpacity>
              <View style={styles.taskActions}>
                {editingTaskId === task.id ? (
                  <TouchableOpacity onPress={() => saveTaskTitle(task.id)}>
                    <Ionicons name="checkmark-circle" size={22} color={successColor} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => startEditingTask(task)}>
                    <Ionicons name="pencil-outline" size={20} color={subtextColor} style={{ marginRight: 12 }} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteTask(task.id)}>
                  <Ionicons name="trash-outline" size={20} color={destructiveColor} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          !showAddTask && (
            <View style={[styles.emptyTasks, { backgroundColor: cardBackground, borderColor }]}>
              <Text style={{ color: subtextColor }}>No tasks added yet</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { borderTopColor: borderColor, backgroundColor }]}>
        <TouchableOpacity style={styles.bottomBarItem} onPress={handleImportPdf}>
          <Ionicons name="download-outline" size={24} color={subtextColor} />
          <Text style={[styles.bottomBarText, { color: subtextColor }]}>Import PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomBarItem} onPress={handleExportPdf}>
           <Ionicons name="share-outline" size={24} color={subtextColor} />
           <Text style={[styles.bottomBarText, { color: subtextColor }]}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {/* PDF Viewer Modal */}
      <Modal
        visible={showPdfModal}
        animationType="slide"
        onRequestClose={() => setShowPdfModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPdfModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>Project Document</Text>
            <View style={{ width: 40 }} />
          </View>
          <WebView 
            source={{ uri: viewingPdfUri || '' }} 
            style={{ flex: 1 }}
            scalesPageToFit
            originWhitelist={['*']}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 45 : 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  headerTitleInput: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    padding: 0,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  grid: {
    gap: 12,
    marginBottom: 32,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  linkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  openText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  addText: {
    fontSize: 15,
    fontWeight: '700',
  },
  addTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  addTaskInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  taskTitleInput: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    padding: 0,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 16,
    borderWidth: 1,
  },
  pdfIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  emptyTasks: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  bottomBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomBarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#161D2A',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
});
