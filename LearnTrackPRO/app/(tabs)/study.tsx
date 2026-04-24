import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '@/components/sidebar-context';
import { useStudy } from '@/context/StudyContext';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function StudyScreen() {
  const { openSidebar } = useSidebar();
  const { upcomingBlocks, recentSessions, deleteSession } = useStudy();
  const router = useRouter();
  const { isDark } = useTheme();

  const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
  const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
  const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
  const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
  const borderColor = isDark ? '#273548' : '#C5D9EE';
  const accentColor = '#2E6DA4';
  const dangerColor = '#E8627A';


  const renderFocusBlock = (block: any) => {
    return (
      <TouchableOpacity
        key={block.id}
        style={[
          styles.focusBlock,
          {
            backgroundColor: isDark ? '#1E293B' : '#EBF2FF',
            borderColor: isDark ? '#334155' : '#D1E0FF'
          }
        ]}
        onPress={() => router.push({ pathname: '/study/session', params: { blockId: block.id } } as any)}
      >
        <View style={styles.blockTopRow}>
          <Text style={[styles.blockMainTitle, { color: textColor }]} numberOfLines={1}>{block.title}</Text>
          <Ionicons name={(block.subjectIcon || "book-outline") as any} size={22} color={block.subjectColor || "#5B6AFF"} />
        </View>

        <View style={styles.blockContent}>
          <Text style={[styles.blockSubjectLabel, { color: subtextColor }]} numberOfLines={1}>
            {block.subjectLabel || (block.courseId && typeof block.courseId === 'object' ? block.courseId.title : 'General Study')}
          </Text>
          <Text style={[styles.blockDescription, { color: textColor }]} numberOfLines={2}>
            {block.details || 'No description'}
          </Text>
        </View>

        <View style={styles.blockFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color={textColor} />
            <Text style={[styles.footerText, { color: textColor }]}>{block.duration} mins</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={14} color={textColor} />
            <Text style={[styles.footerText, { color: textColor }]} numberOfLines={1}>
              {block.date}, {block.time}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }]}>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Study Logs</Text>
          <Text style={[styles.headerSubtitle, { color: subtextColor }]}>Track your focus time</Text>
        </View>
        <TouchableOpacity onPress={openSidebar} style={[styles.menuButton, { backgroundColor: cardBackground }]}>
          <Ionicons name="menu-outline" size={28} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Upcoming Focus Blocks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Upcoming Focus Blocks</Text>
            <TouchableOpacity onPress={() => router.push('/study/sessions' as any)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Summary Row */}
          <View style={styles.summaryRow}>
            <Text style={styles.sessionCount}>{upcomingBlocks.length} SESSIONS</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/study/create-block' as any)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {[...upcomingBlocks]
              .sort((a, b) => {
                const dateA = a.parsedDate ? new Date(a.parsedDate).getTime() : 0;
                const dateB = b.parsedDate ? new Date(b.parsedDate).getTime() : 0;
                return dateA - dateB;
              })
              .slice(0, 4)
              .map(renderFocusBlock)}
          </View>
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/study/history' as any)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.list}>
            {recentSessions.slice(0, 3).map(session => (
              <View key={session.id} style={[styles.sessionCard, { backgroundColor: cardBackground }]}>
                <View style={[styles.sessionIcon, { backgroundColor: session.color }]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionCourse, { color: textColor }]} numberOfLines={1}>{session.course}</Text>
                  <Text style={[styles.sessionFocus, { color: subtextColor }]} numberOfLines={1}>{session.focus}</Text>
                </View>
                <View style={styles.sessionMeta}>
                  <Text style={[styles.sessionDuration, { color: textColor }]}>{session.duration}</Text>
                  <Text style={[styles.sessionTime, { color: subtextColor }]}>{session.loggedAt}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    Alert.alert('Delete Session', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(session.id) }
                    ]);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color={dangerColor} />

                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
    gap: 48,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    color: '#5B6BFA',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  focusBlock: {
    width: (width - 52) / 2,
    aspectRatio: 1.3,
    padding: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    justifyContent: 'space-between',
  },
  blockTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  blockMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  blockContent: {
    marginVertical: 4,
  },
  blockSubjectLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  blockDescription: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  blockFooter: {
    gap: 4,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeBlock: {
    borderWidth: 2,
  },
  list: {
    gap: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteButton: {
    padding: 8,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: 4,
  },
  sessionCourse: {
    fontSize: 15,
    fontWeight: '600',
  },
  sessionFocus: {
    fontSize: 13,
  },
  sessionMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '700',
  },
  sessionTime: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  addButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
