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

  const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';

  const renderFocusBlock = (block: any) => {
    const displayDate = block.date ? new Date(block.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : block.day;

    return (
      <TouchableOpacity
        key={block.id}
        style={[styles.focusBlock, { backgroundColor: block.color + '10', borderColor: block.color + '30' }]}
        onPress={() => router.push({ pathname: '/study/session', params: { blockId: block.id } } as any)}
      >
        <View style={styles.blockHeader}>
          <View style={[styles.blockIcon, { backgroundColor: block.color }]}>
            <Ionicons name="time" size={16} color="#FFFFFF" />
          </View>
        </View>
        <Text style={[styles.blockTitle, { color: textColor }]} numberOfLines={1}>{block.title}</Text>
        <Text style={[styles.blockTime, { color: subtextColor }]}>{displayDate} · {block.time}</Text>
        <Text style={[styles.blockDuration, { color: textColor }]}>{block.duration} min</Text>
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
            <TouchableOpacity onPress={() => router.push('/study/upcoming' as any)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {upcomingBlocks.slice(0, 4).map(renderFocusBlock)}
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
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]}
        onPress={() => router.push('/study/create-block' as any)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    paddingBottom: 80,
    gap: 24,
  },
  section: {
    gap: 16,
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  blockTime: {
    fontSize: 13,
  },
  blockDuration: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
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
});
