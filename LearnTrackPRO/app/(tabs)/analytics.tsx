import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '@/components/sidebar-context';
import { useTasks } from '@/context/TaskContext';
import { useCourses } from '@/context/CourseContext';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export default function AnalyticsScreen() {
  const { openSidebar } = useSidebar();
  const { tasks } = useTasks();
  const { courses } = useCourses();
  const { recentSessions } = useStudy();
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState('90d');

  // Helper to parse duration string "1h 30m" to minutes
  const parseDuration = (duration: string) => {
    if (!duration) return 0;
    const hMatch = duration.match(/(\d+)h/);
    const mMatch = duration.match(/(\d+)m/);
    return (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // --- Study Hours ---
    const thisWeekSessions = recentSessions.filter(s => new Date(s.date) >= oneWeekAgo);
    const lastWeekSessions = recentSessions.filter(s => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < oneWeekAgo);

    const thisWeekMins = thisWeekSessions.reduce((sum, s) => sum + parseDuration(s.duration), 0);
    const lastWeekMins = lastWeekSessions.reduce((sum, s) => sum + parseDuration(s.duration), 0);
    const studyHoursTrendMins = thisWeekMins - lastWeekMins;

    const totalMins = thisWeekMins;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    // --- Avg Session ---
    const thisWeekAvgMins = thisWeekSessions.length > 0 ? Math.round(thisWeekMins / thisWeekSessions.length) : 0;
    const lastWeekAvgMins = lastWeekSessions.length > 0 ? Math.round(lastWeekMins / lastWeekSessions.length) : 0;
    const avgSessionTrend = thisWeekAvgMins - lastWeekAvgMins;

    const avgHours = Math.floor(thisWeekAvgMins / 60);
    const avgRemainingMins = thisWeekAvgMins % 60;

    // --- Task Completion ---
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const totalTasksCount = tasks.length;
    const completionRate = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

    // Task Trend
    const completedThisWeek = tasks.filter(t => t.status === 'Completed' && t.updatedAt && new Date(t.updatedAt) >= oneWeekAgo).length;
    const completedLastWeek = tasks.filter(t => t.status === 'Completed' && t.updatedAt && new Date(t.updatedAt) >= twoWeeksAgo && new Date(t.updatedAt) < oneWeekAgo).length;
    const taskTrend = completedThisWeek - completedLastWeek;

    // --- Streak ---
    const sessionDates = [...new Set(recentSessions.map(s => {
      const d = new Date(s.date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }))].sort((a, b) => b - a);

    let currentStreak = 0;
    let bestStreak = 0;

    if (sessionDates.length > 0) {
      // Current Streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      
      const latestSessionTime = sessionDates[0];
      const diffDays = (todayTime - latestSessionTime) / (1000 * 60 * 60 * 24);

      if (diffDays <= 1) {
        currentStreak = 1;
        for (let i = 0; i < sessionDates.length - 1; i++) {
          const diff = (sessionDates[i] - sessionDates[i+1]) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Best Streak
      let tempStreak = 1;
      bestStreak = 1;
      for (let i = 0; i < sessionDates.length - 1; i++) {
        const diff = (sessionDates[i] - sessionDates[i+1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);
    }

    return {
      studyHours: { 
        value: `${hours}h ${mins}m`, 
        sessions: thisWeekSessions.length, 
        trend: studyHoursTrendMins 
      },
      taskCompletion: { 
        rate: completionRate, 
        count: `${completedTasks.length}/${totalTasksCount}`, 
        trend: taskTrend 
      },
      avgSession: { 
        value: `${avgHours}h ${avgRemainingMins}m`, 
        trend: avgSessionTrend 
      },
      streak: { 
        current: currentStreak, 
        best: bestStreak 
      },
      taskBreakdown: { 
        completed: completedTasks.length, 
        inProgress: tasks.filter(t => t.status === 'Doing').length, 
        pending: tasks.filter(t => t.status === 'Not started').length, 
        total: totalTasksCount 
      }
    };
  }, [recentSessions, tasks]);


  // Colors based on requested palette K
  const colors = {
    bg:    '#0D1117',
    card:  '#161D2A',
    card2: '#1E2B3C',
    border: '#273548',
    acc:   '#7C6AF7',
    text:  '#E4E9F4',
    subtext: '#6A80A4',
    disabled: '#2C3D56',
    green: '#3ECFA8',
    yellow: '#F5C842',
    red:   '#E8627A',
    orange: '#F5A23A',
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={styles.topHeader}>
        <View style={{ width: 40 }} />
        <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={styles.heading}>Analytics</Text>
              <Text style={styles.subheading}>LearnTrack overview</Text>
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>This week</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionHeader}>OVERVIEW</Text>
        <View style={styles.overviewGrid}>
          {/* Study Hours Card */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Study hours</Text>
            <Text style={[styles.statValue, { color: colors.acc }]}>{stats.studyHours.value}</Text>
            <Text style={styles.statSubtext}>{stats.studyHours.sessions} sessions logged</Text>
            <Text style={[styles.statTrend, { color: stats.studyHours.trend >= 0 ? colors.green : '#EF4444' }]}>
              {stats.studyHours.trend >= 0 ? '+' : '-'}{Math.floor(Math.abs(stats.studyHours.trend) / 60)}h vs last week
            </Text>
          </View>

          {/* Task Completion Card */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Task completion</Text>
            <Text style={[styles.statValue, { color: colors.green }]}>{stats.taskCompletion.rate}%</Text>
            <Text style={styles.statSubtext}>{stats.taskCompletion.count} completed</Text>
            <Text style={[styles.statTrend, { color: stats.taskCompletion.trend >= 0 ? colors.green : '#EF4444' }]}>
              {stats.taskCompletion.trend >= 0 ? '+' : ''}{stats.taskCompletion.trend} vs last week
            </Text>
          </View>

          {/* Avg Session Card */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg session</Text>
            <Text style={[styles.statValue, { color: colors.yellow }]}>{stats.avgSession.value}</Text>
            <Text style={styles.statSubtext}>per session</Text>
            <Text style={[styles.statTrend, { color: stats.avgSession.trend === 0 ? colors.subtext : stats.avgSession.trend > 0 ? colors.green : '#EF4444' }]}>
              {stats.avgSession.trend === 0 ? 'no change' : `${stats.avgSession.trend > 0 ? '+' : ''}${stats.avgSession.trend}m vs last week`}
            </Text>
          </View>

          {/* Current Streak Card */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Current streak</Text>
            <Text style={[styles.statValue, { color: colors.orange }]}>{stats.streak.current} days</Text>
            <Text style={styles.statSubtext}>best: {stats.streak.best} days</Text>
            <View style={styles.streakDots}>
              {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.streakDot, 
                    { backgroundColor: i < stats.streak.current ? colors.orange : '#2D333B' }
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>DAILY STUDY ACTIVITY</Text>
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Hours per day</Text>
            <View style={styles.timeRangeContainer}>
              {['7d', '30d', '90d'].map(range => (
                <TouchableOpacity 
                  key={range} 
                  style={[styles.rangeBtn, timeRange === range && styles.rangeBtnActive]}
                  onPress={() => setTimeRange(range)}
                >
                  <Text style={[styles.rangeBtnText, timeRange === range && styles.rangeBtnTextActive]}>{range}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.barChart}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              // Mon is 1, Tue is 2... Sun is 0 in JS Date.getDay()
              const dayIndex = (i + 1) % 7; 
              
              // Filter sessions for this specific day of the week
              const dayMins = recentSessions.filter(s => new Date(s.date).getDay() === dayIndex)
                .reduce((sum, s) => sum + parseDuration(s.duration), 0);

              const isActive = dayMins > 0;
              // Scale height based on duration, max height 40
              const barHeight = Math.min(40, Math.max(2, dayMins / 15));
              
              return (
                <View key={day} style={styles.barContainer}>
                  <View style={[styles.bar, { height: barHeight, backgroundColor: isActive ? colors.acc : '#2D333B' }]} />
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionHeader}>TASK BREAKDOWN</Text>
        <View style={styles.chartSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
            <View style={styles.donutContainer}>
              <View style={[styles.donut, { borderColor: colors.green, borderTopColor: colors.yellow, borderRightColor: colors.acc }]}>
                <Text style={styles.donutText}>{stats.taskCompletion.rate}%</Text>
                <Text style={styles.donutSubtext}>done</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 16 }}>
              <View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Completed</Text>
                  <Text style={[styles.progressValue, { color: colors.green }]}>{stats.taskBreakdown.completed}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${stats.taskBreakdown.total > 0 ? (stats.taskBreakdown.completed / stats.taskBreakdown.total) * 100 : 0}%`, backgroundColor: colors.green }]} />
                </View>
              </View>
              <View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>In progress</Text>
                  <Text style={[styles.progressValue, { color: colors.acc }]}>{stats.taskBreakdown.inProgress}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${stats.taskBreakdown.total > 0 ? (stats.taskBreakdown.inProgress / stats.taskBreakdown.total) * 100 : 0}%`, backgroundColor: colors.acc }]} />
                </View>
              </View>
              <View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Pending</Text>
                  <Text style={[styles.progressValue, { color: colors.yellow }]}>{stats.taskBreakdown.pending}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${stats.taskBreakdown.total > 0 ? (stats.taskBreakdown.pending / stats.taskBreakdown.total) * 100 : 0}%`, backgroundColor: colors.yellow }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>STUDY HEATMAP</Text>
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Last 12 weeks</Text>
          <View style={styles.heatmapGrid}>
            {Array.from({ length: 12 }).map((_, weekIndex) => (
              <View key={weekIndex} style={styles.heatmapColumn}>
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const daysAgo = (11 - weekIndex) * 7 + (6 - dayIndex);
                  const d = new Date();
                  d.setDate(d.getDate() - daysAgo);
                  d.setHours(0, 0, 0, 0);
                  const time = d.getTime();
                  
                  const dayActivityCount = recentSessions.filter(s => {
                    const sd = new Date(s.date);
                    sd.setHours(0, 0, 0, 0);
                    return sd.getTime() === time;
                  }).length + 
                  tasks.filter(t => {
                    const cd = t.createdAt ? new Date(t.createdAt) : null;
                    if (cd) cd.setHours(0, 0, 0, 0);
                    const ud = t.updatedAt ? new Date(t.updatedAt) : null;
                    if (ud) ud.setHours(0, 0, 0, 0);
                    
                    const isCreatedToday = cd?.getTime() === time;
                    const isCompletedToday = t.status === 'Completed' && ud?.getTime() === time;
                    
                    return isCreatedToday || isCompletedToday;
                  }).length;

                  let cellColor = '#161B22';
                  if (dayActivityCount >= 5) cellColor = colors.green;
                  else if (dayActivityCount >= 3) cellColor = colors.green + 'CC';
                  else if (dayActivityCount >= 2) cellColor = colors.green + '88';
                  else if (dayActivityCount >= 1) cellColor = colors.green + '44';

                  return (
                    <View 
                      key={dayIndex} 
                      style={[styles.heatmapCell, { backgroundColor: cellColor }]} 
                    />
                  );
                })}
              </View>
            ))}
          </View>
          <View style={styles.heatmapFooter}>
            <Text style={styles.heatmapFooterText}>Less</Text>
            <View style={[styles.heatmapCell, { backgroundColor: '#161B22', width: 14, height: 14 }]} />
            <View style={[styles.heatmapCell, { backgroundColor: colors.green + '44', width: 14, height: 14 }]} />
            <View style={[styles.heatmapCell, { backgroundColor: colors.green + '88', width: 14, height: 14 }]} />
            <View style={[styles.heatmapCell, { backgroundColor: colors.green + 'CC', width: 14, height: 14 }]} />
            <View style={[styles.heatmapCell, { backgroundColor: colors.green, width: 14, height: 14 }]} />
            <Text style={styles.heatmapFooterText}>More</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>COURSE PROGRESS</Text>
        <View style={styles.chartSection}>
          {courses.map((course, index) => (
            <View key={course.id} style={[styles.courseRow, index !== courses.length - 1 && styles.courseRowDivider]}>
              <View style={styles.courseHeader}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={[
                  styles.statusTag, 
                  { backgroundColor: course.progress === 100 ? '#10B98122' : course.progress > 0 ? '#38BDF822' : '#FBBF2422' }
                ]}>
                  <Text style={[
                    styles.statusTagText, 
                    { color: course.progress === 100 ? colors.green : course.progress > 0 ? colors.acc : colors.yellow }
                  ]}>
                    {course.progress === 100 ? 'Completed' : course.progress > 0 ? 'In progress' : 'Just started'}
                  </Text>
                </View>
              </View>
              <Text style={styles.courseModules}>
                {course.assignments?.length > 0 
                  ? `${course.assignments.filter(a => course.progress === 100).length} of ${course.assignments.length} assignments complete`
                  : `${course.progress}% of course content complete`
                }
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[
                  styles.progressBarFill, 
                  { 
                    width: `${course.progress}%`, 
                    backgroundColor: course.progress === 100 ? colors.green : course.progress > 0 ? colors.acc : colors.yellow 
                  }
                ]} />
              </View>
              <View style={styles.courseFooter}>
                <Text style={styles.courseFooterText}>{course.progress}% complete</Text>
                <Text style={styles.courseFooterText}>{course.progress === 100 ? 'Finished' : 'In progress'}</Text>
              </View>
            </View>
          ))}

          {courses.length === 0 && (
            <Text style={{ color: colors.subtext, textAlign: 'center', padding: 20 }}>No courses found.</Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subheading: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 2,
  },
  filterButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: '#161B22',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statTrend: {
    fontSize: 13,
    fontWeight: '600',
  },
  streakDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartSection: {
    backgroundColor: '#161B22',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1318',
    borderRadius: 8,
    padding: 3,
  },
  rangeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rangeBtnActive: {
    backgroundColor: '#1E293B',
  },
  rangeBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  rangeBtnTextActive: {
    color: '#FFFFFF',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 40,
  },
  barContainer: {
    alignItems: 'center',
    width: 40,
  },
  bar: {
    width: 32,
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donut: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  donutSubtext: {
    color: '#94A3B8',
    fontSize: 10,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  heatmapGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  heatmapColumn: {
    gap: 4,
  },
  heatmapCell: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  heatmapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 16,
  },
  heatmapFooterText: {
    color: '#64748B',
    fontSize: 12,
    marginRight: 4,
  },
  courseRow: {
    paddingVertical: 16,
  },
  courseRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  courseModules: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 12,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  courseFooterText: {
    color: '#64748B',
    fontSize: 12,
  },
});
