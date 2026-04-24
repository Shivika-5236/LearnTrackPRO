import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Dimensions, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

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

export default function NoteDetailsScreen() {
  const { courseId, noteId } = useLocalSearchParams();
  const router = useRouter();
  const { courses, deleteNote, updateNote } = useCourses();
  const { isDark } = useTheme();
  const richText = useRef<RichEditor>(null);

  const course = courses.find(c => c.id === courseId);
  const note = course?.notes.find(n => n.id === noteId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note?.heading || '');
  const [editedContent, setEditedContent] = useState(note?.content || '');

  // PDF Viewer state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [viewingPdfUri, setViewingPdfUri] = useState<string | null>(null);

  useEffect(() => {
    if (note && !isEditing) {
      setEditedTitle(note.heading);
      setEditedContent(note.content);
    }
  }, [noteId, note?.heading, note?.content]);

  const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
  const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
  const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
  const borderColor = isDark ? '#273548' : '#C5D9EE';
  const accentColor = isDark ? '#7C6AF7' : '#2E6DA4';
  const destructiveColor = isDark ? '#E8627A' : '#D0524A';

  if (!course || !note) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.container}>
          <Text style={{ color: textColor }}>Note not found</Text>
          <TouchableOpacity onPress={() => router.back()}><Text style={{ color: accentColor }}>Go Back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteNote(courseId as string, noteId as string); router.back(); } }
    ]);
  };

  const handleEdit = async () => {
    if (isEditing) {
      const content = await richText.current?.getContentHtml();
      updateNote(courseId as string, noteId as string, { heading: editedTitle, content: content || editedContent });
      setEditedContent(content || editedContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleImportPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled) {
        updateNote(courseId as string, noteId as string, { pdfUrl: result.assets[0].uri });
        Alert.alert('Success', 'PDF linked to note');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleViewPdf = async () => {
    if (note.pdfUrl) {
      setViewingPdfUri(note.pdfUrl);
      setShowPdfModal(true);
    }
  };

  const handleDeletePdf = () => {
    Alert.alert('Delete PDF', 'Are you sure you want to remove this PDF?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateNote(courseId as string, note.id, { pdfUrl: undefined }) }
    ]);
  };

  const handleExportPdf = async () => {
    try {
      const content = isEditing ? await richText.current?.getContentHtml() : editedContent;
      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; background: #0D1117; color: #E4E9F4;">
            <h1 style="color: #7C6AF7;">${editedTitle}</h1>
            <p style="color: #6A80A4; font-size: 14px;">${course.title}</p>
            <hr style="border: 0.5px solid #273548; margin: 20px 0;"/>
            <div style="font-size: 16px; line-height: 1.6;">
              ${content}
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          {isEditing ? (
             <TextInput
               style={[styles.headerTitleInput, { color: textColor }]}
               value={editedTitle}
               onChangeText={setEditedTitle}
               placeholder="Title..."
               placeholderTextColor={subtextColor}
             />
          ) : (
            <Text style={[styles.headerTitle, { color: textColor }]}>{note.heading}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleEdit} style={[styles.actionIcon, { backgroundColor: isEditing ? (isDark ? '#064E3B' : '#ECFDF5') : (isDark ? '#1E2B3C' : '#F1F5F9') }]}>
            <Ionicons name={isEditing ? "checkmark" : "pencil-outline"} size={20} color={isEditing ? '#3ECFA8' : subtextColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.actionIcon, { backgroundColor: isDark ? '#2C1D2A' : '#FFF1F2' }]}>
            <Ionicons name="trash-outline" size={20} color={destructiveColor} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ 
        flexDirection: 'column',
        gap: 8,
        marginHorizontal: 16, 
        marginTop: 12, 
      }}>
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
          style={{ backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9', borderRadius: 16, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, paddingVertical: 6 }}
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
          style={{ backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9', borderRadius: 16, borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingVertical: 6 }}
          flatContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <View style={styles.subheader}>
        <Text style={[styles.subheaderText, { color: subtextColor }]}>
          <Text style={{ color: accentColor, fontWeight: '700' }}>{course.title}</Text> • Apr 22, 2026
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* PDF CHIP */}
          {note.pdfUrl && (
            <View style={[styles.pdfChip, { backgroundColor: isDark ? '#161D2A' : '#F8FAFC', borderColor: isDark ? '#273548' : '#C5D9EE' }]}>
              <View style={[styles.pdfIconContainer, { backgroundColor: isDark ? '#451A1A' : '#FEF2F2' }]}>
                <Ionicons name="document-outline" size={24} color={destructiveColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pdfName, { color: textColor }]} numberOfLines={1}>
                  {note.pdfUrl.split('/').pop()}
                </Text>
                <Text style={{ color: subtextColor, fontSize: 12 }}>Secure PDF Attachment</Text>
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

          <RichEditor
            ref={richText}
            initialContentHTML={editedContent}
            disabled={!isEditing}
            editorStyle={{
              backgroundColor: backgroundColor,
              color: textColor,
              placeholderColor: subtextColor,
              contentCSSText: 'font-size: 17px; line-height: 1.6;',
            }}
            style={{ minHeight: 400 }}
            placeholder="Start writing..."
            onChange={setEditedContent}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
        <View style={styles.footerLeft}>
          <Ionicons name="document-text-outline" size={20} color={subtextColor} />
          <Text style={[styles.footerText, { color: subtextColor }]}>{editedContent.replace(/<[^>]*>?/gm, '').length} chars</Text>
        </View>
        <View style={styles.footerRight}>
          <TouchableOpacity style={styles.footerActionButton} onPress={handleImportPdf}>
            <Ionicons name="download-outline" size={20} color={subtextColor} />
            <Text style={[styles.footerText, { color: subtextColor }]}>Import PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerActionButton} onPress={handleExportPdf}>
            <Ionicons name="share-outline" size={20} color={subtextColor} />
            <Text style={[styles.footerText, { color: subtextColor }]}>Export PDF</Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.modalTitle} numberOfLines={1}>Note Document</Text>
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
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },
  headerTitleInput: {
    fontSize: 22,
    fontWeight: '800',
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
  subheader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  subheaderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  pdfChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#C5D9EE',
  },
  pdfIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
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
