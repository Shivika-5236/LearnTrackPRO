import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses, CourseTag } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';

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
    const [totalHours, setTotalHours] = useState('');
    const [credits, setCredits] = useState('');
    const [tag, setTag] = useState<CourseTag>('Self');

    const handleSave = () => {
        if (!title || !totalHours) {
            Alert.alert('Validation Error', 'Course Name and Total Hours are mandatory.');
            return;
        }

        addCourse({
            title,
            description,
            instructor,
            totalHours: parseInt(totalHours) || 0,
            credits: parseInt(credits) || 0,
            tag,
            progress: 0,
        });

        router.back();
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>New Course</Text>
                <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: subtextColor }]}>Course Name *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Machine Learning"
                        placeholderTextColor={subtextColor}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: subtextColor }]}>Description</Text>
                    <TextInput
                        style={[styles.input, { minHeight: 80, textAlignVertical: 'top', backgroundColor: inputBackground, borderColor, color: textColor }]}
                        multiline
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Course description..."
                        placeholderTextColor={subtextColor}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: subtextColor }]}>Instructor / Mentor</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                        value={instructor}
                        onChangeText={setInstructor}
                        placeholder="e.g. Dr. Smith"
                        placeholderTextColor={subtextColor}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: subtextColor }]}>Total Hours *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                            value={totalHours}
                            onChangeText={setTotalHours}
                            placeholder="e.g. 40"
                            placeholderTextColor={subtextColor}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: subtextColor }]}>Credits</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                            value={credits}
                            onChangeText={setCredits}
                            placeholder="e.g. 3"
                            placeholderTextColor={subtextColor}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: subtextColor }]}>Tag</Text>
                    <View style={styles.tagRow}>
                        <TouchableOpacity
                            style={[styles.tagOption, { borderColor }, tag === 'Self' && { backgroundColor: isDark ? '#5B6BFA' : '#0F172A', borderColor: isDark ? '#5B6BFA' : '#0F172A' }]}
                            onPress={() => setTag('Self')}
                        >
                            <Text style={[styles.tagText, { color: subtextColor }, tag === 'Self' && { color: '#FFFFFF' }]}>Self Paced</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tagOption, { borderColor }, tag === 'College' && { backgroundColor: isDark ? '#5B6BFA' : '#0F172A', borderColor: isDark ? '#5B6BFA' : '#0F172A' }]}
                            onPress={() => setTag('College')}
                        >
                            <Text style={[styles.tagText, { color: subtextColor }, tag === 'College' && { color: '#FFFFFF' }]}>College</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#0F172A',
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    container: {
        padding: 24,
        gap: 20,
    },
    formGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#0F172A',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 12,
    },
    tagOption: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    tagActive: {
        backgroundColor: '#0F172A',
        borderColor: '#0F172A',
    },
    tagText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    tagTextActive: {
        color: '#FFFFFF',
    },
});
