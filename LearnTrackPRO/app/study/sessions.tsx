import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy, FocusBlock } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

export default function StudySessionsScreen() {
  const router = useRouter();
  const { isDark, textColor, subtextColor, backgroundColor, cardBackground, borderColor, inputBackground } = useTheme();
  const { upcomingBlocks } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Subject');
  const [durationFilter, setDurationFilter] = useState('Duration');

  const [activeDropdown, setActiveDropdown] = useState<1 | 2 | null>(null);

  // Helper to map subject to icon
  const getSubjectIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('math')) return 'book';
    if (t.includes('physic')) return 'flask';
    if (t.includes('chem')) return 'color-filter';
    if (t.includes('biol')) return 'leaf';
    if (t.includes('hist')) return 'earth';
    if (t.includes('engl')) return 'journal';
    return 'school';
  };

  // Get unique subjects for filter
  const uniqueSubjects = useMemo(() => {
    const subjects = upcomingBlocks.map(b => b.title);
    return ['Subject', ...new Set(subjects)];
  }, [upcomingBlocks]);

  const durationOptions = ['Duration', '15 mins', '30 mins', '45 mins', '60 mins', '90 mins', '120 mins'];

  // Filter logic
  const filteredSessions = useMemo(() => {
    return upcomingBlocks.filter((block) => {
      const matchesSearch =
        block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (block.details && block.details.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSubject = subjectFilter === 'Subject' || block.title === subjectFilter;
      
      const matchesDuration = durationFilter === 'Duration' || block.duration.toString() === durationFilter.split(' ')[0];

      return matchesSearch && matchesSubject && matchesDuration;
    }).sort((a, b) => {
      const dateA = a.parsedDate ? new Date(a.parsedDate).getTime() : 0;
      const dateB = b.parsedDate ? new Date(b.parsedDate).getTime() : 0;
      return dateA - dateB;
    });
  }, [upcomingBlocks, searchQuery, subjectFilter, durationFilter]);

  const renderSessionCard = ({ item }: { item: FocusBlock }) => (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: isDark ? '#1E293B' : '#EBF2FF', 
          borderColor: isDark ? '#334155' : '#D1E0FF' 
        }
      ]} 
      onPress={() => router.push({ pathname: '/study/session', params: { blockId: item.id } })}
    >
      <View style={styles.cardTopRow}>
        <Text style={[styles.subjectTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
        <Ionicons name={(item.subjectIcon || getSubjectIcon(item.title)) as any} size={22} color={item.subjectColor || "#5B6AFF"} />
      </View>
      
      <View style={styles.contentGroup}>
        <Text style={[styles.subtitle, { color: subtextColor }]} numberOfLines={1}>
          {item.subjectLabel || (item.courseId && typeof item.courseId === 'object' ? item.courseId.title : 'General Study')}
        </Text>
        <Text style={[styles.description, { color: textColor }]} numberOfLines={2}>
          {item.details || 'No description provided'}
        </Text>
      </View>
      
      <View style={styles.metaInfo}>
        <View style={styles.metaRowItem}>
          <Ionicons name="time-outline" size={16} color={textColor} />
          <Text style={[styles.metaText, { color: textColor }]}>{item.duration} mins</Text>
        </View>
        <View style={styles.metaRowItem}>
          <Ionicons name="calendar-outline" size={16} color={textColor} />
          <Text style={[styles.metaText, { color: textColor }]} numberOfLines={1}>
            {item.date}, {item.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.headerIcon, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: textColor }]}>Study sessions</Text>
        
        <TouchableOpacity style={[styles.headerIcon, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
          <Ionicons name="trash-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: borderColor }]}>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search your session..."
            placeholderTextColor={subtextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color={subtextColor} style={styles.searchIcon} />
        </View>
      </View>

      {/* Filters Row */}
      <View style={[styles.filtersRow, { zIndex: 1000 }]}>
        <TouchableOpacity 
          style={[styles.filterPill, { backgroundColor: inputBackground, borderColor: borderColor }, activeDropdown === 1 && { borderColor: '#7C6AF7' }]} 
          onPress={() => setActiveDropdown(activeDropdown === 1 ? null : 1)}
        >
          <Text style={[styles.filterText, { color: textColor }]}>{subjectFilter}</Text>
          <Ionicons name={activeDropdown === 1 ? "chevron-up" : "chevron-down"} size={16} color={textColor} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterPill, { backgroundColor: inputBackground, borderColor: borderColor }, activeDropdown === 2 && { borderColor: '#7C6AF7' }]} 
          onPress={() => setActiveDropdown(activeDropdown === 2 ? null : 2)}
        >
          <Text style={[styles.filterText, { color: textColor }]}>{durationFilter}</Text>
          <Ionicons name={activeDropdown === 2 ? "chevron-up" : "chevron-down"} size={16} color={textColor} />
        </TouchableOpacity>

        {activeDropdown === 1 && (
          <View style={[styles.dropdownOverlay, { left: 16, width: (width - 44) / 2, backgroundColor: isDark ? '#1E2B3C' : '#FFFFFF', borderColor: borderColor }]}>
            {uniqueSubjects.map((option, index) => {
              const isActive = subjectFilter === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    isActive && { backgroundColor: isDark ? 'rgba(124, 106, 247, 0.1)' : 'rgba(124, 106, 247, 0.05)' },
                    index < uniqueSubjects.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                  ]}
                  onPress={() => {
                    setSubjectFilter(option);
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: textColor }, isActive && { color: '#7C6AF7' }]}>{option}</Text>
                  {isActive && <Ionicons name="checkmark" size={16} color="#7C6AF7" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeDropdown === 2 && (
          <View style={[styles.dropdownOverlay, { right: 16, left: undefined, width: (width - 44) / 2, backgroundColor: isDark ? '#1E2B3C' : '#FFFFFF', borderColor: borderColor }]}>
            {durationOptions.map((option, index) => {
              const isActive = durationFilter === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    isActive && { backgroundColor: isDark ? 'rgba(124, 106, 247, 0.1)' : 'rgba(124, 106, 247, 0.05)' },
                    index < durationOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                  ]}
                  onPress={() => {
                    setDurationFilter(option);
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: textColor }, isActive && { color: '#7C6AF7' }]}>{option}</Text>
                  {isActive && <Ionicons name="checkmark" size={16} color="#7C6AF7" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <Text style={[styles.sessionCount, { color: subtextColor }]}>{filteredSessions.length} LOGS</Text>
        <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: isDark ? '#7C6AF7' : '#0F172A' }]}
            onPress={() => router.push('/study/create-block')}
        >
            <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Layout */}
      <FlatList
        data={filteredSessions}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: subtextColor }]}>
              {upcomingBlocks.length === 0 
                ? "No study sessions scheduled yet." 
                : "No sessions found matching your search."}
            </Text>
          </View>
        }
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcon: {
    padding: 4,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sessionCount: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 12,
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderWidth: 0.5,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  contentGroup: {
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  metaInfo: {
    gap: 6,
  },
  metaRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 48,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 2000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E4E9F4', // Default for dark mode or override in component
  },
});
