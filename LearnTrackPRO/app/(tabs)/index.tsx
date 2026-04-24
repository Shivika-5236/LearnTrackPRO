import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSidebar } from '@/components/sidebar-context';
import { useTasks } from '@/context/TaskContext';
import { useCourses } from '@/context/CourseContext';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { openSidebar } = useSidebar();
  const { tasks } = useTasks();
  const { courses } = useCourses();
  const { recentSessions, upcomingBlocks } = useStudy();
  const { isDark, textColor, subtextColor, backgroundColor, cardBackground, borderColor, inputBackground } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const accentColor = isDark ? '#7C6AF7' : '#2E6DA4';
  const heroBackground = isDark ? '#1E2B3C' : '#E2E8F0';


  // Calculate real-time stats
  const activeCourses = courses.length;
  const totalAssignments = courses.reduce((sum, c) => sum + c.assignments.length, 0);
  const upcomingTasks = tasks.filter(t => t.status === 'Not started' || t.status === 'Doing');
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalStudyHours = recentSessions.reduce((sum, s) => {
    const match = s.duration.match(/(\d+)h\s*(\d+)m?/);
    if (match) {
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      return sum + hours + minutes / 60;
    }
    const minMatch = s.duration.match(/(\d+)m/);
    if (minMatch) {
      return sum + parseInt(minMatch[1]) / 60;
    }
    return sum;
  }, 0);
  const studyHoursText = `${Math.floor(totalStudyHours)}h ${Math.round((totalStudyHours % 1) * 60)}m`;

  const quickStats = [
    { id: 'qs1', label: 'Active', value: activeCourses.toString(), detail: `${courses.filter(c => c.progress < 100).length} in progress`, color: '#7C6AF7', icon: 'book' },
    { id: 'qs2', label: 'Assignments', value: totalAssignments.toString(), detail: `${upcomingTasks.length} due soon`, color: '#F5A23A', icon: 'document-text' },
    { id: 'qs3', label: 'Study hrs', value: studyHoursText, detail: 'This week', color: '#3ECFA8', icon: 'time' },
  ];

  // Get upcoming tasks
  const upcoming = useMemo(() => {
    return upcomingTasks
      .filter(t => t.deadline)
      .slice(0, 2)
      .map(t => ({
        id: t.id,
        title: t.title,
        course: 'Task',
        due: t.deadline || '',
        urgency: t.priority === 'High' ? 'High' : t.priority === 'Medium' ? 'Medium' : 'Low' as 'High' | 'Medium' | 'Low',
      }));
  }, [upcomingTasks]);

  // Get focus areas from upcoming blocks
  const focusAreas = useMemo(() => {
    return upcomingBlocks.slice(0, 3).map((block, index) => ({
      id: block.id,
      title: block.title,
      detail: block.details || `${block.duration} min`,
      color: index === 0 ? '#FFE8D9' : index === 1 ? '#E0ECFF' : '#EAF8F1',
      icon: index === 0 ? 'color-palette' : index === 1 ? 'code-slash' : 'layers' as any,
    }));
  }, [upcomingBlocks]);

  // Calculate insights
  const mostDemandingCourse = useMemo(() => {
    if (courses.length === 0) return { name: 'N/A', percentage: 0 };
    const totalAssignments = courses.reduce((sum, c) => sum + c.assignments.length, 0);
    if (totalAssignments === 0) return { name: courses[0]?.title || 'N/A', percentage: 0 };
    const courseWithMost = courses.reduce((max, c) =>
      c.assignments.length > max.assignments.length ? c : max
      , courses[0]);
    const percentage = Math.round((courseWithMost.assignments.length / totalAssignments) * 100);
    return { name: courseWithMost.title, percentage };
  }, [courses]);

  const insightRows = [
    { id: 'i1', label: 'Most demanding course', value: mostDemandingCourse.name, caption: `${mostDemandingCourse.percentage}% of assignments` },
    { id: 'i2', label: 'Upcoming focus blocks', value: `${upcomingBlocks.length}`, caption: 'Scheduled sessions' },
    { id: 'i3', label: 'Recent study sessions', value: `${recentSessions.length}`, caption: 'This week' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }]}>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: subtextColor }]}>Your learning overview</Text>
        </View>
        <TouchableOpacity onPress={openSidebar} style={[styles.menuButton, { backgroundColor: cardBackground }]}>
          <Ionicons name="menu-outline" size={28} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Featured Hero Card */}
        <View style={[styles.hero, { backgroundColor: heroBackground }]}>
          <View style={styles.heroContent}>
            <Text style={[styles.heroBrand, { color: textColor }]}>LearnTrackPRO</Text>
            <Text style={[styles.heroSubtitle, { color: subtextColor }]}>You are on track ! Keep up the momentum .</Text>

            {/* Streak Pills */}
            <View style={styles.streakContainer}>
              <View style={[styles.streakPill, { backgroundColor: isDark ? '#334155' : '#94A3B8' }]}>
                <View style={styles.streakIconWrapper}>
                  <Ionicons name="flame" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.streakLabelText}>Current</Text>
                  <Text style={styles.streakValueText}>{user?.streak || 0} days</Text>
                </View>
              </View>
              <View style={[styles.streakPill, { backgroundColor: isDark ? '#334155' : '#94A3B8' }]}>
                <View style={styles.streakIconWrapper}>
                  <Ionicons name="trophy" size={18} color="#FACC15" />
                </View>
                <View>
                  <Text style={styles.streakLabelText}>Longest</Text>
                  <Text style={styles.streakValueText}>{user?.longestStreak || 0} days</Text>
                </View>
              </View>
            </View>

            {/* Stats Grid 2x2 */}
            <View style={styles.statsGrid}>
              <View style={styles.statsGridRow}>
                <View style={styles.statsGridItem}>
                  <Text style={[styles.statsValue, { color: textColor }]}>{activeCourses}</Text>
                  <Text style={[styles.statsLabel, { color: subtextColor }]}>Active{"\n"}courses</Text>
                </View>
                <View style={[styles.statsGridDivider, { backgroundColor: subtextColor }]} />
                <View style={styles.statsGridItem}>
                  <Text style={[styles.statsValue, { color: textColor }]}>{upcomingTasks.length}</Text>
                  <Text style={[styles.statsLabel, { color: subtextColor }]}>Upcoming{"\n"}deadline</Text>
                </View>
              </View>
              <View style={[styles.statsRowDivider, { backgroundColor: subtextColor }]} />
              <View style={styles.statsGridRow}>
                <View style={styles.statsGridItem}>
                  <Text style={[styles.statsValue, { color: textColor }]}>{Math.floor(totalStudyHours)}</Text>
                  <Text style={[styles.statsLabel, { color: subtextColor }]}>Hours{"\n"}studied</Text>
                </View>
                <View style={[styles.statsGridDivider, { backgroundColor: subtextColor }]} />
                <View style={styles.statsGridItem}>
                  <Text style={[styles.statsValue, { color: textColor }]}>{completedTasks}</Text>
                  <Text style={[styles.statsLabel, { color: subtextColor }]}>Tasks{"\n"}completed</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Task Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Task</Text>
          <TouchableOpacity onPress={() => router.push('/tasks')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardList}>
          {upcomingTasks.slice(0, 3).map((task) => {
            const priorityColor = task.priority === 'High' ? '#E8627A' : task.priority === 'Medium' ? '#F5A23A' : '#F5C842';
            return (
              <View key={task.id} style={[styles.premiumCard, { backgroundColor: isDark ? '#161D2A' : '#FFFFFF' }]}>
                <View style={[styles.accentBar, { backgroundColor: priorityColor }]} />
                <View style={styles.cardContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardMainTitle, { color: textColor }]}>{task.title}</Text>
                    <Text style={[styles.cardSubtitle, { color: subtextColor }]}>Deadline: {task.deadline || 'No deadline'}</Text>
                  </View>
                  <Text style={[styles.cardSideText, { color: priorityColor }]}>{task.priority}</Text>
                </View>
              </View>
            );
          })}
          {upcomingTasks.length === 0 && (
            <Text style={{ color: subtextColor, textAlign: 'center', marginTop: 8 }}>No upcoming tasks</Text>
          )}
        </View>

        {/* Study Session Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Study sessions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/study')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardList}>
          {upcomingBlocks.slice(0, 3).map((block) => (
            <View key={block.id} style={[styles.premiumCard, { backgroundColor: isDark ? '#161D2A' : '#FFFFFF' }]}>
              <View style={[styles.accentBar, { backgroundColor: '#7C6AF7' }]} />
              <View style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardMainTitle, { color: textColor }]}>{block.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: subtextColor }]}>{block.day}, {block.time}</Text>
                </View>
                <Text style={[styles.cardSideText, { color: '#3ECFA8' }]}>{block.duration} hr</Text>
              </View>
            </View>
          ))}
          {upcomingBlocks.length === 0 && (
            <Text style={{ color: subtextColor, textAlign: 'center', marginTop: 8 }}>No scheduled sessions</Text>
          )}
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
  headerLeft: {
    gap: 4,
  },
  headerDate: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    elevation: 2,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  streakBanner: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  streakContent: {
    flex: 1,
  },
  streakText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 2,
  },
  streakSub: {
    fontSize: 13,
    fontWeight: '500',
  },
  hero: {
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    elevation: 4,
  },
  heroContent: {
    gap: 8,
  },
  heroBrand: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  streakPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 10,
  },
  streakIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#263341',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakLabelText: {
    color: '#FFFFFF80',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  streakValueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statsGrid: {
    width: '100%',
  },
  statsGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statsGridItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsLabel: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  statsGridDivider: {
    width: 1,
    height: 24,
    opacity: 0.2,
  },
  statsRowDivider: {
    height: 1,
    width: '100%',
    opacity: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#5B6BFA',
    fontWeight: '600',
  },
  cardList: {
    gap: 12,
    marginBottom: 16,
  },
  premiumCard: {
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
  },
  accentBar: {
    width: 4,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 12,
  },
  cardMainTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  cardSideText: {
    fontSize: 14,
    fontWeight: '700',
  },
});


