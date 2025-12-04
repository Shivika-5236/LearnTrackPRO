import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '@/components/sidebar-context';
import { useTasks } from '@/context/TaskContext';
import { useCourses } from '@/context/CourseContext';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';

export default function AnalyticsScreen() {
  const { openSidebar } = useSidebar();
  const { tasks } = useTasks();
  const { courses } = useCourses();
  const { recentSessions } = useStudy();
  const { isDark } = useTheme();

  // Calculate real-time study hours
  const totalStudyHours = useMemo(() => {
    return recentSessions.reduce((sum, s) => {
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
  }, [recentSessions]);

  const studyHoursText = `${Math.floor(totalStudyHours)}h ${Math.round((totalStudyHours % 1) * 60)}m`;

  // Calculate task statistics
  const taskStats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const doing = tasks.filter(t => t.status === 'Doing').length;
    const pending = tasks.filter(t => t.status === 'Not started').length;
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, doing, pending, total, completionRate };
  }, [tasks]);

  // Calculate course completion
  const courseStats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter(c => c.progress === 100).length;
    const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const avgProgress = total > 0 ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / total) : 0;
    return { total, completed, inProgress, avgProgress };
  }, [courses]);

  const trendCards = [
    {
      id: 'an1',
      title: 'Study hours',
      value: studyHoursText,
      change: `${recentSessions.length} sessions logged`,
      color: '#5B6BFA'
    },
    {
      id: 'an2',
      title: 'Task completion',
      value: `${taskStats.completionRate}%`,
      change: `${taskStats.completed}/${taskStats.total} completed`,
      color: '#10B981'
    },
  ];

  const chartLegend = [
    { id: 'cl1', label: 'Study hours', color: '#38BDF8' },
    { id: 'cl2', label: 'Tasks', color: '#F97316' },
  ];

  const backgroundColor = isDark ? '#0F172A' : '#F7F8FC';
  const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#6B7280';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.topHeader}>
        <View style={{ width: 40 }} />
        <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={textColor} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: textColor }]}>Analytics</Text>
          <Text style={[styles.subheading, { color: subtextColor }]}>Insights and trends powered by LearnTrack</Text>
        </View>

        <View style={styles.trendGrid}>
          {trendCards.map((card) => (
            <View key={card.id} style={[styles.trendCard, { borderColor: card.color + '44', backgroundColor: cardBackground }]}>
              <Text style={[styles.trendLabel, { color: subtextColor }]}>{card.title}</Text>
              <Text style={[styles.trendValue, { color: card.color }]}>{card.value}</Text>
              <Text style={[styles.trendChange, { color: subtextColor }]}>{card.change}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Highlights</Text>
          <View style={[styles.highlightsCard, { backgroundColor: cardBackground }]}>
            <Text style={[styles.highlightTitle, { color: textColor }]}>Study Sessions</Text>
            <Text style={[styles.highlightText, { color: subtextColor }]}>
              You've logged {recentSessions.length} study sessions with a total of {studyHoursText} of focused time.
            </Text>
            <Text style={[styles.highlightTitle, { color: textColor }]}>Task Progress</Text>
            <Text style={[styles.highlightText, { color: subtextColor }]}>
              {taskStats.completionRate}% of your tasks are completed. {taskStats.doing > 0 ? `${taskStats.doing} tasks in progress.` : 'All tasks are either completed or pending.'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Study Activity</Text>
          <View style={[styles.chartCard, { backgroundColor: isDark ? '#1E293B' : '#0B1221' }]}>
            <View style={styles.fakeLineChart}>
              {recentSessions.slice(0, 7).reverse().map((session, index) => {
                const match = session.duration.match(/(\d+)h\s*(\d+)m?/);
                let height = 30;
                if (match) {
                  const hours = parseInt(match[1]) || 0;
                  const minutes = parseInt(match[2]) || 0;
                  height = Math.min(80, (hours * 60 + minutes) / 2);
                } else {
                  const minMatch = session.duration.match(/(\d+)m/);
                  if (minMatch) {
                    height = Math.min(80, parseInt(minMatch[1]) / 2);
                  }
                }
                return <View key={session.id} style={[styles.fakeLineBar, { height: Math.max(20, height) }]} />;
              })}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
                <Text style={styles.legendLabel}>Study Sessions</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Task Statistics</Text>
          <View style={[styles.statsCard, { backgroundColor: cardBackground }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subtextColor }]}>Completed</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{taskStats.completed}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subtextColor }]}>In Progress</Text>
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>{taskStats.doing}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subtextColor }]}>Pending</Text>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{taskStats.pending}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Course Progress</Text>
          <View style={[styles.statsCard, { backgroundColor: cardBackground }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subtextColor }]}>Total Courses</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{courseStats.total}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subtextColor }]}>Completed</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{courseStats.completed}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subtextColor }]}>In Progress</Text>
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>{courseStats.inProgress}</Text>
            </View>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  menuButton: {
    padding: 8,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 36,
  },
  header: {
    gap: 4,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 14,
  },
  trendGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  trendCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
    minHeight: 110,
  },
  trendLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
  },
  trendValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  trendChange: {
    fontSize: 13,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartCard: {
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  fakeLineChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    height: 120,
  },
  fakeLineBar: {
    width: 20,
    borderRadius: 6,
    backgroundColor: '#38BDF8',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    color: '#E2E8F0',
    fontSize: 13,
  },
  highlightsCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 8,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  highlightText: {
    fontSize: 14,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  pieChartCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pieChartPercentage: {
    fontSize: 36,
    fontWeight: '700',
  },
  pieChartLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  pieLegend: {
    gap: 12,
    marginTop: 8,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pieLegendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  pieLegendText: {
    fontSize: 14,
  },
});


