import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/components/sidebar-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useTasks } from '@/context/TaskContext';
import { useStudy } from '@/context/StudyContext';
import { useCourses } from '@/context/CourseContext';
import { generateCSV, generateProgressReportHTML } from '@/utils/exportUtils';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { openSidebar } = useSidebar();
  const { user, logout, updateProfile } = useAuth();
  const { tasks } = useTasks();
  const { recentSessions } = useStudy();
  const { courses } = useCourses();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');

  const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
  const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
  const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
  const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
  const borderColor = isDark ? '#273548' : '#C5D9EE';
  const accentColor = '#2E6DA4';
  const dangerColor = '#E8627A';


  const handleSaveProfile = () => {
    updateProfile({
      name: editedName,
      email: editedEmail,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        logout();
        router.replace('/auth/login');
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
              logout();
              router.replace('/auth/login');
            },
          },
        ]
      );
    }
  };
  const handleCSVExport = async () => {
    try {
      const csvData = generateCSV(tasks, recentSessions);
      const fileName = `LearnTrack_Data_${new Date().getTime()}.csv`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csvData, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export CSV: ' + (error as Error).message);
    }
  };

  const handlePDFExport = async () => {
    try {
      const html = generateProgressReportHTML(user, tasks, recentSessions, courses);
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF: ' + (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: cardBackground }]}>
        <View style={{ width: 40 }} />
        <Text style={[styles.screenTitle, { color: textColor }]}>Settings</Text>
        <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Profile</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons name={isEditing ? 'close' : 'create-outline'} size={20} color={accentColor} />
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: subtextColor }]}>Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor, color: textColor }]}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholderTextColor={subtextColor}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: subtextColor }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor, color: textColor }]}
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={subtextColor}
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileContainer}>
              <View style={[styles.profileAvatar, { backgroundColor: isDark ? '#1E2B3C' : '#EEF2FF' }]}>
                <Ionicons name="person" size={32} color={accentColor} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: textColor }]}>{user?.name || 'Guest User'}</Text>
                <Text style={[styles.profileEmail, { color: subtextColor }]}>{user?.email || 't@example.com'}</Text>
                <View style={styles.profileDetailRow}>
                  <Ionicons name="flame" size={14} color="#F5A23A" />
                  <Text style={[styles.profileDetailText, { color: subtextColor }]}>Streak: {user?.streak || 0}</Text>
                  <Ionicons name="trophy" size={14} color="#F5C842" style={{ marginLeft: 8 }} />
                  <Text style={[styles.profileDetailText, { color: subtextColor }]}>Best: {user?.longestStreak || 0}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Preferences</Text>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: textColor }]}>Dark Mode</Text>
              <Text style={[styles.rowSubtitle, { color: subtextColor }]}>Toggle between light and dark themes</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E2E8F0', true: accentColor }}
              thumbColor={isDark ? '#FFFFFF' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Data Export Section */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Data Export</Text>
          <Text style={[styles.rowSubtitle, { color: subtextColor, marginBottom: 16 }]}>
            Save your study data for offline use or generate a professional progress report.
          </Text>
          
          <TouchableOpacity style={styles.exportRow} onPress={handleCSVExport}>
            <View style={[styles.exportIcon, { backgroundColor: isDark ? '#1E2B3C' : '#EEF2FF' }]}>
              <Ionicons name="document-text-outline" size={20} color={accentColor} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: textColor }]}>Export as CSV</Text>
              <Text style={[styles.rowSubtitle, { color: subtextColor }]}>Download raw task and session data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={subtextColor} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <TouchableOpacity style={styles.exportRow} onPress={handlePDFExport}>
            <View style={[styles.exportIcon, { backgroundColor: isDark ? '#1E2B3C' : '#FEE2E2' }]}>
              <Ionicons name="analytics" size={20} color={dangerColor} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: textColor }]}>Download PDF Report</Text>
              <Text style={[styles.rowSubtitle, { color: subtextColor }]}>Generate a premium progress summary</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={subtextColor} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Account</Text>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: dangerColor }]}>Logout</Text>
              <Text style={[styles.rowSubtitle, { color: subtextColor }]}>Sign out from your account</Text>
            </View>
            <Ionicons name="log-out-outline" size={24} color={dangerColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  menuButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#5B6BFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  profileDetailText: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 14,
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  exportIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
});
