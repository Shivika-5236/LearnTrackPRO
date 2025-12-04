import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';

export default function SessionScreen() {
    const { blockId } = useLocalSearchParams();
    const router = useRouter();
    const { upcomingBlocks, updateFocusBlock, deleteFocusBlock, addSession } = useStudy();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
    const textColor = isDark ? '#ECEDEE' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const inputBackground = isDark ? '#1E293B' : '#F8FAFC';
    const borderColor = isDark ? '#334155' : '#E2E8F0';

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
                        <TouchableOpacity onPress={saveChanges} style={[styles.button, styles.primaryButton, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]}>
                            <Text style={styles.primaryButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Focus Session</Text>
                <TouchableOpacity onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.timerCircle, { borderColor: block.color, backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                    <Text style={[styles.timerText, { color: textColor }]}>{formatTime(timeLeft)}</Text>
                    <Text style={[styles.timerLabel, { color: subtextColor }]}>{isActive ? (isPaused ? 'Paused' : 'Focusing') : 'Ready'}</Text>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.blockTitle, { color: textColor }]}>{block.title}</Text>
                    <Text style={[styles.blockDetails, { color: subtextColor }]}>{block.details}</Text>
                    <Text style={[styles.blockTime, { color: subtextColor }]}>
                        Scheduled for: {new Date(block.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {block.time}
                    </Text>
                </View>

                {!isActive ? (
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.editButton} onPress={startEditing}>
                            <Text style={styles.editButtonText}>Edit Block</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.startButton, { backgroundColor: block.color }]} onPress={handleStart}>
                            <Text style={styles.startButtonText}>Start Session</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.activeActions}>
                            <TouchableOpacity style={styles.flagButton} onPress={handleFlag}>
                                <Ionicons name="flag-outline" size={24} color="#0F172A" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.pauseButton, { backgroundColor: block.color }]} onPress={handlePause}>
                                <Ionicons name={isPaused ? "play" : "pause"} size={32} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                                <Ionicons name="stop" size={24} color="#EF4444" />
                            </TouchableOpacity>
                        </View>

                        {/* Flag History */}
                        {flaggedTimes.length > 0 && (
                            <View style={styles.flagHistory}>
                                <Text style={[styles.flagHistoryTitle, { color: subtextColor }]}>Flagged Timestamps:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flagList}>
                                    {flaggedTimes.map((timestamp, index) => (
                                        <View key={index} style={[styles.flagChip, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                                            <Ionicons name="flag" size={12} color="#5B6BFA" />
                                            <Text style={[styles.flagText, { color: textColor }]}>{timestamp}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </>
                )}
            </View>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 40,
    },
    timerCircle: {
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
    },
    timerText: {
        fontSize: 56,
        fontWeight: '800',
        color: '#0F172A',
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        fontSize: 18,
        color: '#64748B',
        marginTop: 8,
        fontWeight: '500',
    },
    info: {
        alignItems: 'center',
        gap: 8,
    },
    blockTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
    },
    blockDetails: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
    blockTime: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 4,
    },
    actions: {
        width: '100%',
        gap: 16,
    },
    editButton: {
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    startButton: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    activeActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        width: '100%',
    },
    pauseButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    stopButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flagButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editContainer: {
        padding: 24,
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#F1F5F9',
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
        backgroundColor: '#E2E8F0',
    },
    primaryButton: {
        backgroundColor: '#0F172A',
    },
    buttonText: {
        fontWeight: '600',
        color: '#475569',
    },
    primaryButtonText: {
        fontWeight: '600',
        color: '#FFFFFF',
    },
    flagHistory: {
        width: '100%',
        marginTop: 24,
        gap: 8,
    },
    flagHistoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    flagList: {
        maxHeight: 60,
    },
    flagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    flagText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
