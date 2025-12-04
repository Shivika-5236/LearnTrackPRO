import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface CalendarPickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    initialDate?: Date;
}

const { width } = Dimensions.get('window');

export default function CalendarPicker({ visible, onClose, onConfirm, initialDate }: CalendarPickerProps) {
    const { isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
    const [currentMonth, setCurrentMonth] = useState(initialDate ? initialDate.getMonth() : new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate ? initialDate.getFullYear() : new Date().getFullYear());

    const backgroundColor = isDark ? '#1E293B' : '#FFFFFF';
    const textColor = isDark ? '#ECEDEE' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? '#334155' : '#E2E8F0';
    const selectedColor = '#5B6BFA';
    const todayColor = isDark ? '#334155' : '#F1F5F9';

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthsShort = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const handlePreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handlePreviousYear = () => {
        setCurrentYear(currentYear - 1);
    };

    const handleNextYear = () => {
        setCurrentYear(currentYear + 1);
    };

    const handleDayPress = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(newDate);
    };

    const handleConfirm = () => {
        onConfirm(selectedDate);
        onClose();
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear();
    };

    const calendarDays = generateCalendarDays();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <View style={[styles.container, { backgroundColor, borderColor }]}>
                        {/* Header with Month and Year selectors */}
                        <View style={styles.header}>
                            <View style={styles.monthSelector}>
                                <TouchableOpacity onPress={handlePreviousMonth} style={styles.arrowButton}>
                                    <Ionicons name="chevron-back" size={16} color={subtextColor} />
                                </TouchableOpacity>
                                <View style={[styles.monthButton, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                                    <Text style={[styles.monthText, { color: textColor }]}>{months[currentMonth]}</Text>
                                    <Ionicons name="chevron-down" size={14} color={subtextColor} />
                                </View>
                                <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
                                    <Ionicons name="chevron-forward" size={16} color={subtextColor} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.yearSelector}>
                                <TouchableOpacity onPress={handlePreviousYear} style={styles.arrowButton}>
                                    <Ionicons name="chevron-back" size={16} color={subtextColor} />
                                </TouchableOpacity>
                                <View style={[styles.yearButton, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                                    <Text style={[styles.yearText, { color: textColor }]}>{currentYear}</Text>
                                    <Ionicons name="chevron-down" size={14} color={subtextColor} />
                                </View>
                                <TouchableOpacity onPress={handleNextYear} style={styles.arrowButton}>
                                    <Ionicons name="chevron-forward" size={16} color={subtextColor} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Weekday headers */}
                        <View style={styles.weekDaysContainer}>
                            {weekDays.map((day) => (
                                <View key={day} style={styles.weekDay}>
                                    <Text style={[styles.weekDayText, { color: subtextColor }]}>{day}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        <View style={styles.calendarGrid}>
                            {calendarDays.map((day, index) => {
                                if (day === null) {
                                    return <View key={`empty-${index}`} style={styles.dayCell} />;
                                }

                                const selected = isSelected(day);
                                const today = isToday(day);

                                return (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayCell,
                                            today && !selected && { backgroundColor: todayColor },
                                            selected && { backgroundColor: selectedColor },
                                        ]}
                                        onPress={() => handleDayPress(day)}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                { color: textColor },
                                                selected && { color: '#FFFFFF', fontWeight: '700' },
                                            ]}
                                        >
                                            {day < 10 ? `0${day}` : day}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.button, styles.closeButton, { backgroundColor: isDark ? '#334155' : '#FEF2F2' }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.buttonText, { color: isDark ? subtextColor : '#EF4444' }]}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton, { backgroundColor: isDark ? '#10B981' : '#D1FAE5' }]}
                                onPress={handleConfirm}
                            >
                                <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#10B981' }]}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: Math.min(width - 40, 380),
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    monthSelector: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    yearSelector: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    arrowButton: {
        padding: 4,
    },
    monthButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
    },
    yearButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
    },
    monthText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
    },
    yearText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDay: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    weekDayText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    dayCell: {
        width: (Math.min(width - 40, 380) - 60) / 7,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0F172A',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#FEF2F2',
    },
    confirmButton: {
        backgroundColor: '#D1FAE5',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
