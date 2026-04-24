import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses, CourseTag } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';

const EMOJIS = ['📚', '📝', '🧠', '🎓', '🏫', '✏️', '💻', '🔬', '📖', '📊', '📈', '💡', '💼', '📌', '📋', '🏷️', '🗓️', '⏰', '⏳', '🏆', '🥇', '📂', '📉', '🖥️', '📐', '📏', '🖊️', '🗑️', '🧩', '🔍'];
const COLORS = ['#F8FAFC', '#EFF6FF', '#F0FDF4', '#FEFCE8', '#FEF2F2', '#FAF5FF', '#FFF7ED'];

export default function AddCourseScreen() {
    const router = useRouter();
    const { addCourse } = useCourses();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
    const textColor = isDark ? '#ECEDEE' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const inputBackground = isDark ? '#1E293B' : '#F8FAFC';
    const borderColor = isDark ? '#334155' : '#E2E8F0';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructor, setInstructor] = useState('');
    
    // Duration splits
    const [durationY, setDurationY] = useState('');
    const [durationM, setDurationM] = useState('');
    const [durationD, setDurationD] = useState('');
    const [durationH, setDurationH] = useState('');
    const [durationMin, setDurationMin] = useState('');

    const [credits, setCredits] = useState('');
    const [tag, setTag] = useState<CourseTag>('College');
    const [courseLink, setCourseLink] = useState('');
    
    // Label splits
    const [labelField, setLabelField] = useState('');
    const [labelEmoji, setLabelEmoji] = useState('📚');
    const [labelColor, setLabelColor] = useState('#EFF6FF');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const segmentBackground = isDark ? '#1E293B' : '#F1F5F9';
    const segmentActive = isDark ? '#334155' : '#E2E8F0';

    const handleSave = () => {
        if (!title) {
            Alert.alert('Validation Error', 'Course Name is mandatory.');
            return;
        }

        // Aggregate duration
        const parseNum = (str: string) => parseInt(str) || 0;
        const totalDurationHours = parseNum(durationY) * 8760 + parseNum(durationM) * 730 + parseNum(durationD) * 24 + parseNum(durationH) + Math.round(parseNum(durationMin) / 60);

        addCourse({
            title,
            description,
            instructor,
            totalHours: totalDurationHours,
            credits: parseInt(credits) || 0,
            tag,
            progress: 0,
            courseLink: tag !== 'College' ? courseLink : undefined,
            label: tag !== 'College' ? `${labelEmoji} ${labelField}` : undefined,
            courseEndDate: undefined,
        });

        router.back();
    };

    const isCollege = tag === 'College';

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="trash-outline" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>New course</Text>
                <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: isDark ? '#5B6BFA' : '#E2E8F0' }]}>
                    <Text style={[styles.saveButtonText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.segmentContainer, { backgroundColor: segmentBackground }]}>
                    {(['College', 'Online Course', 'Certification', 'Personal Learning'] as CourseTag[]).map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.segmentOption, tag === t && { backgroundColor: segmentActive }]}
                            onPress={() => setTag(t)}
                        >
                            <Text style={[styles.segmentText, { color: tag === t ? textColor : subtextColor }]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={[styles.formGroup, { marginTop: 16 }]}>
                    <Text style={[styles.label, { color: textColor }]}>Course Name *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                        value={title}
                        onChangeText={setTitle}
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
                            <View style={[styles.linkIconWrapper, { backgroundColor: isDark ? '#334155' : '#64748B' }]}>
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
                        onChangeText={setInstructor}
                        placeholder=""
                        placeholderTextColor={subtextColor}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Label *</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            style={[styles.emojiButton, { backgroundColor: labelColor }]}
                            onPress={() => setShowEmojiPicker(true)}
                        >
                            <Text style={{ fontSize: 24 }}>{labelEmoji}</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: inputBackground, color: textColor }]}
                            value={labelField}
                            onChangeText={setLabelField}
                            placeholder="Subject name"
                            placeholderTextColor={subtextColor}
                        />
                    </View>
                </View>

                <View style={[styles.row, { alignItems: 'flex-start' }]}>
                    <View style={[styles.formGroup, { flex: isCollege ? 1 : undefined, width: isCollege ? undefined : '100%' }]}>
                        <Text style={[styles.label, { color: textColor }]}>Course Duration*</Text>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <TextInput style={[styles.smallInput, { backgroundColor: inputBackground, color: textColor }]} placeholder="Y" placeholderTextColor={subtextColor} keyboardType="numeric" value={durationY} onChangeText={setDurationY} />
                            <TextInput style={[styles.smallInput, { backgroundColor: inputBackground, color: textColor }]} placeholder="M" placeholderTextColor={subtextColor} keyboardType="numeric" value={durationM} onChangeText={setDurationM} />
                            <TextInput style={[styles.smallInput, { backgroundColor: inputBackground, color: textColor }]} placeholder="D" placeholderTextColor={subtextColor} keyboardType="numeric" value={durationD} onChangeText={setDurationD} />
                            <TextInput style={[styles.smallInput, { backgroundColor: inputBackground, color: textColor }]} placeholder="H" placeholderTextColor={subtextColor} keyboardType="numeric" value={durationH} onChangeText={setDurationH} />
                            <TextInput style={[styles.smallInput, { backgroundColor: inputBackground, color: textColor }]} placeholder="Min" placeholderTextColor={subtextColor} keyboardType="numeric" value={durationMin} onChangeText={setDurationMin} />
                        </View>
                    </View>
                    {isCollege && (
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: textColor }]}>Credits</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                                value={credits}
                                onChangeText={setCredits}
                                placeholder=""
                                placeholderTextColor={subtextColor}
                                keyboardType="numeric"
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal visible={showEmojiPicker} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowEmojiPicker(false)}>
                    <View style={[styles.emojiModal, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Select Emoji</Text>
                        <View style={styles.emojiGrid}>
                            {EMOJIS.map(emoji => (
                                <TouchableOpacity key={emoji} onPress={() => { setLabelEmoji(emoji); setShowEmojiPicker(false); }} style={styles.emojiGridItem}>
                                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={[styles.modalTitle, { color: textColor, marginTop: 16 }]}>Select Color</Text>
                        <View style={styles.colorRow}>
                            {COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorCircle, { backgroundColor: color, borderWidth: labelColor === color ? 2 : 1, borderColor: labelColor === color ? '#5B6BFA' : '#E2E8F0' }]}
                                    onPress={() => setLabelColor(color)}
                                />
                            ))}
                        </View>
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: '#5B6BFA' }]} onPress={() => setShowEmojiPicker(false)}>
                            <Text style={styles.closeButtonText}>Done</Text>
                        </TouchableOpacity>
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
    label: { fontSize: 14, fontWeight: '500', color: '#0F172A' },
    input: { backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, fontSize: 16, color: '#0F172A' },
    segmentContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 30, padding: 4, alignSelf: 'flex-start', minWidth: '100%' },
    segmentOption: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', borderRadius: 26, marginRight: 4 },
    segmentText: { fontSize: 13, fontWeight: '600' },
    row: { flexDirection: 'row', gap: 16 },
    inputWrapper: { flexDirection: 'row', borderRadius: 16, alignItems: 'center', paddingRight: 8 },
    inputNoBg: { flex: 1, padding: 16, fontSize: 16 },
    linkIconWrapper: { borderRadius: 12, padding: 8, justifyContent: 'center', alignItems: 'center' },
    emojiButton: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    smallInput: { flex: 1, minWidth: 46, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12, fontSize: 14, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    emojiModal: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
    emojiGridItem: { width: '15%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 12 },
    colorRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 24 },
    colorCircle: { width: 40, height: 40, borderRadius: 20 },
    closeButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
    closeButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});
