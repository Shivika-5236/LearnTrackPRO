import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '@/context/CourseContext';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function AddItemScreen() {
    const { courseId, type, editingId } = useLocalSearchParams();
    const router = useRouter();
    const { courses, addAssignment, addNote, updateNote, addProject, updateProject } = useCourses();
    const { isDark } = useTheme();

    const course = courses.find(c => c.id === courseId);

    const backgroundColor = isDark ? '#0D1117' : '#F0F5FA';
    const textColor = isDark ? '#E4E9F4' : '#1A3A5C';
    const subtextColor = isDark ? '#6A80A4' : '#5A7A9A';
    const inputBackground = isDark ? '#161D2A' : '#FFFFFF';
    const borderColor = isDark ? '#273548' : '#C5D9EE';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [techStack, setTechStack] = useState('');
    const [projectDetails, setProjectDetails] = useState('');
    const [status, setStatus] = useState<'In Progress' | 'Completed' | 'Pending'>('In Progress');
    const [deadline, setDeadline] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [githubLink, setGithubLink] = useState('');
    const [includeGithub, setIncludeGithub] = useState(false);
    const [pdfFile, setPdfFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    useEffect(() => {
        if (editingId && course) {
            if (type === 'Note') {
                const note = course.notes.find(n => n.id === editingId);
                if (note) {
                    setTitle(note.heading);
                    setDescription(note.content);
                    if (note.pdfUrl) {
                        setPdfFile({ uri: note.pdfUrl, name: note.pdfUrl.split('/').pop() || 'Existing PDF' } as any);
                    }
                }
            } else if (type === 'Project') {
                const project = course.projects.find(p => p.id === editingId);
                if (project) {
                    setTitle(project.name);
                    setTechStack(project.techStack);
                    setProjectDetails(project.details);
                    setStatus(project.status || 'In Progress');
                    setDeadline(project.deadline || '');
                    setGithubLink(project.githubLink || '');
                    setIncludeGithub(!!project.githubLink);
                }
            }
        }
    }, [editingId, type, course]);

    const handleSave = () => {
        if (!courseId) return;

        if (type === 'Assignment') {
            if (!title) return Alert.alert('Error', 'Title is heavily required');
            addAssignment(courseId as string, { title, description, pdfUrl: pdfFile?.uri });
        } else if (type === 'Note') {
            if (!title) return Alert.alert('Error', 'Title is heavily required');
            if (editingId) {
                updateNote(courseId as string, editingId as string, { heading: title, content: description, pdfUrl: pdfFile?.uri });
            } else {
                addNote(courseId as string, { heading: title, content: description, pdfUrl: pdfFile?.uri });
            }
        } else if (type === 'Project') {
            if (!title) return Alert.alert('Error', 'Title is heavily required');
            const projectData = { 
                name: title, 
                techStack, 
                details: projectDetails, 
                status, 
                deadline, 
                githubLink,
                lastEdited: new Date().toISOString()
            };
            console.log('Saving Project:', projectData);
            if (editingId) {
                updateProject(courseId as string, editingId as string, projectData);
            } else {
                addProject(courseId as string, projectData);
            }
        }
        router.back();
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setPdfFile(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setDeadline(format(selectedDate, 'dd-MM-yyyy'));
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                    {editingId ? 'Edit' : 'Add'} {type}
                </Text>
                <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <Text style={[styles.saveButtonText, { color: textColor }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: textColor }]}>Title *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter title..."
                            placeholderTextColor={subtextColor}
                        />
                    </View>

                    {(type === 'Assignment' || type === 'Note') && (
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: textColor }]}>Import PDF</Text>
                            <TouchableOpacity 
                                style={[styles.pdfBox, { backgroundColor: inputBackground, borderColor }]} 
                                onPress={pickDocument}
                            >
                                <Ionicons name="document-attach-outline" size={24} color={subtextColor} />
                                <Text style={{ color: subtextColor, marginLeft: 8 }}>
                                    {pdfFile ? pdfFile.name : 'Select PDF...'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {(type === 'Assignment' || type === 'Note') && (
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: textColor }]}>{type === 'Note' ? 'Content' : 'Description'}</Text>
                            <TextInput
                                style={[styles.inputArea, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Write here..."
                                placeholderTextColor={subtextColor}
                                multiline
                            />
                        </View>
                    )}

                    {type === 'Project' && (
                        <>
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: textColor }]}>Status</Text>
                                <View style={styles.statusRow}>
                                    {['Pending', 'In Progress', 'Completed'].map((s) => (
                                        <TouchableOpacity 
                                            key={s}
                                            onPress={() => setStatus(s as any)}
                                            style={[
                                                styles.statusButton, 
                                                { backgroundColor: status === s ? '#7C6AF7' : inputBackground }
                                            ]}
                                        >
                                            <Text style={{ color: status === s ? '#FFFFFF' : subtextColor, fontSize: 12, fontWeight: '700' }}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: textColor }]}>Deadline</Text>
                                <TouchableOpacity 
                                    onPress={() => setShowDatePicker(true)}
                                    style={[styles.input, { backgroundColor: inputBackground, borderColor, justifyContent: 'center' }]}
                                >
                                    <Text style={{ color: deadline ? textColor : subtextColor }}>
                                        {deadline || 'Select Date (DD-MM-YYYY)'}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onDateChange}
                                        themeVariant={isDark ? 'dark' : 'light'}
                                    />
                                )}
                            </View>
                            <View style={[styles.formGroup, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                <Text style={[styles.label, { color: textColor }]}>Include GitHub Repository</Text>
                                <Switch
                                    value={includeGithub}
                                    onValueChange={setIncludeGithub}
                                    trackColor={{ false: isDark ? '#1E2B3C' : '#E2E8F0', true: '#7C6AF7' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>

                            {includeGithub && (
                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: textColor }]}>GitHub Link</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                                        value={githubLink}
                                        onChangeText={setGithubLink}
                                        placeholder="https://github.com/..."
                                        placeholderTextColor={subtextColor}
                                    />
                                </View>
                            )}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: textColor }]}>Tech Stack</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                                    value={techStack}
                                    onChangeText={setTechStack}
                                    placeholder="e.g. React, Node..."
                                    placeholderTextColor={subtextColor}
                                />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: textColor }]}>Project Details</Text>
                                <TextInput
                                    style={[styles.inputArea, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                                    value={projectDetails}
                                    onChangeText={setProjectDetails}
                                    placeholder="Write details..."
                                    placeholderTextColor={subtextColor}
                                    multiline
                                />
                            </View>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        fontWeight: '600',
    },
    content: {
        padding: 24,
        gap: 20,
    },
    formGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    inputArea: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        height: 150,
        textAlignVertical: 'top',
    },
    pdfBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
