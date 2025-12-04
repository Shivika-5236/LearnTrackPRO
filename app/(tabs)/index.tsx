import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSidebar } from '@/components/sidebar-context';
import { useTasks } from '@/context/TaskContext';
import { useCourses } from '@/context/CourseContext';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { openSidebar } = useSidebar();
  const { tasks } = useTasks();
  const { courses } = useCourses();
  const { recentSessions, upcomingBlocks } = useStudy();
  const { isDark } = useTheme();
  const router = useRouter();

  const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const heroBackground = isDark ? '#1E293B' : '#0F172A';

  // Calculate real-time stats
  const activeCourses = courses.length;
  const totalAssignments = courses.reduce((sum, c) => sum + c.assignments.length, 0);
  const upcomingTasks = tasks.filter(t => t.status === 'Not started' || t.status === 'Doing');
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
    { id: 'qs1', label: 'Active', value: activeCourses.toString(), detail: `${courses.filter(c => c.progress < 100).length} in progress`, color: '#5B6BFA', icon: 'book' },
    { id: 'qs2', label: 'Assignments', value: totalAssignments.toString(), detail: `${upcomingTasks.length} due soon`, color: '#F97316', icon: 'document-text' },
    { id: 'qs3', label: 'Study hrs', value: studyHoursText, detail: 'This week', color: '#10B981', icon: 'time' },
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
        <View style={[styles.hero, { backgroundColor: heroBackground }]}>
          <View style={styles.heroContent}>
            <Text style={styles.kicker}>Overview</Text>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>LearnTrack Pro</Text>
            <Text style={[styles.subtitle, { color: '#CBD5F5' }]}>You're on track! Keep up the momentum.</Text>

            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroMetric}>{activeCourses}</Text>
                <Text style={styles.heroLabel}>Active Courses</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroMetric}>{totalAssignments}</Text>
                <Text style={styles.heroLabel}>Assignments</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroMetric}>{studyHoursText}</Text>
                <Text style={styles.heroLabel}>Study Time</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroPattern} />
        </View>

        {/* Courses Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>My Courses</Text>
            <TouchableOpacity onPress={() => router.push('/courses')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {courses.length > 0 ? (
            <View style={styles.cardList}>
              {courses.slice(0, 3).map((course) => (
                <View key={course.id} style={[styles.courseCard, { backgroundColor: cardBackground }]}>
                  <View style={styles.courseHeader}>
                    <Text style={[styles.courseTitle, { color: textColor }]} numberOfLines={1}>{course.title}</Text>
                    <View style={[styles.tag, { backgroundColor: course.tag === 'College' ? '#EFF6FF' : '#F0FDF4' }]}>
                      <Text style={[styles.tagText, { color: course.tag === 'College' ? '#3B82F6' : '#16A34A' }]}>{course.tag}</Text>
                    </View>
                  </View>
                  <Text style={[styles.courseInstructor, { color: subtextColor }]} numberOfLines={1}>{course.instructor}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: cardBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Text style={[styles.emptyText, { color: subtextColor }]}>No courses yet</Text>
            </View>
          )}
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Upcoming Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/tasks')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingTasks.length > 0 ? (
            <View style={styles.cardList}>
              {upcomingTasks.slice(0, 3).map((task) => (
                <View key={task.id} style={[styles.taskCard, { backgroundColor: cardBackground }]}>
                  <View style={styles.taskHeader}>
                    <Text style={[styles.taskTitle, { color: textColor }]} numberOfLines={1}>{task.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: task.priority === 'High' ? '#FEF2F2' : task.priority === 'Medium' ? '#FFF7ED' : '#F0FDF4' }]}>
                      <Text style={[styles.priorityText, { color: task.priority === 'High' ? '#EF4444' : task.priority === 'Medium' ? '#F97316' : '#10B981' }]}>
                        {task.priority}
                      </Text>
                    </View>
                  </View>
                  {task.details && <Text style={[styles.taskDetails, { color: subtextColor }]} numberOfLines={2}>{task.details}</Text>}
                  {task.deadline && (
                    <View style={styles.taskFooter}>
                      <Ionicons name="calendar-outline" size={14} color={subtextColor} />
                      <Text style={[styles.taskDeadline, { color: subtextColor }]}>{task.deadline}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: cardBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Text style={[styles.emptyText, { color: subtextColor }]}>No upcoming tasks</Text>
            </View>
          )}
        </View>

        {/* Study Sessions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Study Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/study/history')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentSessions.length > 0 ? (
            <View style={styles.cardList}>
              {recentSessions.slice(0, 3).map((session) => (
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
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: cardBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Text style={[styles.emptyText, { color: subtextColor }]}>No study sessions yet</Text>
            </View>
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
    color: '#64748B',
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
    paddingBottom: 40,
    gap: 24,
  },
  hero: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  heroContent: {
    zIndex: 1,
    gap: 8,
  },
  heroPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1E293B',
    opacity: 0.5,
  },
  kicker: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetric: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  horizontalList: {
    gap: 12,
    paddingRight: 20,
  },
  statCard: {
    width: 140,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statDetail: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  cardList: {
    gap: 12,
  },
  deadlineCard: {
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
  deadlineIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineBody: {
    flex: 1,
    gap: 4,
  },
  deadlineTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  deadlineCourse: {
    fontSize: 13,
  },
  deadlineMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  deadlineDue: {
    fontSize: 14,
    fontWeight: '600',
  },
  deadlineTime: {
    fontSize: 12,
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  focusCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 20,
    gap: 12,
    minHeight: 120,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  focusTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  focusDetail: {
    fontSize: 12,
    lineHeight: 16,
  },
  insightCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  insightRow: {
    gap: 8,
  },
  insightDivider: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  insightContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  insightValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  insightCaption: {
    fontSize: 12,
  },
  chartPlaceholder: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    gap: 8,
  },
  chartBar: {
    width: 8,
    backgroundColor: '#5B6BFA',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  courseCard: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  courseInstructor: {
    fontSize: 14,
  },
  progressContainer: {
    gap: 6,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5B6BFA',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  taskCard: {
    padding: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  taskDetails: {
    fontSize: 14,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  taskDeadline: {
    fontSize: 13,
    fontWeight: '500',
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
  analyticsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsItem: {
    alignItems: 'center',
    gap: 8,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  analyticsLabel: {
    fontSize: 13,
  },
  seeAllText: {
    fontSize: 14,
    color: '#5B6BFA',
    fontWeight: '600',
  },
});

