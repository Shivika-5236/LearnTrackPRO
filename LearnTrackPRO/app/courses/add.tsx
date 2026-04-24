import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Modal } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses, CourseTag } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';

const EMOJIS = ['book-outline', 'school-outline', 'pencil-outline', 'bar-chart-outline', 'briefcase-outline', 'bulb-outline', 'calendar-outline', 'time-outline', 'document-text-outline', 'desktop-outline', 'stats-chart-outline', 'pie-chart-outline', 'calculator-outline', 'library-outline', 'medal-outline', 'trophy-outline', 'earth-outline', 'compass-outline', 'language-outline', 'flask-outline', 'color-palette-outline', 'construct-outline', 'hardware-chip-outline', 'telescope-outline', 'planet-outline', 'newspaper-outline', 'bookmarks-outline', 'folder-open-outline', 'archive-outline', 'business-outline'];
const COLORS = ['#94A3B8', '#3B82F6', '#10B981', '#EAB308', '#EF4444', '#8B5CF6', '#F97316', '#6366F1', '#14B8A6', '#F43F5E'];

export default function AddCourseScreen() {
    const router = useRouter();
    const { addCourse, updateCourse, courses } = useCourses();
    const { isDark } = useTheme();
    const { courseId } = useLocalSearchParams<{ courseId: string }>();
    const courseToEdit = courses.find(c => c.id === courseId);

    const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
    const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
    const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
    const inputBackground = isDark ? '#1E2B3C' : '#FFFFFF'; 
    const borderColor = isDark ? '#273548' : '#C5D9EE';

    const [title, setTitle] = useState(courseToEdit?.title || '');
    const [description, setDescription] = useState(courseToEdit?.description || '');
    const [instructor, setInstructor] = useState(courseToEdit?.instructor || '');
    
    // Duration splits
    const [durationValue, setDurationValue] = useState(courseToEdit?.durationValue || '');
    const [durationUnit, setDurationUnit] = useState(courseToEdit?.durationUnit || 'hours');
    const [showDurationPicker, setShowDurationPicker] = useState(false);

    const [credits, setCredits] = useState(courseToEdit?.credits?.toString() || '');
    const [tag, setTag] = useState<CourseTag>(courseToEdit?.tag || 'College');
    const [courseLink, setCourseLink] = useState(courseToEdit?.courseLink || '');
    
    // Label splits
    const [labelField, setLabelField] = useState(courseToEdit?.label ? courseToEdit.label.substring(courseToEdit.label.indexOf(' ') + 1) : '');
    const [labelEmoji, setLabelEmoji] = useState(courseToEdit?.label ? (courseToEdit.label.split(' ')[0] || 'book-outline') : 'book-outline');
    const [labelColor, setLabelColor] = useState(courseToEdit?.labelColor || '#3B82F6');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const segmentBackground = isDark ? '#161D2A' : '#F1F5F9';
    const segmentActive = isDark ? '#273548' : '#B0B0B0'; // Match the grey mockup pill

    const validateTitle = (text: string) => {
        // Only allow numbers followed by string
        const filtered = text.replace(/[^a-zA-Z0-9\s()]/g, '');
        // Ensure numbers come before letters if both present
        const lettersStart = filtered.search(/[a-zA-Z]/);
        if (lettersStart === -1) {
            // Only numbers so far
            setTitle(filtered);
        } else {
            const numbersAfterLetters = filtered.substring(lettersStart).search(/\d/);
            if (numbersAfterLetters === -1) {
                setTitle(filtered);
            }
        }
    };

    const validateNameOnly = (text: string, setter: (val: string) => void) => {
        const filtered = text.replace(/[^a-zA-Z\s]/g, '');
        setter(filtered);
    };

    const validateNumberOnly = (text: string, setter: (val: string) => void) => {
        const filtered = text.replace(/[^0-9]/g, '');
        setter(filtered);
    };

    const handleSave = () => {
        if (!title) {
            Alert.alert('Validation Error', 'Course Name is mandatory.');
            return;
        }

        // Aggregate duration
        const parsedVal = parseInt(durationValue) || 0;
        let totalDurationHours = 0;
        if (durationUnit === 'yr') totalDurationHours = parsedVal * 8760;
        else if (durationUnit === 'month') totalDurationHours = parsedVal * 730;
        else if (durationUnit === 'days') totalDurationHours = parsedVal * 24;
        else if (durationUnit === 'hours') totalDurationHours = parsedVal;
        else if (durationUnit === 'min') totalDurationHours = Math.round(parsedVal / 60);

        const courseData = {
            title,
            description,
            instructor,
            totalHours: totalDurationHours,
            credits: parseInt(credits) || 0,
            tag,
            progress: courseToEdit?.progress || 0,
            courseLink: courseLink,
            label: `${labelEmoji} ${labelField}`,
            labelColor: labelColor,
            durationValue: durationValue,
            durationUnit: durationUnit,
            courseEndDate: undefined,
        };

        if (courseId && courseToEdit) {
            updateCourse(courseId, courseData);
        } else {
            addCourse(courseData);
        }

        router.back();
    };

    const isCollege = tag === 'College';

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>{courseId ? 'Edit course' : 'New course'}</Text>
                <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: isDark ? '#7C6AF7' : '#E2E8F0' }]}>
                    <Text style={[styles.saveButtonText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>{courseId ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={[styles.segmentContainer, { backgroundColor: segmentBackground, flexWrap: 'wrap', justifyContent: 'space-between', padding: 6, borderRadius: 24 }]}>
                    {(['College', 'Online Course', 'Certification', 'Personal Learning'] as CourseTag[]).map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.segmentOption, { width: '48%', marginVertical: 2 }, tag === t && { backgroundColor: segmentActive }]}
                            onPress={() => setTag(t)}
                        >
                            <Text style={[styles.segmentText, { color: tag === t ? (isDark ? textColor : '#FFFFFF') : subtextColor }]} numberOfLines={1}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.formGroup, { marginTop: 16 }]}>
                    <Text style={[styles.label, { color: textColor }]}>Course Name *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                        value={title}
                        onChangeText={validateTitle}
                        placeholder=""
                        placeholderTextColor={subtextColor}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Course Description</Text>
                    <TextInput
                        style={[styles.input, { minHeight: 80, textAlignVertical: 'top', backgroundColor: inputBackground, color: textColor }]}
                        multiline
                        value={description}
                        onChangeText={setDescription}
                        placeholder=""
                        placeholderTextColor={subtextColor}
                    />
                </View>

                {!isCollege && (
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: textColor }]}>Course link</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: inputBackground }]}>
                            <TextInput
                                style={[styles.inputNoBg, { color: textColor }]}
                                value={courseLink}
                                onChangeText={setCourseLink}
                                placeholder=""
                                placeholderTextColor={subtextColor}
                                autoCapitalize="none"
                            />
                            <View style={[styles.linkIconWrapper, { backgroundColor: isDark ? '#273548' : '#888' }]}>
                                <Ionicons name="link" size={20} color="#FFFFFF" />
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Mentor name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                        value={instructor}
                        onChangeText={(t) => validateNameOnly(t, setInstructor)}
                        placeholder=""
                        placeholderTextColor={subtextColor}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Label *</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderWidth: 1, borderColor, paddingRight: 8 }]}>
                        <TextInput
                            style={[styles.inputNoBg, { color: textColor }]}
                            value={labelField}
                            onChangeText={(t) => validateNameOnly(t, setLabelField)}
                            placeholder="Subject name"
                            placeholderTextColor={subtextColor}
                        />
                        <TouchableOpacity
                            style={{ width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor }}
                            onPress={() => setShowEmojiPicker(true)}
                        >
                            <Ionicons name={labelEmoji as any} size={22} color={labelColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Course Duration*</Text>
                    <View style={{ flexDirection: 'row', borderRadius: 12, overflow: 'hidden' }}>
                        <View style={{ flex: 1, backgroundColor: inputBackground, borderWidth: 1, borderColor, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>
                            <TextInput
                                style={[styles.inputNoBg, { color: textColor }]}
                                value={durationValue}
                                onChangeText={(t) => validateNumberOnly(t, setDurationValue)}
                                placeholder="0"
                                placeholderTextColor={subtextColor}
                                keyboardType="numeric"
                            />
                        </View>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: isDark ? '#273548' : '#CBD5E1', 
                                paddingHorizontal: 12,
                                width: 90
                            }}
                            onPress={() => setShowDurationPicker(true)}
                        >
                            <Text style={[styles.dropdownText, { color: textColor, flex: 1, marginRight: 4 }]} numberOfLines={1}>{durationUnit}</Text>
                            <Ionicons name="chevron-down" size={14} color={subtextColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                {isCollege && (
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: textColor }]}>Credits</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                            value={credits}
                            onChangeText={(t) => validateNumberOnly(t, setCredits)}
                            placeholder=""
                            placeholderTextColor={subtextColor}
                            keyboardType="numeric"
                        />
                    </View>
                )}
            </ScrollView>

            <Modal visible={showEmojiPicker} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowEmojiPicker(false)}>
                    <View style={[styles.emojiModal, { backgroundColor: isDark ? '#161D2A' : '#FFFFFF' }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Select Emoji</Text>
                        <View style={styles.emojiGrid}>
                            {EMOJIS.map(emoji => (
                                <TouchableOpacity key={emoji} onPress={() => { setLabelEmoji(emoji); setShowEmojiPicker(false); }} style={[styles.emojiGridItem, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}>
                                    <Ionicons name={emoji as any} size={28} color={labelColor} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={[styles.modalTitle, { color: textColor, marginTop: 16 }]}>Select Color</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                            <View style={styles.colorRow}>
                                {COLORS.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[styles.colorCircle, { backgroundColor: color, borderWidth: labelColor === color ? 2 : 1, borderColor: labelColor === color ? '#7C6AF7' : '#E2E8F0' }]}
                                        onPress={() => setLabelColor(color)}
                                    />
                                ))}
                            </View>
                        </ScrollView>
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: '#7C6AF7' }]} onPress={() => setShowEmojiPicker(false)}>
                            <Text style={styles.closeButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showDurationPicker} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDurationPicker(false)}>
                    <View style={[styles.emojiModal, { backgroundColor: isDark ? '#161D2A' : '#FFFFFF' }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Select Unit</Text>
                        {['yr', 'month', 'days', 'hours', 'min'].map(unit => (
                            <TouchableOpacity 
                                key={unit} 
                                style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderColor }}
                                onPress={() => { setDurationUnit(unit); setShowDurationPicker(false); }}
                            >
                                <Text style={{ fontSize: 16, color: textColor, textTransform: 'capitalize' }}>{unit}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    saveButton: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#E2E8F0', borderRadius: 20 },
    saveButtonText: { color: '#0F172A', fontWeight: '600', fontSize: 14 },
    container: { padding: 24, gap: 20, paddingBottom: 40 },
    formGroup: { gap: 8 },
    label: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
    input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 16, fontSize: 16, color: '#0F172A' },
    segmentContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 30, padding: 4, alignSelf: 'flex-start', minWidth: '100%' },
    segmentOption: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', borderRadius: 26, marginRight: 4 },
    segmentText: { fontSize: 13, fontWeight: '600' },
    row: { flexDirection: 'row', gap: 16 },
    dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    dropdownText: { fontSize: 16, fontWeight: '500' },
    inputWrapper: { flexDirection: 'row', borderRadius: 12, alignItems: 'center', paddingRight: 8 },
    inputNoBg: { flex: 1, padding: 16, fontSize: 16 },
    linkIconWrapper: { borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    emojiButton: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    smallInput: { flex: 1, minWidth: 40, backgroundColor: '#F1F5F9', borderRadius: 10, padding: 12, fontSize: 14, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: '#000000', justifyContent: 'flex-end' },
    emojiModal: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
    emojiGridItem: { width: '15%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    colorRow: { flexDirection: 'row', gap: 12, paddingRight: 20 },
    colorCircle: { width: 40, height: 40, borderRadius: 20 },
    closeButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
    closeButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});
