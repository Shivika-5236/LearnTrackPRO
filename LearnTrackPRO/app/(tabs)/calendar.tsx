import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '@/components/sidebar-context';
import { useTheme } from '@/context/ThemeContext';
import { useTasks } from '@/context/TaskContext';
import { useStudy } from '@/context/StudyContext';
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/context/CourseContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { generateICS } from '@/utils/icsGenerator';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const { openSidebar } = useSidebar();
  const { isDark } = useTheme();
  const { tasks } = useTasks();
  const { recentSessions } = useStudy();
  const { courses } = useCourses();
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
  const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
  const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
  const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
  const eventPillBackground = isDark ? '#1E2B3C' : '#EAF2FA';
  const borderColor = isDark ? '#273548' : '#C5D9EE';


  // Constants
  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleExport = async () => {
    try {
      const icsString = generateICS(tasks, recentSessions);
      console.log('Exporting ICS, length:', icsString.length);

      if (tasks.length === 0 && recentSessions.length === 0) {
        Alert.alert('Empty Data', 'You need to have tasks with deadlines or study sessions to export a calendar.');
        return;
      }

      const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + 'LearnTrackPRO_Calendar.ics';
      
      await FileSystem.writeAsStringAsync(fileUri, icsString);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/calendar',
          dialogTitle: 'Export your schedule',
          UTI: 'public.calendar-event',
        });
      } else {
        Alert.alert('Sharing Unavailable', 'This device does not support file sharing.');
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      Alert.alert('Export Error', `Could not export calendar: ${error?.message || 'Unknown error'}`);
    }
  };

  const calendarMatrix = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const prevMonthLastDate = new Date(year, month, 0).getDate();

    const matrix = [];
    let week = [];

    // Prev month days
    for (let i = 0; i < firstDay; i++) {
        week.push({ d: (prevMonthLastDate - firstDay + i + 1).toString(), prev: true });
    }

    const allAssignments = courses.flatMap(c => c.assignments || []);
    const allProjects = courses.flatMap(c => c.projects || []);

    // Current month days
    for (let d = 1; d <= lastDate; d++) {
        if (week.length === 7) {
            matrix.push(week);
            week = [];
        }
        
        const isSameDay = (dateStr: string | undefined, day: number, month: number, year: number) => {
            if (!dateStr) return false;
            const dObj = new Date(dateStr);
            return dObj.getDate() === day && dObj.getMonth() === month && dObj.getFullYear() === year;
        };

        const hasTask = tasks.some(t => isSameDay(t.completedAt, d, month, year));
        const hasSession = recentSessions.some(s => isSameDay(s.date, d, month, year));
        const hasAssignment = allAssignments.some(a => isSameDay(a.completedAt, d, month, year));
        const hasProject = allProjects.some(p => isSameDay(p.completedAt, d, month, year));

        week.push({ 
            d: d.toString(), 
            current: true, 
            active: selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year,
            flame: hasTask || hasSession || hasAssignment || hasProject
        });
    }

    // Next month days
    let nextDay = 1;
    while (week.length < 7) {
        week.push({ d: (nextDay++).toString(), next: true });
    }
    matrix.push(week);

    return matrix;
  }, [currentDate, selectedDate, tasks, recentSessions]);

  const selectedDayEvents = useMemo(() => {
    const isSameDay = (dateStr: string | undefined, date: Date) => {
        if (!dateStr) return false;
        const dObj = new Date(dateStr);
        return dObj.getDate() === date.getDate() && 
               dObj.getMonth() === date.getMonth() && 
               dObj.getFullYear() === date.getFullYear();
    };

    const dayTasks = tasks.filter(t => isSameDay(t.parsedDeadline, selectedDate))
        .map(t => ({ ...t, type: 'Task' as const, color: '#EF4444' }));

    const daySessions = recentSessions.filter(s => isSameDay(s.date, selectedDate))
        .map(s => ({ ...s, type: 'Focus Block' as const, color: '#3B82F6' }));

    const allAssignments = courses.flatMap(c => c.assignments || []);
    const dayAssignments = allAssignments.filter(a => isSameDay(a.dueDate, selectedDate))
        .map(a => ({ ...a, type: 'Assignment' as const, color: '#8B5CF6' }));

    const allProjects = courses.flatMap(c => c.projects || []);
    const dayProjects = allProjects.filter(p => isSameDay(p.deadline, selectedDate))
        .map(p => ({ ...p, type: 'Project' as const, color: '#10B981' }));

    return [...dayTasks, ...daySessions, ...dayAssignments, ...dayProjects];
  }, [selectedDate, tasks, recentSessions, courses]);

  const changeMonth = (inc: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + inc, 1);
    setCurrentDate(newDate);
  };

  const renderCalendarGrid = () => {
    return (
      <View style={styles.calendarContainer}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={20} color={textColor} />
          </TouchableOpacity>
          <View style={styles.monthDropdowns}>
            <View style={[styles.dropdownContainer, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Text style={[styles.dropdownText, { color: textColor }]}>{MONTHS[currentDate.getMonth()]}</Text>
            </View>
            <TouchableOpacity 
                style={[styles.dropdownContainer, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => setShowYearPicker(true)}
            >
              <Text style={[styles.dropdownText, { color: textColor }]}>{currentDate.getFullYear()}</Text>
              <Ionicons name="chevron-down" size={12} color={subtextColor} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Days Header */}
        <View style={styles.daysHeaderRow}>
          {DAYS.map((day, i) => (
            <Text key={i} style={styles.dayHeaderText}>{day}</Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.gridContainer}>
          {calendarMatrix.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((cell, colIndex) => {
                const isInactive = cell.prev || cell.next;
                const activeStyle = cell.active ? { backgroundColor: isDark ? '#7C6AF7' : '#0F172A' } : {};
                const activeTextStyle = cell.active ? { color: '#FFFFFF', fontWeight: '700' } : {};
                return (
                  <TouchableOpacity 
                    key={colIndex} 
                    style={[styles.gridCell, activeStyle]}
                    onPress={() => {
                        if (cell.current) {
                            setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(cell.d)));
                        }
                    }}
                  >
                    <Text style={[
                      styles.cellText, 
                      { color: isInactive ? (isDark ? '#475569' : '#CBD5E1') : textColor },
                      activeTextStyle
                    ]}>
                      {cell.d}
                    </Text>
                    {cell.flame ? (
                      <Ionicons name="flame" size={12} color={cell.active ? "#F5A23A" : "#E8627A"} style={styles.flameIcon} />
                    ) : (
                      <View style={{ height: 12 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEvent = (event: any, index: number, isLast: boolean) => (
    <View style={styles.eventCardContainer} key={index}>
        <View style={[
            styles.eventPill, 
            { 
                backgroundColor: isDark ? '#1E293B' : cardBackground, 
                borderLeftColor: event.color, 
                borderLeftWidth: 4,
                borderColor: isDark ? '#334155' : 'transparent',
                borderWidth: isDark ? 1 : 0
            }
        ]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eventLabel, { color: event.color }]}>{event.type.toUpperCase()}</Text>
            <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={1}>
                {event.type === 'Task' ? event.title : (event.type === 'Focus Block' ? event.focus || event.course : event.title || event.name)}
            </Text>
            <View style={styles.eventTimeRow}>
              <Ionicons name="time-outline" size={16} color={subtextColor} />
              <Text style={[styles.eventTime, { color: subtextColor }]}>
                  {event.type === 'Task' ? (event.deadline?.split(' · ')[1] || 'All day') : (event.type === 'Focus Block' ? `${event.loggedAt} · ${event.duration}` : event.dueDate || event.deadline)}
              </Text>
            </View>
          </View>
          {event.type === 'Task' && (
            <View style={[styles.priorityBadge, { backgroundColor: isDark ? '#1E293B' : '#FEF2F2' }]}>
                <Text style={[styles.priorityBadgeText, { color: event.priority === 'High' ? '#E8627A' : event.priority === 'Medium' ? '#F5A23A' : '#F5C842' }]}>
                    {event.priority}
                </Text>
            </View>
          )}
        </View>
    </View>
  );;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }]}>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Calendar</Text>
          <Text style={[styles.headerSubtitle, { color: subtextColor }]}>View your schedule</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={handleExport} style={[styles.iconButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name="share-outline" size={22} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openSidebar} style={[styles.iconButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name="menu" size={22} color={textColor} />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {(() => {
            const today = new Date();
            const allAssignments = courses.flatMap(c => c.assignments || []);
            const allProjects = courses.flatMap(c => c.projects || []);
            
            const isSameDay = (dateStr: string | undefined, date: Date) => {
                if (!dateStr) return false;
                const dObj = new Date(dateStr);
                return dObj.getDate() === date.getDate() && 
                       dObj.getMonth() === date.getMonth() && 
                       dObj.getFullYear() === date.getFullYear();
            };

            const hasWorkToday = tasks.some(t => isSameDay(t.completedAt, today)) || 
                               recentSessions.some(s => isSameDay(s.date, today)) ||
                               allAssignments.some(a => isSameDay(a.completedAt, today)) ||
                               allProjects.some(p => isSameDay(p.completedAt, today));

            return (
                <View style={[styles.streakPill, { backgroundColor: cardBackground }]}>
                  <Text style={[styles.streakText, { color: textColor }]}>Day {user?.streak || 0}</Text>
                  <Ionicons name="flame" size={24} color={hasWorkToday ? "#F59E0B" : (isDark ? "#334155" : "#E2E8F0")} />
                </View>
            );
        })()}

        <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

        {renderCalendarGrid()}

        <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
              <Text style={[styles.eventsTitle, { color: textColor }]}>{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              <Text style={[styles.eventCount, { color: subtextColor }]}>{selectedDayEvents.length} events</Text>
          </View>
          
          <View style={styles.eventList}>
            {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event, idx) => renderEvent(event, idx, idx === selectedDayEvents.length - 1))
            ) : (
                <Text style={{ textAlign: 'center', color: subtextColor, marginTop: 24 }}>No events for this day.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Year Picker Modal */}
      <Modal
          visible={showYearPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearPicker(false)}
      >
          <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowYearPicker(false)}
          >
              <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
                  <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: textColor }]}>Select Year</Text>
                      <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                          <Ionicons name="close" size={24} color={subtextColor} />
                      </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.yearList} showsVerticalScrollIndicator={false}>
                      {Array.from({ length: 21 }, (_, i) => 2020 + i).map((year) => {
                          const isSelected = year === currentDate.getFullYear();
                          return (
                              <TouchableOpacity
                                  key={year}
                                  style={[
                                      styles.yearItem,
                                      isSelected && { backgroundColor: isDark ? '#334155' : '#F1F5F9' }
                                  ]}
                                  onPress={() => {
                                      const newDate = new Date(currentDate);
                                      newDate.setFullYear(year);
                                      setCurrentDate(newDate);
                                      setShowYearPicker(false);
                                  }}
                              >
                                  <Text style={[
                                      styles.yearItemText,
                                      { color: textColor },
                                      isSelected && { color: '#7C6AF7', fontWeight: '700' }
                                  ]}>
                                      {year}
                                  </Text>
                                  {isSelected && <Ionicons name="checkmark" size={20} color="#7C6AF7" />}
                              </TouchableOpacity>
                          );
                      })}
                  </ScrollView>
              </View>
          </TouchableOpacity>
      </Modal>
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
    fontWeight: '400',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 20,
  },
  streakPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: width,
    alignSelf: 'center',
    marginVertical: 4,
  },
  calendarContainer: {
    gap: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  monthDropdowns: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dayHeaderText: {
    width: 32,
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  gridContainer: {
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gridCell: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 4,
    gap: 0,
  },
  cellText: {
    fontSize: 14,
  },
  flameIcon: {
    marginTop: -2,
  },
  eventsSection: {
    gap: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 90,
  },
  taskDropdownText: {
    fontSize: 14,
  },
  eventList: {
    marginTop: 8,
    gap: 0,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 8,
  },
  timelineCol: {
    width: 24,
    alignItems: 'center',
    marginTop: 20, // Align 1. with the pill
  },
  timelineIndex: {
    fontSize: 16,
    fontWeight: '500',
  },
  timelineLine: {
    width: 1,
    flex: 1,
    marginTop: 8,
  },
  eventCardContainer: {
    flex: 1,
    marginLeft: 12,
  },
  eventTab: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginLeft: 16,
    // Add small shadow or margin so it looks like a tab if needed
  },
  eventTabText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  eventPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderTopLeftRadius: 4, // Makes the tab effect look real since it sprouts out here
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTime: {
    fontSize: 13,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
    priorityBadgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#EF4444',
    },
    eventsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventCount: {
        fontSize: 14,
        fontWeight: '500',
    },
    eventLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxHeight: '60%',
        borderRadius: 24,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    yearList: {
        marginBottom: 8,
    },
    yearItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    yearItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
