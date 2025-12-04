import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { SidebarProvider } from '@/components/sidebar-context';
import { TaskProvider } from '@/context/TaskContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

import Sidebar from '@/components/Sidebar';

import { StudyProvider } from '@/context/StudyContext';

import { CourseProvider } from '@/context/CourseContext';
import CustomSplash from '@/components/CustomSplash';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/login"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'none'
          }}
        />
        <Stack.Screen
          name="auth/signup"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'none'
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen
          name="courses/[courseId]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="courses/assignment-details"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="courses/project-details"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen name="task-details" options={{ presentation: 'card', title: 'Task Details' }} />
        <Stack.Screen name="study/session" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="study/history" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="study/upcoming" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="study/create-block" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="tasks/see-all" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="tasks/create-task" options={{ headerShown: false, presentation: 'card' }} />
      </Stack>
      <Sidebar />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide native splash screen immediately
    SplashScreen.hideAsync();
  }, []);

  if (showSplash) {
    return <CustomSplash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <TaskProvider>
            <StudyProvider>
              <SidebarProvider>
                <RootLayoutContent />
              </SidebarProvider>
            </StudyProvider>
          </TaskProvider>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
