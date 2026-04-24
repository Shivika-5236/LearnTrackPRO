import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator,
    Animated,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useCourses } from '@/context/CourseContext';
import { useTasks } from '@/context/TaskContext';
import { useStudy } from '@/context/StudyContext';
import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

// ── Gemini API call ──────────────────────────────────────────────────────────
async function callGemini(messages: { role: string; content: string }[]): Promise<string> {
    // Read key at call time (not module init) to ensure env var is loaded
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

    if (!apiKey) {
        throw new Error('API key missing. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file and restart with --clear.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Build conversation in Gemini format
    const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

    const systemInstruction = messages.find(m => m.role === 'system')?.content || '';

    const body = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
        },
    };

    console.log('[Aria] Calling Gemini, key prefix:', apiKey.slice(0, 10));

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `HTTP ${res.status}`;
        console.warn('[Aria] Gemini error:', msg);
        throw new Error(msg);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response received.';
}


// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ── Quick action chips ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { label: 'Plan my day', icon: 'today-outline' },
    { label: 'What is my highest priority task?', icon: 'alert-circle-outline' },
    { label: 'How many hours did I study this week?', icon: 'time-outline' },
    { label: 'What tasks are due today?', icon: 'calendar-outline' },
];

// ── Main Component ───────────────────────────────────────────────────────────
export default function ChatBot() {
    const { isDark } = useTheme();
    const { courses } = useCourses();
    const { tasks } = useTasks();
    const { recentSessions, upcomingBlocks } = useStudy();
    const { user } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isClearing, setIsClearing] = useState(false);

    const clearChat = () => {
        setMessages([]);
    };

    // ── Theme colors ─────────────────────────────────────────────────────────
    const bg = isDark ? '#0F172A' : '#F8FAFC';
    const card = isDark ? '#161D2A' : '#FFFFFF';
    const border = isDark ? '#273548' : '#E2E8F0';
    const text = isDark ? '#E4E9F4' : '#0F172A';
    const subtext = isDark ? '#6A80A4' : '#64748B';
    const accent = '#7C6AF7';
    const userBubble = accent;
    const botBubble = isDark ? '#1E2B3C' : '#F1F5F9';

    // ── Build system prompt with live app data ────────────────────────────────
    const buildSystemPrompt = useCallback(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Tasks summary
        const pendingTasks = tasks.filter(t => t.status !== 'Completed');
        const todayTasks = pendingTasks.filter(t => {
            if (!t.deadline && !t.parsedDeadline) return false;
            const dl = t.parsedDeadline || t.deadline || '';
            return dl.startsWith(todayStr);
        });
        const highPriorityTasks = pendingTasks
            .filter(t => t.priority === 'High')
            .slice(0, 5);

        const tasksSummary = pendingTasks
            .slice(0, 10)
            .map(t => `  - "${t.title}" | Priority: ${t.priority} | Status: ${t.status} | Deadline: ${t.parsedDeadline || t.deadline || 'None'}`)
            .join('\n');

        // Courses summary
        const coursesSummary = courses
            .slice(0, 8)
            .map(c => `  - "${c.title}" | Tag: ${c.tag} | Progress: ${c.progress}% | Assignments: ${c.assignments?.length ?? 0}`)
            .join('\n');

        // Recent study sessions
        const sessionsSummary = recentSessions
            .slice(0, 10)
            .map(s => `  - Course: "${s.course}" | Duration: ${s.duration} | Focus: "${s.focus}" | Date: ${s.date instanceof Date ? s.date.toDateString() : s.date}`)
            .join('\n');

        // Study hours this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekSessions = recentSessions.filter(s => {
            const d = s.date instanceof Date ? s.date : new Date(s.date);
            return d >= oneWeekAgo;
        });
        const totalMinsThisWeek = thisWeekSessions.reduce((acc, s) => {
            const match = s.duration?.match(/(\d+)/);
            return acc + (match ? parseInt(match[1]) : 0);
        }, 0);

        // Upcoming blocks
        const upcomingStr = upcomingBlocks
            .slice(0, 5)
            .map(b => `  - "${b.title}" | ${b.day} ${b.date} @ ${b.time} | ${b.duration} min`)
            .join('\n');

        return `You are Aria, the intelligent in-app study assistant for LearnTrack Pro — an academic organizer.

TODAY: ${today.toDateString()} (${today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
USER: ${user?.name || 'Student'} | Streak: ${user?.streak ?? 0} days | Longest Streak: ${user?.longestStreak ?? 0} days

=== LIVE APP DATA ===

COURSES (${courses.length} total):
${coursesSummary || '  No courses yet.'}

PENDING TASKS (${pendingTasks.length} total, showing up to 10):
${tasksSummary || '  No pending tasks.'}

TASKS DUE TODAY (${todayTasks.length}):
${todayTasks.map(t => `  - "${t.title}" | ${t.priority} priority`).join('\n') || '  None today.'}

HIGH PRIORITY TASKS:
${highPriorityTasks.map(t => `  - "${t.title}" | Deadline: ${t.parsedDeadline || t.deadline || 'None'}`).join('\n') || '  None.'}

STUDY THIS WEEK: ~${Math.round(totalMinsThisWeek / 60 * 10) / 10} hours across ${thisWeekSessions.length} sessions

RECENT SESSIONS (last 10):
${sessionsSummary || '  No sessions logged yet.'}

UPCOMING FOCUS BLOCKS:
${upcomingStr || '  None scheduled.'}

=== YOUR BEHAVIOR RULES ===
- Be concise and direct. No fluff.
- Always use real user data above — never make up numbers.
- Prioritize urgency: deadlines first, then priority.
- If no data exists, say so and suggest what to do.
- When asked to plan, give a concrete schedule.
- When asked about tasks/sessions, give specific answers using the data.
- Tone: friendly, efficient, slightly motivating. No excessive emojis.
- If the user has studied less than 3 hours this week, do NOT say "Keep up the great work" or similar high-praise phrases. Instead, be encouraging but firm, and suggest they start a study session or tackle a pending task.
- Keep responses short. Use bullet points where helpful.
- If user shares text to improve, fix grammar/clarity/structure without changing meaning.`;
    }, [user, courses, tasks, recentSessions, upcomingBlocks]);

    // ── Send message ─────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const conversationHistory = [
                { role: 'system', content: buildSystemPrompt() },
                ...messages.map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: text.trim() },
            ];

            const reply = await callGemini(conversationHistory);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: reply,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error: any) {
            console.warn('[Aria] Error:', error?.message);
            const errMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Error: ${error?.message || 'Could not connect. Please try again.'}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsLoading(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [isLoading, messages, buildSystemPrompt]);

    // ── FAB press animation ──────────────────────────────────────────────────
    const handleFabPress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start(() => setIsOpen(true));
    };

    // ── Render a message bubble ──────────────────────────────────────────────
    const renderMessage = (msg: Message) => {
        const isUser = msg.role === 'user';
        return (
            <View
                key={msg.id}
                style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowBot,
                ]}
            >
                {!isUser && (
                    <View style={[styles.avatar, { backgroundColor: accent }]}>
                        <Ionicons name="sparkles" size={12} color="#FFF" />
                    </View>
                )}
                <View
                    style={[
                        styles.bubble,
                        isUser
                            ? [styles.bubbleUser, { backgroundColor: userBubble }]
                            : [styles.bubbleBot, { backgroundColor: botBubble }],
                    ]}
                >
                    <Text
                        style={[
                            styles.bubbleText,
                            { color: isUser ? '#FFFFFF' : text },
                        ]}
                    >
                        {msg.content}
                    </Text>
                    <Text style={[styles.timestamp, { color: isUser ? 'rgba(255,255,255,0.6)' : subtext }]}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <>
            {/* ── Floating Action Button ── */}
            <Animated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity
                    style={[styles.fabButton, { backgroundColor: accent }]}
                    onPress={handleFabPress}
                    activeOpacity={0.9}
                >
                    <Ionicons name="sparkles" size={24} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>

            {/* ── Chat Modal ── */}
            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setIsOpen(false)}
                    />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={[styles.chatContainer, { backgroundColor: card, borderColor: border }]}
                    >
                        {/* Header */}
                        <View style={[styles.chatHeader, { borderBottomColor: border }]}>
                            <View style={styles.chatHeaderLeft}>
                                <View style={[styles.headerAvatar, { backgroundColor: accent }]}>
                                    <Ionicons name="sparkles" size={16} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={[styles.chatTitle, { color: text }]}>Aria</Text>
                                    <Text style={[styles.chatSubtitle, { color: subtext }]}>Your study assistant</Text>
                                </View>
                            </View>
                            <View style={styles.chatHeaderRight}>
                                {messages.length > 0 && (
                                    <TouchableOpacity
                                        onPress={clearChat}
                                        style={[styles.headerBtn, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9', marginRight: 8 }]}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="trash-outline" size={16} color={subtext} />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => setIsOpen(false)}
                                    style={[styles.headerBtn, { backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9' }]}
                                >
                                    <Ionicons name="close" size={18} color={subtext} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Messages */}
                        <ScrollView
                            ref={scrollRef}
                            style={styles.messagesArea}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                        >
                            {messages.length === 0 && (
                                <View style={styles.emptyState}>
                                    <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#1E2B3C' : '#EEF2FF' }]}>
                                        <Ionicons name="sparkles" size={28} color={accent} />
                                    </View>
                                    <Text style={[styles.emptyTitle, { color: text }]}>Hi {user?.name?.split(' ')[0] || 'there'}!</Text>
                                    <Text style={[styles.emptySubtitle, { color: subtext }]}>
                                        Ask me anything about your tasks, courses, or study plan.
                                    </Text>
                                    {/* Quick action chips */}
                                    <View style={styles.chips}>
                                        {QUICK_ACTIONS.map(action => (
                                            <TouchableOpacity
                                                key={action.label}
                                                style={[styles.chip, { backgroundColor: isDark ? '#1E2B3C' : '#EEF2FF', borderColor: isDark ? '#2D3D55' : '#C7D2FE' }]}
                                                onPress={() => sendMessage(action.label)}
                                            >
                                                <Ionicons name={action.icon as any} size={13} color={accent} />
                                                <Text style={[styles.chipText, { color: accent }]} numberOfLines={1}>{action.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {messages.map(renderMessage)}

                            {isLoading && (
                                <View style={[styles.messageRow, styles.messageRowBot]}>
                                    <View style={[styles.avatar, { backgroundColor: accent }]}>
                                        <Ionicons name="sparkles" size={12} color="#FFF" />
                                    </View>
                                    <View style={[styles.bubble, styles.bubbleBot, { backgroundColor: botBubble }]}>
                                        <ActivityIndicator size="small" color={accent} />
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input */}
                        <View style={[styles.inputRow, { borderTopColor: border, backgroundColor: card }]}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: text,
                                        backgroundColor: isDark ? '#1E2B3C' : '#F1F5F9',
                                        borderColor: isDark ? '#273548' : '#E2E8F0',
                                    },
                                ]}
                                placeholder="Ask Aria anything..."
                                placeholderTextColor={subtext}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={1000}
                                onSubmitEditing={() => sendMessage(inputText)}
                                blurOnSubmit={false}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendBtn,
                                    { backgroundColor: inputText.trim() && !isLoading ? accent : (isDark ? '#273548' : '#E2E8F0') },
                                ]}
                                onPress={() => sendMessage(inputText)}
                                disabled={!inputText.trim() || isLoading}
                            >
                                <Ionicons
                                    name="arrow-up"
                                    size={18}
                                    color={inputText.trim() && !isLoading ? '#FFF' : subtext}
                                />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // FAB
    fab: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        zIndex: 2000,
    },
    fabButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#7C6AF7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    chatContainer: {
        height: height * 0.78,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
        overflow: 'hidden',
    },

    // Header
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    chatHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    chatSubtitle: {
        fontSize: 12,
        marginTop: 1,
    },
    chatHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Messages
    messagesArea: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        gap: 12,
        flexGrow: 1,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingTop: 24,
        gap: 8,
    },
    emptyIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptySubtitle: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        maxWidth: 260,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginTop: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        maxWidth: (width - 80) / 2,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
        flexShrink: 1,
    },

    // Message rows & bubbles
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        maxWidth: '100%',
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    messageRowBot: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    bubble: {
        maxWidth: width * 0.68,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        gap: 4,
    },
    bubbleUser: {
        borderBottomRightRadius: 4,
    },
    bubbleBot: {
        borderBottomLeftRadius: 4,
    },
    bubbleText: {
        fontSize: 14,
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 10,
        alignSelf: 'flex-end',
    },

    // Input
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 42,
        maxHeight: 100,
        borderRadius: 21,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
