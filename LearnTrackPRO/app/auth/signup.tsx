import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';


export default function SignupScreen() {
    const router = useRouter();
    const { signup } = useAuth();
    const { isDark } = useTheme();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const backgroundColor = isDark ? '#0D1117' : '#F8FAFC';
    const cardBackground = isDark ? '#161D2A' : '#FFFFFF';
    const textColor = isDark ? '#E4E9F4' : '#0F172A';
    const subtextColor = isDark ? '#6A80A4' : '#64748B';
    const inputBackground = isDark ? '#1E2B3C' : '#F1F5F9';
    const borderColor = isDark ? '#273548' : '#E2E8F0';

    const handleSignup = async () => {
        const { name, email, password, confirmPassword } = formData;

        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        const result = await signup({ name, email }, password);
        setIsLoading(false);

        if (result.success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Signup Failed', result.error || 'Please try again later.');
        }
    };

    const updateFormData = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: textColor }]}>Create Account</Text>
                        <Text style={[styles.headerSubtitle, { color: subtextColor }]}>Start tracking your academic journey</Text>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: cardBackground }]}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: subtextColor }]}>Full Name *</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor }]}>
                                <Ionicons name="person-outline" size={20} color={subtextColor} />
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={subtextColor}
                                    value={formData.name}
                                    onChangeText={(value) => updateFormData('name', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: subtextColor }]}>Email *</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor }]}>
                                <Ionicons name="mail-outline" size={20} color={subtextColor} />
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="you@example.com"
                                    placeholderTextColor={subtextColor}
                                    value={formData.email}
                                    onChangeText={(value) => updateFormData('email', value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: subtextColor }]}>Password *</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={subtextColor} />
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="Create a password"
                                    placeholderTextColor={subtextColor}
                                    value={formData.password}
                                    onChangeText={(value) => updateFormData('password', value)}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    textContentType="oneTimeCode"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={subtextColor} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: subtextColor }]}>Confirm Password *</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={subtextColor} />
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={subtextColor}
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    textContentType="oneTimeCode"
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={subtextColor} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            <Text style={styles.signupButtonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
                        </TouchableOpacity>
                        <View style={styles.loginContainer}>
                            <Text style={[styles.loginText, { color: subtextColor }]}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    formCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    signupButton: {
        backgroundColor: '#7C6AF7',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    signupButtonDisabled: {
        opacity: 0.6,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        color: '#7C6AF7',
        fontWeight: '600',
    },
});
