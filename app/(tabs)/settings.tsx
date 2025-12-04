import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/components/sidebar-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { openSidebar } = useSidebar();
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedCollege, setEditedCollege] = useState(user?.college || '');

  const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const handleSaveProfile = () => {
    updateProfile({
      name: editedName,
      email: editedEmail,
      college: editedCollege,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
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
              <Ionicons name={isEditing ? 'close' : 'create-outline'} size={20} color="#5B6BFA" />
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
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: subtextColor }]}>College/University</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor, color: textColor }]}
                  value={editedCollege}
                  onChangeText={setEditedCollege}
                  placeholderTextColor={subtextColor}
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileContainer}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={32} color="#5B6BFA" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: textColor }]}>{user?.name || 'Guest User'}</Text>
                <Text style={[styles.profileEmail, { color: subtextColor }]}>{user?.email || 't@example.com'}</Text>
                <View style={styles.profileDetailRow}>
                  <Ionicons name="school" size={16} color={subtextColor} />
                  <Text style={[styles.profileDetailText, { color: subtextColor }]}>{user?.college || 'University'}</Text>
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
              trackColor={{ false: '#E2E8F0', true: '#5B6BFA' }}
              thumbColor={isDark ? '#FFFFFF' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Account</Text>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: '#EF4444' }]}>Logout</Text>
              <Text style={[styles.rowSubtitle, { color: subtextColor }]}>Sign out from your account</Text>
            </View>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
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
});
