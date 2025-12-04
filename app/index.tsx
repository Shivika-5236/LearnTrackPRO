import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';

        if (!isAuthenticated) {
            // Force redirect to login if not authenticated
            if (!inAuthGroup) {
                router.replace('/auth/login');
            }
        } else {
            // Force redirect to main app if authenticated
            if (inAuthGroup) {
                router.replace('/(tabs)');
            }
        }
    }, [isAuthenticated, isLoading, segments]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' }}>
            <ActivityIndicator size="large" color="#5B6BFA" />
        </View>
    );
}
