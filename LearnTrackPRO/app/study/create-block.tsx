import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Alert,
    Platform,
    FlatList,
    Dimensions,
    Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { useCourses } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';
import CalendarPicker from '@/components/CalendarPicker';

const BLOCK_TYPES = [
    'Problem Solving', 'Learning', 'Revision', 'Homework / Assignments',
    'Project Work', 'Deep Work', 'Quick Study', 'Practice Session',
    'Writing Practice', 'Research', 'Experimentation', 'Planning',
    'Review / Reflection', 'Testing / Mock Test'
];

export default function CreateBlockScreen() {
    const router = useRouter();
    const { courseId } = useLocalSearchParams();
    const { addFocusBlock } = useStudy();
    const { courses, addCourse, refreshCourses } = useCourses();
    const { isDark } = useTheme();

    const initialCourse = courses.find(c => c.id === courseId);

    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(initialCourse || null);
    const [isCreatingNewLabel, setIsCreatingNewLabel] = useState(false);
    const [newLabelTitle, setNewLabelTitle] = useState('');
    const [selectedNewLabelColor, setSelectedNewLabelColor] = useState('#10B981');
    const [selectedNewLabelIcon, setSelectedNewLabelIcon] = useState('book-outline');
    const [showCustomizer, setShowCustomizer] = useState(false);
    
    const PRESET_COLORS = ['#94A3B8', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
    const PRESET_ICONS = [
        'book-outline', 'school-outline', 'pencil-outline', 'stats-chart-outline', 'briefcase-outline',
        'bulb-outline', 'calendar-outline', 'time-outline', 'document-text-outline', 'desktop-outline',
        'bar-chart-outline', 'pie-chart-outline', 'calculator-outline', 'library-outline', 'medal-outline',
        'trophy-outline', 'earth-outline', 'compass-outline', 'language-outline', 'flask-outline',
        'color-palette-outline', 'hammer-outline', 'hardware-chip-outline', 'telescope-outline', 'planet-outline',
        'newspaper-outline', 'bookmark-outline', 'folder-outline', 'archive-outline', 'business-outline'
    ];
    const [blockType, setBlockType] = useState('Deep Work');
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    // Time & Duration
    const [hours, setHours] = useState('12');
    const [minutes, setMinutes] = useState('00');
    const [ampm, setAmPm] = useState('PM');
    const [durationHours, setDurationHours] = useState('1');
    const [durationMinutes, setDurationMinutes] = useState('0');

    // UI States
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    const handleDateConfirm = (date: Date) => {
        setSelectedDate(date);
        setShowCalendar(false);
    };

    const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const inputBackground = isDark ? '#1E293B' : '#F1F5F9';

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Please enter a session name.');
            return;
        }

        let finalCourseId = null;
        let finalColor = '#10B981';
        let finalSubjectLabel = null;
        let finalSubjectColor = null;
        let finalSubjectIcon = null;

        if (isCreatingNewLabel && newLabelTitle.trim()) {
            finalSubjectLabel = newLabelTitle.trim();
            finalSubjectColor = selectedNewLabelColor;
            finalSubjectIcon = selectedNewLabelIcon;
            finalColor = selectedNewLabelColor;
            finalCourseId = null;
        } else if (selectedCourse) {
            finalCourseId = selectedCourse.id;
            finalColor = selectedCourse.color || '#6C63FF';
        } else {
            Alert.alert('Validation Error', 'Please select a subject label.');
            return;
        }

        const dateStr = selectedDate.toISOString().split('T')[0];
        const dayStr = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedTime = `${hours}:${minutes} ${ampm}`;
        const totalDuration = (parseInt(durationHours) || 0) * 60 + (parseInt(durationMinutes) || 0);

        addFocusBlock({
            title: title.trim(),
            details: `${blockType}: ${details}`,
            courseId: finalCourseId,
            day: dayStr,
            date: dateStr,
            time: formattedTime,
            duration: totalDuration,
            color: finalColor,
            subjectLabel: finalSubjectLabel,
            subjectColor: finalSubjectColor,
            subjectIcon: finalSubjectIcon,
        });

        Alert.alert('Success', 'Study session created!');
        router.back();
    };

    const renderDropdownItem = ({ item, type }: { item: any, type: 'course' | 'type' }) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
                if (type === 'course') {
                    if (item.id === 'new') {
                        setIsCreatingNewLabel(true);
                        setSelectedCourse(null);
                    } else {
                        setIsCreatingNewLabel(false);
                        setSelectedCourse(item);
                    }
                    setShowCourseDropdown(false);
                } else {
                    setBlockType(item);
                    setShowTypeDropdown(false);
                }
            }}
        >
            <View style={styles.dropdownItemContent}>
                {type === 'course' ? (
                    <>
                        <View style={[styles.courseIcon, { backgroundColor: item.color || '#10B981' }]}>
                            <Ionicons name={item.id === 'new' ? "add" : "book"} size={14} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.dropdownItemText, { color: textColor }]}>{item.title}</Text>
                    </>
                ) : (
                    <Text style={[styles.dropdownItemText, { color: textColor }]}>{item}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
                    <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>New study session</Text>
                <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <Text style={[styles.saveButtonText, { color: textColor }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Session Name */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Session Name *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, color: textColor, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Maths Practice"
                        placeholderTextColor={subtextColor}
                    />
                </View>

                {/* Details */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Details</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, color: textColor, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                        value={details}
                        onChangeText={setDetails}
                        placeholder="What are you studying?"
                        placeholderTextColor={subtextColor}
                    />
                </View>

                {/* Subject Label */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Subject label *</Text>
                    <TouchableOpacity
                        style={[styles.input, styles.trigger, { backgroundColor: inputBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                        onPress={() => {
                            setShowCourseDropdown(!showCourseDropdown);
                            setShowTypeDropdown(false);
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            {selectedCourse && (
                                <View style={[styles.miniIcon, { backgroundColor: selectedCourse.color }]}>
                                    <Ionicons name="book" size={12} color="#FFFFFF" />
                                </View>
                            )}
                            <Text style={[styles.triggerText, { color: textColor }, !selectedCourse && { color: subtextColor }]}>
                                {selectedCourse ? selectedCourse.title : 'Select subject'}
                            </Text>
                        </View>
                        <Ionicons name={showCourseDropdown ? "chevron-up" : "chevron-down"} size={20} color={subtextColor} />
                    </TouchableOpacity>
                    
                    {showCourseDropdown && (
                        <View style={[styles.inlineDropdown, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                            <FlatList
                                data={[...courses, { id: 'new', title: 'Add New Label', color: '#10B981' }]}
                                renderItem={(props) => renderDropdownItem({ ...props, type: 'course' })}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                            />
                        </View>
                    )}
                </View>

                {isCreatingNewLabel && (
                    <View style={[styles.formGroup, { marginTop: -12 }]}>
                        <Text style={[styles.label, { color: textColor }]}>Label *</Text>
                        <View style={[styles.inputContainer, { backgroundColor: inputBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                            <TextInput
                                style={[styles.flexInput, { color: textColor }]}
                                value={newLabelTitle}
                                onChangeText={setNewLabelTitle}
                                placeholder="Subject name"
                                placeholderTextColor={subtextColor}
                                autoFocus
                            />
                            <TouchableOpacity 
                                style={styles.inputIconContainer}
                                onPress={() => setShowCustomizer(true)}
                            >
                                <Ionicons name={selectedNewLabelIcon as any} size={24} color={selectedNewLabelColor} />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity onPress={() => setIsCreatingNewLabel(false)} style={styles.cancelBtn}>
                            <Text style={styles.cancelBtnText}>Back to selection</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Study Block Type */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Study block type *</Text>
                    <TouchableOpacity
                        style={[styles.input, styles.trigger, { backgroundColor: inputBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                        onPress={() => {
                            setShowTypeDropdown(!showTypeDropdown);
                            setShowCourseDropdown(false);
                        }}
                    >
                        <Text style={[styles.triggerText, { color: textColor }]}>{blockType}</Text>
                        <Ionicons name={showTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color={subtextColor} />
                    </TouchableOpacity>

                    {showTypeDropdown && (
                        <Modal
                            visible={showTypeDropdown}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setShowTypeDropdown(false)}
                        >
                            <TouchableOpacity 
                                style={styles.modalOverlay} 
                                activeOpacity={1} 
                                onPress={() => setShowTypeDropdown(false)}
                            >
                                <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                                    <View style={styles.modalHeader}>
                                        <Text style={[styles.modalTitle, { color: textColor }]}>Select Block Type</Text>
                                        <TouchableOpacity onPress={() => setShowTypeDropdown(false)}>
                                            <Ionicons name="close" size={24} color={subtextColor} />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        <View style={styles.typeGrid}>
                                            {BLOCK_TYPES.map((type, index) => {
                                                const isActive = blockType === type;
                                                return (
                                                    <TouchableOpacity
                                                        key={type}
                                                        style={[
                                                            styles.typeItem,
                                                            isActive && { backgroundColor: isDark ? '#334155' : '#F1F5F9' },
                                                            index < BLOCK_TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#F1F5F9' }
                                                        ]}
                                                        onPress={() => {
                                                            setBlockType(type);
                                                            setShowTypeDropdown(false);
                                                        }}
                                                    >
                                                        <Text style={[styles.typeItemText, { color: textColor }, isActive && { color: '#7C3AED', fontWeight: '700' }]}>
                                                            {type}
                                                        </Text>
                                                        {isActive && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    )}
                </View>

                {/* Date */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Date *</Text>
                    <TouchableOpacity
                        style={[styles.input, styles.trigger, { backgroundColor: inputBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                        onPress={() => setShowCalendar(true)}
                    >
                        <Text style={[styles.triggerText, { color: textColor }]}>
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color={subtextColor} />
                    </TouchableOpacity>
                </View>

                {/* Time & Duration */}
                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1.2 }]}>
                        <Text style={[styles.label, { color: textColor }]}>Time *</Text>
                        <View style={[styles.timePickerContainer, { backgroundColor: inputBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                            <TextInput
                                style={[styles.timeInput, { color: textColor }]}
                                value={hours}
                                onChangeText={setHours}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <Text style={[styles.timeSeparator, { color: textColor }]}>:</Text>
                            <TextInput
                                style={[styles.timeInput, { color: textColor }]}
                                value={minutes}
                                onChangeText={setMinutes}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <TouchableOpacity 
                                style={[styles.ampmToggle, { backgroundColor: isDark ? '#334155' : '#FFFFFF' }]}
                                onPress={() => setAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
                            >
                                <Text style={[styles.ampmText, { color: textColor }]}>{ampm}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: textColor }]}>Study Duration *</Text>
                        <View style={[styles.durationContainer, { backgroundColor: inputBackground, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                             <View style={styles.durationPart}>
                                <TextInput
                                    style={[styles.durationInput, { color: textColor }]}
                                    value={durationHours}
                                    onChangeText={setDurationHours}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                                <Text style={styles.durationLabel}>hr</Text>
                             </View>
                             <View style={styles.durationPart}>
                                <TextInput
                                    style={[styles.durationInput, { color: textColor }]}
                                    value={durationMinutes}
                                    onChangeText={setDurationMinutes}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                                <Text style={styles.durationLabel}>min</Text>
                             </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <CalendarPicker
                visible={showCalendar}
                onClose={() => setShowCalendar(false)}
                onConfirm={handleDateConfirm}
                initialDate={selectedDate}
            />

            {/* Icon & Color Customizer Modal */}
            <Modal
                visible={showCustomizer}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCustomizer(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowCustomizer(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>Customize Label</Text>
                            <TouchableOpacity onPress={() => setShowCustomizer(false)}>
                                <Ionicons name="close" size={24} color={subtextColor} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Emoji Selector */}
                            <View style={styles.pickerSection}>
                                <Text style={[styles.pickerTitle, { color: textColor }]}>Select Emoji</Text>
                                <View style={styles.iconGrid}>
                                    {PRESET_ICONS.map(icon => (
                                        <TouchableOpacity
                                            key={icon}
                                            style={[
                                                styles.iconTile,
                                                selectedNewLabelIcon === icon && { backgroundColor: selectedNewLabelColor + '15', borderColor: selectedNewLabelColor }
                                            ]}
                                            onPress={() => setSelectedNewLabelIcon(icon)}
                                        >
                                            <Ionicons name={icon as any} size={22} color={selectedNewLabelIcon === icon ? selectedNewLabelColor : '#3B82F6'} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Color Picker */}
                            <View style={styles.pickerSection}>
                                <Text style={[styles.pickerTitle, { color: textColor }]}>Select Color</Text>
                                <View style={styles.colorRow}>
                                    {PRESET_COLORS.map(color => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorCircle,
                                                { backgroundColor: color },
                                                selectedNewLabelColor === color && styles.selectedColorCircle
                                            ]}
                                            onPress={() => setSelectedNewLabelColor(color)}
                                        >
                                            {selectedNewLabelColor === color && (
                                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity 
                                onPress={() => setShowCustomizer(false)} 
                                style={styles.doneBtn}
                            >
                                <Text style={styles.doneBtnText}>Done</Text>
                            </TouchableOpacity>
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerIcon: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    saveButton: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveButtonText: {
        color: '#0F172A',
        fontWeight: '600',
        fontSize: 14,
    },
    container: {
        padding: 24,
        gap: 24,
    },
    formGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        padding: 16,
        fontSize: 16,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    triggerText: {
        fontSize: 15,
        color: '#0F172A',
    },
    inlineDropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    dropdownItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#0F172A',
        fontWeight: '500',
    },
    courseIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniIcon: {
        width: 20,
        height: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    timeInput: {
        width: 32,
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginHorizontal: 2,
    },
    ampmToggle: {
        marginLeft: 'auto',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ampmText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0F172A',
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    durationPart: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    durationInput: {
        width: 24,
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
    },
    durationLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    flexInput: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        height: '100%',
    },
    inputIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    cancelBtn: {
        alignSelf: 'flex-start',
        marginTop: 4,
        marginLeft: 4,
    },
    cancelBtnText: {
        color: '#5B6AFF',
        fontSize: 13,
        fontWeight: '600',
    },
    typeGrid: {
        marginBottom: 20,
    },
    typeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    typeItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    pickerSection: {
        marginTop: 20,
        gap: 12,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginLeft: 4,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
    },
    iconTile: {
        width: (Dimensions.get('window').width - 80) / 5,
        height: (Dimensions.get('window').width - 80) / 5,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingLeft: 4,
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedColorCircle: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    doneBtn: {
        backgroundColor: '#7C3AED',
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    doneBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
});
