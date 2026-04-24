import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, TextInput, Dimensions, Platform, Linking, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack as RouterStack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

export default function SessionScreen() {
    const { blockId } = useLocalSearchParams();
    const router = useRouter();
    const { upcomingBlocks, updateFocusBlock, deleteFocusBlock, addSession } = useStudy();
    const { isDark, textColor, subtextColor, backgroundColor, cardBackground, borderColor, inputBackground } = useTheme();

    const block = upcomingBlocks.find(b => b.id === blockId);

    const [isActive, setIsActive] = useState(block?.isActive || false);
    const [isPaused, setIsPaused] = useState(block?.isPaused || false);
    const [timeLeft, setTimeLeft] = useState(block ? (block.elapsedTime ? block.duration * 60 - block.elapsedTime : block.duration * 60) : 0);
    const [isEditing, setIsEditing] = useState(false);
    const [flaggedTimes, setFlaggedTimes] = useState<string[]>(block?.flaggedTimes || []);

    // Edit state
    const [editTitle, setEditTitle] = useState('');
    const [editDetails, setEditDetails] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [showPdf, setShowPdf] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (block && !isActive) {
            setTimeLeft(block.duration * 60);
        }
    }, [block, isActive]);

    useEffect(() => {
        if (isActive && !isPaused && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, isPaused, timeLeft]);

    if (!block) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text>Block not found</Text>
                    <TouchableOpacity onPress={() => router.back()}><Text>Go Back</Text></TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStart = () => {
        setIsActive(true);
        setIsPaused(false);

        // Mark as active in database
        updateFocusBlock(block.id, {
            isActive: true,
            isPaused: false,
        });
    };

    const handlePause = () => {
        const newPausedState = !isPaused;
        setIsPaused(newPausedState);

        // Save state to database
        const elapsedTime = block.duration * 60 - timeLeft;
        updateFocusBlock(block.id, {
            isPaused: newPausedState,
            isActive: true,
            elapsedTime,
            flaggedTimes,
        });
    };

    const handleStop = () => {
        Alert.alert('End Session', 'Are you sure you want to end this session?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'End', style: 'destructive', onPress: handleComplete }
        ]);
    };

    const handleComplete = () => {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);

        // Add to history
        addSession({
            course: block.title,
            courseId: block.courseId,
            duration: `${Math.floor((block.duration * 60 - timeLeft) / 60)}m`,
            focus: block.details || 'Focus Session',
            loggedAt: 'Just now',
            color: block.color,
            date: new Date(),
        });

        // Clear active/paused state
        updateFocusBlock(block.id, {
            isActive: false,
            isPaused: false,
            elapsedTime: 0,
            flaggedTimes: [],
        });

        deleteFocusBlock(block.id);

        router.replace('/(tabs)/study');
    };

    const handleDelete = () => {
        Alert.alert('Delete Block', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    deleteFocusBlock(block.id);
                    router.back();
                }
            }
        ]);
    };

    const startEditing = () => {
        setEditTitle(block.title);
        setEditDetails(block.details || '');
        setEditDuration(block.duration.toString());
        setIsEditing(true);
    };

    const saveChanges = () => {
        updateFocusBlock(block.id, {
            title: editTitle,
            details: editDetails,
            duration: parseInt(editDuration) || block.duration,
        });
        setIsEditing(false);
    };

    const handleFlag = () => {
        const elapsedTime = block.duration * 60 - timeLeft;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const newFlags = [...flaggedTimes, timestamp];
        setFlaggedTimes(newFlags);

        // Immediately save to database
        updateFocusBlock(block.id, {
            flaggedTimes: newFlags,
        });

        Alert.alert('Flagged', `Time marked: ${timestamp}`);
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                console.log('Picked PDF:', asset.name, asset.uri);
                await updateFocusBlock(block.id, {
                    pdfUri: asset.uri,
                    pdfName: asset.name,
                });
                Alert.alert('Success', 'PDF attached successfully');
            } else {
                console.log('Picker canceled or no assets');
            }
        } catch (error: any) {
            console.error('Picker error:', error);
            Alert.alert('Error', `Could not pick document: ${error.message}`);
        }
    };

    const openPdf = async () => {
        if (!block.pdfUri) return;
        setShowPdf(true);
    };

    const addTask = async () => {
        if (!newTaskText.trim()) return;
        
        const newTask = {
            id: Date.now().toString(),
            text: newTaskText.trim(),
            completed: false
        };

        const updatedTasks = [...(block.tasks || []), newTask];
        await updateFocusBlock(block.id, { tasks: updatedTasks });
        setNewTaskText('');
        setIsAddingTask(false);
    };

    const toggleTask = async (taskId: string) => {
        const updatedTasks = (block.tasks || []).map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        await updateFocusBlock(block.id, { tasks: updatedTasks });
    };

    const deleteTask = async (taskId: string) => {
        const updatedTasks = (block.tasks || []).filter(t => t.id !== taskId);
        await updateFocusBlock(block.id, { tasks: updatedTasks });
    };

    if (isEditing) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
                <View style={styles.editContainer}>
                    <Text style={[styles.title, { color: textColor }]}>Edit Focus Block</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Title"
                        placeholderTextColor={subtextColor}
                    />
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                        value={editDetails}
                        onChangeText={setEditDetails}
                        placeholder="Details"
                        placeholderTextColor={subtextColor}
                    />
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                        value={editDuration}
                        onChangeText={setEditDuration}
                        placeholder="Duration (min)"
                        placeholderTextColor={subtextColor}
                        keyboardType="numeric"
                    />
                    <View style={styles.row}>
                        <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.button, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                            <Text style={[styles.buttonText, { color: subtextColor }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={saveChanges} style={[styles.button, styles.primaryButton, { backgroundColor: '#7C6AF7' }]}>
                            <Text style={styles.primaryButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <RouterStack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={[styles.customHeader, { backgroundColor, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
                    <Ionicons name="chevron-back" size={26} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerCenterTitle, { color: textColor }]} numberOfLines={1}>
                    {block.title}
                </Text>
                <View style={styles.headerRightGroup}>
                    <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerIconBtn}>
                        <Ionicons name="pencil-outline" size={22} color={subtextColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.headerIconBtn}>
                        <Ionicons name="trash-outline" size={22} color="#E8627A" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Header View Removed, using Stack.Screen */}

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {isEditing && (
                        <View style={styles.titleArea}>
                            <View style={styles.editingHeader}>
                                <TextInput
                                    style={[styles.titleInput, { color: textColor, borderBottomColor: '#7C6AF7' }]}
                                    value={editTitle}
                                    onChangeText={setEditTitle}
                                    placeholder="Session Title"
                                    placeholderTextColor={subtextColor}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={saveChanges} style={[styles.saveButtonSmall, { backgroundColor: '#10B981' }]}>
                                    <Ionicons name="checkmark" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                <View style={styles.timerContainer}>
                    <Svg width="300" height="300" viewBox="0 0 300 300">
                        {/* Background Circle */}
                        <Circle
                            cx="150"
                            cy="150"
                            r="135"
                            stroke={isDark ? '#1E2B3C' : '#F1F5F9'}
                            strokeWidth="10"
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <Circle
                            cx="150"
                            cy="150"
                            r="135"
                            stroke="#5B6AFF"
                            strokeWidth="10"
                            strokeDasharray={`${2 * Math.PI * 135}`}
                            strokeDashoffset={`${2 * Math.PI * 135 * (1 - (timeLeft / (block.duration * 60)))}`}
                            strokeLinecap="round"
                            fill="transparent"
                            transform="rotate(-90 150 150)"
                        />
                    </Svg>
                    <View style={styles.timerTextContainer}>
                        <Text style={[styles.timerText, { color: textColor }]}>{formatTime(timeLeft)}</Text>
                        <Text 
                            style={[
                                styles.timerLabel, 
                                { color: isPaused ? '#A16207' : (isActive ? '#5B6AFF' : '#94A3B8') }
                            ]}
                        >
                            {isActive ? (isPaused ? 'Paused' : 'Focusing') : 'Ready'}
                        </Text>
                    </View>
                </View>

                <View style={styles.info}>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={16} color={subtextColor} />
                            <Text style={[styles.metaText, { color: subtextColor }]}>
                                {new Date(block.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}  {block.time.replace(':', ' ')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.durationRow}>
                        <Ionicons name="time-outline" size={16} color={subtextColor} />
                        <Text style={[styles.durationText, { color: subtextColor }]}>{block.duration} min session</Text>
                    </View>
                </View>

                <View style={[styles.progressCard, { backgroundColor: isDark ? '#161D2A' : '#FFFFFF', borderColor }]}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressTitle, { color: subtextColor }]}>Session progress</Text>
                        <Text style={[styles.progressPercentage, { color: '#5B6AFF' }]}>
                            {Math.round(((block.duration * 60 - timeLeft) / (block.duration * 60)) * 100)}%
                        </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: isDark ? '#273548' : '#F1F5F9' }]}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { 
                                    width: `${((block.duration * 60 - timeLeft) / (block.duration * 60)) * 100}%`,
                                    backgroundColor: '#5B6AFF'
                                }
                            ]} 
                        />
                    </View>
                    <View style={styles.progressFooter}>
                        <Text style={[styles.progressTime, { color: subtextColor }]}>{formatTime(block.duration * 60 - timeLeft)} elapsed</Text>
                        <Text style={[styles.progressTime, { color: subtextColor }]}>{formatTime(timeLeft)} left</Text>
                    </View>
                </View>

                {/* PDF Resources Section */}
                <View style={[styles.resourceCard, { backgroundColor: isDark ? '#161D2A' : '#FFFFFF', borderColor }]}>
                    <View style={styles.resourceHeader}>
                        <Text style={[styles.resourceTitle, { color: subtextColor }]}>Resources</Text>
                        <TouchableOpacity onPress={pickDocument}>
                            <Ionicons name="add-circle-outline" size={24} color="#5B6AFF" />
                        </TouchableOpacity>
                    </View>
                    
                    {block.pdfUri ? (
                        <TouchableOpacity style={styles.pdfItem} onPress={openPdf}>
                            <View style={styles.pdfIcon}>
                                <Ionicons name="document-text" size={24} color="#E8627A" />
                            </View>
                            <View style={styles.pdfInfo}>
                                <Text style={[styles.pdfName, { color: textColor }]} numberOfLines={1}>
                                    {block.pdfName || 'Attached PDF'}
                                </Text>
                                <Text style={[styles.pdfSubtext, { color: subtextColor }]}>Tap to open document</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={subtextColor} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.emptyPdf} onPress={pickDocument}>
                            <Ionicons name="document-attach-outline" size={32} color="#CBD5E1" />
                            <Text style={[styles.emptyPdfText, { color: subtextColor }]}>No PDF attached</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tasks Section */}
                <View style={[styles.taskCard, { backgroundColor: isDark ? '#161D2A' : '#FFFFFF', borderColor }]}>
                    <View style={styles.taskHeader}>
                        <Text style={[styles.taskTitle, { color: subtextColor }]}>Tasks</Text>
                        <TouchableOpacity onPress={() => setIsAddingTask(!isAddingTask)}>
                            <Ionicons name={isAddingTask ? "close-circle" : "add-circle"} size={24} color="#5B6AFF" />
                        </TouchableOpacity>
                    </View>

                    {isAddingTask && (
                        <View style={styles.addTaskRow}>
                            <TextInput
                                style={[styles.taskInput, { backgroundColor: isDark ? '#1E2B3C' : '#F8FAFC', color: textColor }]}
                                placeholder="What needs to be done?"
                                placeholderTextColor={subtextColor}
                                value={newTaskText}
                                onChangeText={setNewTaskText}
                                autoFocus
                                onSubmitEditing={addTask}
                            />
                            <TouchableOpacity style={styles.taskAddBtn} onPress={addTask}>
                                <Ionicons name="checkmark-circle" size={32} color="#5B6AFF" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.taskList}>
                        {(block.tasks || []).map((task: any, index: number) => (
                            <View key={task.id || task._id || index} style={styles.taskItem}>
                                <TouchableOpacity 
                                    style={styles.taskCheckbox} 
                                    onPress={() => toggleTask(task.id || task._id)}
                                >
                                    <Ionicons 
                                        name={task.completed ? "checkbox" : "square-outline"} 
                                        size={24} 
                                        color={task.completed ? "#5B6AFF" : subtextColor} 
                                    />
                                </TouchableOpacity>
                                <Text style={[
                                    styles.taskText, 
                                    { color: textColor, textDecorationLine: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1 }
                                ]}>
                                    {task.text}
                                </Text>
                                <TouchableOpacity onPress={() => deleteTask(task.id || task._id)}>
                                    <Ionicons name="trash-outline" size={18} color="#E8627A" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {(!block.tasks || block.tasks.length === 0) && !isAddingTask && (
                            <View style={styles.emptyTasks}>
                                <Text style={[styles.emptyTasksText, { color: subtextColor }]}>No tasks added yet</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? '#1E2B3C' : '#FFFFFF' }]} onPress={startEditing}>
                    <Ionicons name="pencil-outline" size={20} color={textColor} />
                    <Text style={[styles.actionBtnText, { color: textColor }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.resetBtn, { backgroundColor: isDark ? '#1E2B3C' : '#FFFFFF' }]}
                    onPress={() => setTimeLeft(block.duration * 60)}
                >
                    <Ionicons name="refresh-outline" size={24} color={textColor} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.mainActionBtn, { backgroundColor: '#5B6AFF' }]}
                    onPress={isActive ? (isPaused ? handleStart : handlePause) : handleStart}
                >
                    <Ionicons name={isActive && !isPaused ? "pause" : "play"} size={24} color="#FFFFFF" />
                    <Text style={styles.mainActionText}>{isActive ? (isPaused ? 'Resume' : 'Pause') : 'Start'}</Text>
                </TouchableOpacity>
            </View>

            {/* In-App PDF Viewer Modal */}
            <Modal
                visible={showPdf}
                animationType="slide"
                onRequestClose={() => setShowPdf(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowPdf(false)} style={styles.modalCloseBtn}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: textColor }]} numberOfLines={1}>
                            {block.pdfName || 'Document'}
                        </Text>
                        <TouchableOpacity 
                            onPress={async () => {
                                if (block.pdfUri) await Sharing.shareAsync(block.pdfUri);
                            }}
                            style={styles.modalShareBtn}
                        >
                            <Ionicons name="share-outline" size={24} color={textColor} />
                        </TouchableOpacity>
                    </View>
                    <WebView
                        source={{ uri: block.pdfUri }}
                        style={styles.webview}
                        originWhitelist={['*']}
                        scalesPageToFit={true}
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 10,
        paddingTop: Platform.OS === 'ios' ? 45 : 10,
        borderBottomWidth: 1,
    },
    headerIconBtn: {
        padding: 8,
    },
    headerCenterTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    headerRightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 120,
    },
    timerContainer: {
        width: 300,
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.05,
                shadowRadius: 20,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    timerTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 72,
        fontWeight: '400',
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        fontSize: 18,
        marginTop: 4,
        fontWeight: '600',
    },
    info: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
    },
    blockTitle: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '600',
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    durationText: {
        fontSize: 15,
        fontWeight: '600',
    },
    progressCard: {
        width: width - 40,
        padding: 20,
        borderRadius: 24,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: '800',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressTime: {
        fontSize: 12,
        fontWeight: '600',
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 40,
        gap: 12,
        alignItems: 'center',
    },
    actionBtn: {
        paddingHorizontal: 20,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    resetBtn: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainActionBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#5B6AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    mainActionText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    editContainer: {
        padding: 24,
        gap: 16,
    },
    titleRow: {
        marginBottom: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
        marginTop: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    titleArea: {
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '800',
    },
    editingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    titleInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '800',
        paddingVertical: 4,
        borderBottomWidth: 2,
    },
    saveButtonSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    button: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        borderRadius: 12,
    },
    primaryButton: {
        backgroundColor: '#7C6AF7',
    },
    buttonText: {
        fontWeight: '600',
    },
    primaryButtonText: {
        fontWeight: '600',
        color: '#FFFFFF',
    },
    resourceCard: {
        width: width - 40,
        padding: 20,
        borderRadius: 24,
        marginTop: 16,
    },
    resourceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resourceTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    pdfItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 12,
    },
    pdfIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdfInfo: {
        flex: 1,
    },
    pdfName: {
        fontSize: 14,
        fontWeight: '700',
    },
    pdfSubtext: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    emptyPdf: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    emptyPdfText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 16,
    },
    modalCloseBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    modalShareBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    webview: {
        flex: 1,
    },
    taskCard: {
        width: width - 40,
        padding: 20,
        borderRadius: 24,
        marginTop: 16,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    addTaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    taskInput: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    taskAddBtn: {
        padding: 0,
    },
    taskList: {
        gap: 12,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    taskCheckbox: {
        padding: 2,
    },
    taskText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyTasks: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    emptyTasksText: {
        fontSize: 13,
        fontWeight: '500',
    },
});

