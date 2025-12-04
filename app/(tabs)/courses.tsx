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

  const backgroundColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBackground = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | CourseTag>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || course.tag === activeFilter;
    return matchesSearch && matchesFilter;
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
            style={styles.dropdownButton}
            onPress={() => {
              setShowFilterDropdown(!showFilterDropdown);
            }}
          >
            <Text style={styles.dropdownText}>{activeFilter}</Text>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showFilterDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            {(['All', 'College', 'Self'] as const).map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.dropdownItem, activeFilter === filter && styles.dropdownItemActive]}
                onPress={() => {
                  setActiveFilter(filter);
                  setShowFilterDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, activeFilter === filter && styles.dropdownItemTextActive]}>
                  {filter}
                </Text>
                {activeFilter === filter && <Ionicons name="checkmark" size={18} color="#5B6BFA" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>



      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {filteredCourses.map(course => (
          <TouchableOpacity
            key={course.id}
            style={[styles.courseCard, { backgroundColor: cardBackground }]}
            onPress={() => router.push({ pathname: '/courses/[courseId]', params: { courseId: course.id } })}
          >
            {/* Image removed as per request */}
            <View style={styles.courseContent}>
              <View style={styles.courseHeader}>
                <View style={[styles.tag, { backgroundColor: course.tag === 'College' ? '#EFF6FF' : '#F0FDF4' }]}>
                  <Text style={[styles.tagText, { color: course.tag === 'College' ? '#3B82F6' : '#16A34A' }]}>{course.tag}</Text>
                </View>
              </View>
              <Text style={[styles.courseTitle, { color: textColor }]} numberOfLines={1}>{course.title}</Text>
              <Text style={[styles.courseInstructor, { color: subtextColor }]} numberOfLines={1}>{course.instructor}</Text>

              <View style={styles.courseMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{course.totalHours || 0}h</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="school-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{course.credits} Credits</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/courses/add')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    gap: 12,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    color: '#5B6BFA',
    fontWeight: '600',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 20,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseContent: {
    padding: 16,
    gap: 8,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  courseInstructor: {
    fontSize: 14,
    color: '#64748B',
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
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
    color: '#64748B',
    fontWeight: '500',
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
});
