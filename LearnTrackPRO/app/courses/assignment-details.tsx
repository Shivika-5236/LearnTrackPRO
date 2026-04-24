import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Dimensions, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter, Stack as RouterStack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { WebView } from 'react-native-webview';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { format, differenceInDays, parseISO } from 'date-fns';

const { width } = Dimensions.get('window');

// Custom icons for headings that don't have default ones in the library
const customIconMap = {
  [actions.heading1]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontWeight: '800', fontSize: 16 }}>H1</Text>,
  [actions.heading2]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontWeight: '800', fontSize: 16 }}>H2</Text>,
  [actions.heading3]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontWeight: '800', fontSize: 16 }}>H3</Text>,
  [actions.heading4]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontWeight: '800', fontSize: 16 }}>H4</Text>,
  [actions.heading5]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontWeight: '800', fontSize: 16 }}>H5</Text>,
  [actions.heading6]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontWeight: '800', fontSize: 16 }}>H6</Text>,
  [actions.setParagraph]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontWeight: '800', fontSize: 12 }}>Body</Text>,
};

export default function AssignmentDetailsScreen() {
  const { courseId, assignmentId } = useLocalSearchParams();
  const router = useRouter();
  const { courses, deleteAssignment, updateAssignment } = useCourses();
  const { isDark } = useTheme();
  const richText = useRef<RichEditor>(null);

  const course = courses.find(c => c.id === courseId);
  const assignment = course?.assignments.find(a => a.id === assignmentId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(assignment?.title || '');
  const [editedDescription, setEditedDescription] = useState(assignment?.description || '');
  const [editedDueDate, setEditedDueDate] = useState(assignment?.dueDate || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // PDF Viewer state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [viewingPdfUri, setViewingPdfUri] = useState<string | null>(null);

  useEffect(() => {
    if (assignment) {
      if (!isEditing) {
        setEditedTitle(assignment.title);
        setEditedDescription(assignment.description);
        setEditedDueDate(assignment.dueDate || '');
      }
      calculateWordCount(assignment.description);
    }
  }, [assignment, isEditing]);

  const calculateWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>?/gm, '');
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(count);
  };

  const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
  const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
  const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
  const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
  const borderColor = isDark ? '#273548' : '#C5D9EE';
  const accentColor = isDark ? '#7C6AF7' : '#2E6DA4';
  const successColor = isDark ? '#3ECFA8' : '#4CAF8A';
  const destructiveColor = isDark ? '#E8627A' : '#D0524A';
  const warningBg = isDark ? '#2D2211' : '#FFFBEB';
  const warningText = '#FFAB00';

  if (!course || !assignment) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.container}>
          <Text style={{ color: textColor }}>Assignment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Assignment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteAssignment(courseId as string, assignmentId as string); router.back(); } }
    ]);
  };

  const saveEdits = () => {
    updateAssignment(courseId as string, assignmentId as string, {
      title: editedTitle,
      description: editedDescription,
      dueDate: editedDueDate
    });
    setIsEditing(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setEditedDueDate(dateStr);
      updateAssignment(courseId as string, assignmentId as string, { dueDate: dateStr });
    }
  };

  const handleImportPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled) {
        updateAssignment(courseId as string, assignmentId as string, { pdfUrl: result.assets[0].uri });
        Alert.alert('Success', 'PDF linked to assignment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleDeletePdf = () => {
    Alert.alert('Delete PDF', 'Are you sure you want to remove this PDF?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateAssignment(courseId as string, assignmentId as string, { pdfUrl: undefined }) }
    ]);
  };

  const handleExportPdf = async () => {
    try {
      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; background: #FFF; color: #333;">
            <h1 style="color: ${accentColor};">${editedTitle}</h1>
            <p><strong>Course:</strong> ${course.title}</p>
            <p><strong>Due Date:</strong> ${assignment.dueDate || 'N/A'}</p>
            <p><strong>Status:</strong> ${assignment.status || 'Not Submitted'}</p>
            <hr/>
            <div style="margin-top: 20px;">${editedDescription}</div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export assignment');
    }
  };

  const handleViewPdf = () => {
    if (assignment.pdfUrl) {
      setViewingPdfUri(assignment.pdfUrl);
      setShowPdfModal(true);
    }
  };

  const toggleStatus = () => {
    const nextStatus = assignment.status === 'Submitted' ? 'Not Submitted' : 'Submitted';
    updateAssignment(courseId as string, assignmentId as string, { status: nextStatus });
  };

  const getRemainingDays = () => {
    if (!assignment.dueDate) return null;
    try {
      const due = parseISO(assignment.dueDate);
      const diff = differenceInDays(due, new Date());
      return diff;
    } catch (e) {
      return null;
    }
  };

  const remainingDays = getRemainingDays();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <RouterStack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View style={[styles.customHeader, { backgroundColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Ionicons name="chevron-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerCenterTitle, { color: textColor }]} numberOfLines={1}>
          {assignment.title}
        </Text>
        <View style={styles.headerRightGroup}>
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerIconBtn}>
            <Ionicons name="pencil-outline" size={22} color={subtextColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerIconBtn}>
            <Ionicons name="trash-outline" size={22} color={destructiveColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Title and Editing Row */}
          <View style={styles.titleArea}>
            {isEditing ? (
              <View style={styles.editingHeader}>
                <TextInput
                  style={[styles.titleInput, { color: textColor, borderBottomColor: accentColor }]}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder="Assignment Title"
                  placeholderTextColor={subtextColor}
                  autoFocus
                />
                <TouchableOpacity onPress={saveEdits} style={[styles.saveButtonSmall, { backgroundColor: successColor }]}>
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.mainTitle, { color: textColor }]}>{assignment.title}</Text>
            )}
          </View>

          {/* Toolbar */}
          <View style={styles.toolbarContainer}>
            <RichToolbar
              editor={richText}
              actions={[
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.setStrikethrough,
                actions.insertBulletsList,
                actions.insertOrderedList,
                actions.undo,
                actions.redo,
              ]}
              iconMap={customIconMap}
              iconTint={subtextColor}
              selectedIconTint={accentColor}
              style={[styles.richToolbar, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, paddingVertical: 6 }]}
              flatContainerStyle={{ paddingHorizontal: 16 }}
            />
            <RichToolbar
              editor={richText}
              actions={[
                actions.heading1,
                actions.heading2,
                actions.heading3,
                actions.heading4,
                actions.heading5,
                actions.heading6,
                actions.setParagraph,
              ]}
              iconMap={customIconMap}
              iconTint={subtextColor}
              selectedIconTint={accentColor}
              style={[styles.richToolbar, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9', borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingVertical: 6 }]}
              flatContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>

          {/* Tags Row */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}>
              <Text style={[styles.tagText, { color: accentColor }]}>{course.tag}</Text>
            </View>
            <TouchableOpacity 
              onPress={toggleStatus}
              style={[styles.tag, { backgroundColor: assignment.status === 'Submitted' ? (isDark ? '#064E3B' : '#ECFDF5') : (isDark ? '#451A1A' : '#FEF2F2') }]}
            >
              <Text style={[styles.tagText, { color: assignment.status === 'Submitted' ? successColor : destructiveColor }]}>
                {assignment.status || 'Not Submitted'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.infoText, { color: subtextColor }]}>{format(new Date(), 'MMM dd, yyyy')}  •  {wordCount} words</Text>
          </View>

          {/* Due Warning Banner */}
          {remainingDays !== null && !isEditing && (
            <View style={[styles.warningBanner, { backgroundColor: warningBg }]}>
              <View style={styles.warningLeft}>
                <Ionicons name="warning-outline" size={20} color={warningText} />
                <Text style={[styles.warningText, { color: warningText }]}>
                  Due in {remainingDays} days — {assignment.dueDate}
                </Text>
              </View>
              {assignment.status === 'Submitted' && (
                <View style={[styles.submittedBadge, { backgroundColor: isDark ? '#065F46' : '#D1FAE5' }]}>
                   <Text style={[styles.submittedBadgeText, { color: successColor }]}>Submitted</Text>
                </View>
              )}
            </View>
          )}

          {/* File Section */}
          {assignment.pdfUrl && (
            <View style={[styles.fileCard, { backgroundColor: cardBackground, borderColor }]}>
              <View style={styles.fileLeft}>
                <View style={[styles.pdfIconBox, { backgroundColor: isDark ? '#451A1A' : '#FEE2E2' }]}>
                  <Ionicons name="document-text" size={20} color={destructiveColor} />
                </View>
                <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1}>
                  {assignment.pdfUrl.split('/').pop()}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={handleViewPdf}>
                  <Text style={[styles.viewText, { color: accentColor }]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeletePdf}>
                  <Ionicons name="trash-outline" size={20} color={destructiveColor} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Deadline Section */}
          <View style={[styles.deadlineRow, { borderBottomColor: borderColor }]}>
            <View style={styles.deadlineLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#273548' : '#F1F5F9' }]}>
                <Ionicons name="calendar" size={20} color={accentColor} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.deadlineLabel, { color: subtextColor }]}>Deadline</Text>
                <Text style={[styles.deadlineValue, { color: textColor }]}>
                  {editedDueDate ? format(parseISO(editedDueDate), 'EEEE, MMM dd, yyyy') : 'No deadline set'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.editDateButton, { backgroundColor: isDark ? '#273548' : '#F1F5F9' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.editDateText, { color: accentColor }]}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.descriptionTitle, { color: textColor }]}>Problem statement</Text>
          <RichEditor
            ref={richText}
            initialContentHTML={editedDescription}
            onChange={content => {
              setEditedDescription(content);
              calculateWordCount(content);
            }}
            placeholder="Describe the assignment..."
            editorStyle={{
              backgroundColor: 'transparent',
              color: textColor,
              contentCSSText: `font-size: 16px; min-height: 400px; color: ${textColor};`,
            }}
            style={styles.editor}
            disabled={!isEditing}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { borderTopColor: borderColor, backgroundColor }]}>
        <View style={styles.bottomLeft}>
           <Ionicons name="reader-outline" size={20} color={subtextColor} />
           <Text style={[styles.bottomInfoText, { color: subtextColor }]}>{wordCount} words</Text>
        </View>
        <View style={styles.bottomRight}>
          <TouchableOpacity style={styles.bottomAction} onPress={handleImportPdf}>
            <Ionicons name="download-outline" size={20} color={subtextColor} />
            <Text style={[styles.bottomActionText, { color: subtextColor }]}>Import PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportButton, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]} onPress={handleExportPdf}>
            <Ionicons name="share-outline" size={18} color={accentColor} />
            <Text style={[styles.exportText, { color: accentColor }]}>Export PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF Viewer Modal */}
      <Modal visible={showPdfModal} animationType="slide" onRequestClose={() => setShowPdfModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPdfModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Assignment Document</Text>
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

      {showDatePicker && (
        <DateTimePicker
          value={editedDueDate ? parseISO(editedDueDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
  },
  titleArea: {
    marginBottom: 20,
    marginTop: 10,
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
  saveButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    marginTop: 8,
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
  titleInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 4,
    borderBottomWidth: 2,
  },
  headerSubtext: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  toolbarContainer: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
  },
  richToolbar: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 0,
    paddingVertical: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  warningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submittedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  submittedBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pdfIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  viewText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  editor: {
    minHeight: 400,
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
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomInfoText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  exportText: {
    fontSize: 13,
    fontWeight: '800',
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
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  deadlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deadlineValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  editDateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editDateText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
