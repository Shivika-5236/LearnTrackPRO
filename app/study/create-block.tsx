import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { useTheme } from '@/context/ThemeContext';
import CalendarPicker from '@/components/CalendarPicker';

export default function CreateBlockScreen() {
    const router = useRouter();
    const { addFocusBlock } = useStudy();
    const { isDark } = useTheme();

    const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
    const textColor = isDark ? '#ECEDEE' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const inputBackground = isDark ? '#1E293B' : '#F8FAFC';
    const borderColor = isDark ? '#334155' : '#E2E8F0';

    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [hours, setHours] = useState('12');
    const [minutes, setMinutes] = useState('00');

    const handleSave = async () => {
        if (!title || !time || !duration) {
            Alert.alert('Validation Error', 'Please fill in all mandatory fields.');
            return;
        }

        const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const dayStr = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });

        addFocusBlock({
            title,
            details,
            day: dayStr,
            date: dateStr,
            time,
            duration: parseInt(duration),
            color: '#5B6BFA', // Default color for now
        });

        Alert.alert('Success', 'Study session created!');
        router.back();
    };

    const handleDateConfirm = (date: Date) => {
        setSelectedDate(date);
    };

    const handleTimeConfirm = () => {
        const paddedHours = hours.padStart(2, '0');
        const paddedMinutes = minutes.padStart(2, '0');
        const formattedTime = `${paddedHours}:${paddedMinutes}`;
        setTime(formattedTime);
        setShowTimePicker(false);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>New Focus Block</Text>
                <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: subtextColor }]}>Session Name *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Deep Work"
                        placeholderTextColor={subtextColor}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: subtextColor }]}>Details</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                        value={details}
                        onChangeText={setDetails}
                        placeholder="What are you studying?"
                        placeholderTextColor={subtextColor}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: subtextColor }]}>Date *</Text>
                    <TouchableOpacity
                        style={[styles.input, styles.dateButton, { backgroundColor: inputBackground, borderColor }]}
                        onPress={() => setShowCalendar(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color={subtextColor} />
                        <Text style={[styles.dateText, { color: textColor }]}>
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: subtextColor }]}>Time *</Text>
                        <TouchableOpacity
                            style={[styles.input, styles.dateButton, { backgroundColor: inputBackground, borderColor }]}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Ionicons name="time-outline" size={20} color={subtextColor} />
                            <Text style={[styles.dateText, { color: textColor }]}>
                                {time || 'Select time'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: subtextColor }]}>Duration (min) *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                            value={duration}
                            onChangeText={setDuration}
                            placeholder="e.g. 60"
                            keyboardType="numeric"
                            placeholderTextColor={subtextColor}
                        />
                    </View>
                </View>
            </ScrollView>

            <CalendarPicker
                visible={showCalendar}
                onClose={() => setShowCalendar(false)}
                onConfirm={handleDateConfirm}
                initialDate={selectedDate}
            />

            {/* Time Picker Modal */}
            <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowTimePicker(false)}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.timePickerContainer, { backgroundColor, borderColor }]}>
                            <Text style={[styles.timePickerTitle, { color: textColor }]}>Select Time</Text>
                            <View style={styles.timePickerContent}>
                                <View style={styles.timePart}>
                                    <Text style={[styles.timeLabel, { color: subtextColor }]}>Hours</Text>
                                    <TextInput
                                        style={[styles.timeInput, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                                        value={hours}
                                        onChangeText={(text) => {
                                            const num = parseInt(text) || 0;
                                            if (num >= 0 && num <= 23) setHours(text);
                                        }}
                                        keyboardType="numeric"
                                        maxLength={2}
                                    />
                                </View>
                                <Text style={[styles.timeSeparator, { color: textColor }]}>:</Text>
                                <View style={styles.timePart}>
                                    <Text style={[styles.timeLabel, { color: subtextColor }]}>Minutes</Text>
                                    <TextInput
                                        style={[styles.timeInput, { backgroundColor: inputBackground, borderColor, color: textColor }]}
                                        value={minutes}
                                        onChangeText={(text) => {
                                            const num = parseInt(text) || 0;
                                            if (num >= 0 && num <= 59) setMinutes(text);
                                        }}
                                        keyboardType="numeric"
                                        maxLength={2}
                                    />
                                </View>
                            </View>
                            <View style={styles.timePickerActions}>
                                <TouchableOpacity
                                    style={[styles.timeButton, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                                    onPress={() => setShowTimePicker(false)}
                                >
                                    <Text style={[styles.timeButtonText, { color: subtextColor }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.timeButton, styles.confirmTimeButton, { backgroundColor: isDark ? '#5B6BFA' : '#0F172A' }]}
                                    onPress={handleTimeConfirm}
                                >
                                    <Text style={styles.confirmTimeButtonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
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
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateText: {
        fontSize: 16,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timePickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: 300,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    timePickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    timePickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
    },
    timePart: {
        alignItems: 'center',
        gap: 8,
    },
    timeLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    timeInput: {
        width: 60,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 32,
        fontWeight: '700',
        marginTop: 20,
    },
    timePickerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    timeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmTimeButton: {
        backgroundColor: '#0F172A',
    },
    timeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    confirmTimeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
