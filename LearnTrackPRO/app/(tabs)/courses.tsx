import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Image, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '@/components/sidebar-context';
import { useCourses, CourseTag } from '@/context/CourseContext';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function CoursesScreen() {
  const { openSidebar } = useSidebar();
  const { courses } = useCourses();
  const router = useRouter();
  const { isDark } = useTheme();

  const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
  const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
  const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
  const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
  const borderColor = isDark ? '#273548' : '#C5D9EE';
  const accentColor = isDark ? '#7C6AF7' : '#2E6DA4';


  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter1, setActiveFilter1] = useState('All');
  const [activeFilter3, setActiveFilter3] = useState('None');
  const [activeDropdown, setActiveDropdown] = useState<1 | 3 | null>(null);

  const FILTER_1_OPTIONS = ['All', 'College', 'Online Course', 'Personal Learning', 'Certification'];
  const FILTER_3_OPTIONS = ['None', 'Short (<10 hrs)', 'Medium (10–40 hrs)', 'Long (40+ hrs)'];

  const getDropdownOptions = () => {
    if (activeDropdown === 1) return FILTER_1_OPTIONS;
    if (activeDropdown === 3) return FILTER_3_OPTIONS;
    return [];
  };

  const getActiveFilterValue = () => {
    if (activeDropdown === 1) return activeFilter1;
    if (activeDropdown === 3) return activeFilter3;
    return '';
  };

  const handleSelectOption = (option: string) => {
    if (activeDropdown === 1) setActiveFilter1(option);
    if (activeDropdown === 3) setActiveFilter3(option === activeFilter3 ? 'None' : option);
    setActiveDropdown(null);
  };

  const filteredCourses = (courses || []).filter(course => {
    if (!course) return false;
    
    const matchesSearch = (course.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Support both 'Self' and 'Personal Learning' as equivalent tags
    const normalizedCourseTag = course.tag === 'Self' ? 'Personal Learning' : course.tag;
    const matchesFilter1 = activeFilter1 === 'All' || normalizedCourseTag === activeFilter1;
    
    // Duration Filter (Hours) - Only filter if a range is actually selected
    let matchesFilter3 = true;
    if (activeFilter3 && activeFilter3 !== 'None') {
      const hours = Number(course.totalHours) || Number(course.durationValue) || 0;
      if (activeFilter3 === 'Short (<10 hrs)') {
        matchesFilter3 = hours < 10;
      } else if (activeFilter3 === 'Medium (10–40 hrs)') {
        matchesFilter3 = hours >= 10 && hours <= 40;
      } else if (activeFilter3 === 'Long (40+ hrs)') {
        matchesFilter3 = hours > 40;
      }
    }

    return matchesSearch && matchesFilter1 && matchesFilter3;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }]}>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Courses</Text>
          <Text style={[styles.headerSubtitle, { color: subtextColor }]}>Continue learning</Text>
        </View>
        <TouchableOpacity onPress={openSidebar} style={[styles.menuButton, { backgroundColor: cardBackground }]}>
          <Ionicons name="menu-outline" size={28} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: cardBackground }]}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search courses..."
            placeholderTextColor={subtextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.dropdownButton, { backgroundColor: cardBackground }]}
            onPress={() => setActiveDropdown(activeDropdown === 1 ? null : 1)}
          >
            <Text style={[styles.dropdownText, { color: textColor }]} numberOfLines={1}>{activeFilter1}</Text>
            <Ionicons name={activeDropdown === 1 ? "chevron-up" : "chevron-down"} size={14} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dropdownButton, { backgroundColor: cardBackground }]}
            onPress={() => setActiveDropdown(activeDropdown === 3 ? null : 3)}
          >
            <Text style={[styles.dropdownText, { color: textColor }]} numberOfLines={1}>{activeFilter3 || ''}</Text>
            <Ionicons name={activeDropdown === 3 ? "chevron-up" : "chevron-down"} size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {activeDropdown === 1 && (
          <View style={[styles.categoryContainer, { left: 20, backgroundColor: cardBackground, borderColor: isDark ? '#273548' : '#C5D9EE' }]}>
            {FILTER_1_OPTIONS.map((option, index) => {
              const isActive = activeFilter1 === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.categoryItem,
                    isActive && { backgroundColor: isDark ? '#1E293B' : '#F0F4FF' },
                    index < FILTER_1_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#273548' : '#E2E8F0' }
                  ]}
                  onPress={() => {
                    setActiveFilter1(option);
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={[
                    styles.categoryItemText, 
                    { color: isActive ? '#7C6AF7' : textColor }
                  ]}>
                    {option}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={16} color="#7C6AF7" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeDropdown === 3 && (
          <View style={[styles.categoryContainer, { left: undefined, right: 20, backgroundColor: cardBackground, borderColor: isDark ? '#273548' : '#C5D9EE' }]}>
            {FILTER_3_OPTIONS.map((option, index) => {
              const isActive = activeFilter3 === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.categoryItem,
                    isActive && { backgroundColor: isDark ? '#1E293B' : '#F0F4FF' },
                    index < FILTER_3_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#273548' : '#E2E8F0' }
                  ]}
                  onPress={() => {
                    setActiveFilter3(option === activeFilter3 ? 'None' : option);
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={[
                    styles.categoryItemText, 
                    { color: isActive ? '#7C6AF7' : textColor }
                  ]}>
                    {option}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={16} color="#7C6AF7" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>



      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: subtextColor, textTransform: 'uppercase', letterSpacing: 1 }}>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'COURSE' : 'COURSES'}
          </Text>
          <TouchableOpacity 
            style={{ 
              backgroundColor: isDark ? '#1E293B' : '#0F172A',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => router.push('/courses/add')}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>



      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {filteredCourses.map(course => (
          <View
            key={course.id}
            style={[styles.courseCard, { backgroundColor: cardBackground, borderColor }]}
          >
            <TouchableOpacity 
              style={styles.courseMainContent}
              onPress={() => router.push({ pathname: '/courses/[courseId]', params: { courseId: course.id } })}
            >
              <View style={styles.courseHeaderRow}>
                <Text style={[styles.courseTitle, { color: textColor, flex: 1 }]} numberOfLines={1}>{course.title}</Text>
                <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                  <Text style={[styles.tagText, { color: '#7C6AF7' }]}>{course.tag === 'Personal Learning' ? 'Self' : course.tag}</Text>
                </View>
              </View>
              
              <Text style={[styles.courseSubInfo, { color: subtextColor }]}>
                Mentor: {course.instructor} • {(course.durationValue || course.totalHours || 0)} {(course.durationUnit || 'hr')} • {course.credits} Credits
              </Text>

              <View style={styles.progressSection}>
                <View style={[styles.progressBar, { backgroundColor: isDark ? '#273548' : '#F1F5F9' }]}>
                  <View style={[styles.progressFill, { width: `${course.progress || 0}%`, backgroundColor: accentColor }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={[styles.progressLabel, { color: subtextColor }]}>Progress</Text>
                  <Text style={[styles.progressValue, { color: accentColor }]}>{course.progress || 0}% complete</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}
                onPress={() => router.push({ pathname: '/courses/[courseId]', params: { courseId: course.id, initialTab: 'Notes' } })}
              >
                <Ionicons name="document-text-outline" size={16} color={subtextColor} />
                <Text style={[styles.actionButtonText, { color: subtextColor }]}>Notes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}
                onPress={() => router.push({ pathname: '/courses/[courseId]', params: { courseId: course.id, initialTab: 'Project' } })}
              >
                <Ionicons name="git-branch-outline" size={16} color={subtextColor} />
                <Text style={[styles.actionButtonText, { color: subtextColor }]}>Project</Text>
              </TouchableOpacity>
 
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}
                onPress={() => router.push({ pathname: '/courses/[courseId]', params: { courseId: course.id, initialTab: 'Assignment' } })}
              >
                <Ionicons name="pencil-outline" size={16} color={subtextColor} />
                <Text style={[styles.actionButtonText, { color: subtextColor }]} numberOfLines={1}>Assignment</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
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
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  filters: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#F0F4FF',
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  dropdownItemTextActive: {
    color: '#7C6AF7',
    fontWeight: '600',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 20,
  },
  courseCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseMainContent: {
    padding: 12,
    gap: 8,
  },
  courseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  courseSubInfo: {
    fontSize: 13,
    opacity: 0.8,
  },
  progressSection: {
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    paddingHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryContainer: {
    position: 'absolute',
    top: 52,
    left: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: (width - 48) / 2,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  categoryItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
