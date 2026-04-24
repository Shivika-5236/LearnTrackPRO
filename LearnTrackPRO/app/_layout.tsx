import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack as RouterStack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { SidebarProvider } from '@/components/sidebar-context';
import { TaskProvider } from '@/context/TaskContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';

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
      <RouterStack screenOptions={{
        headerBackTitleVisible: false,
      }}>
        <RouterStack.Screen name="index" options={{ headerShown: false }} />
        <RouterStack.Screen
          name="auth/login"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'none'
          }}
        />
        <RouterStack.Screen
          name="auth/signup"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'none'
          }}
        />
        <RouterStack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <RouterStack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <RouterStack.Screen
          name="courses/[courseId]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <RouterStack.Screen
          name="courses/assignment-details"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <RouterStack.Screen
          name="courses/project-details"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <RouterStack.Screen name="task-details" options={{ presentation: 'card', title: 'Task Details' }} />
        <RouterStack.Screen name="study/session" options={{ headerShown: false, presentation: 'card' }} />
        <RouterStack.Screen name="study/history" options={{ headerShown: false, presentation: 'card' }} />
        <RouterStack.Screen name="study/upcoming" options={{ headerShown: false, presentation: 'card' }} />
        <RouterStack.Screen name="study/sessions" options={{ headerShown: false, presentation: 'card' }} />
        <RouterStack.Screen name="study/create-block" options={{ headerShown: false, presentation: 'card' }} />
        <RouterStack.Screen name="tasks/see-all" options={{ headerShown: false, presentation: 'card' }} />
        <RouterStack.Screen name="tasks/create-task" options={{ headerShown: false, presentation: 'card' }} />
      </RouterStack>
      <Sidebar />
      <ChatBot />
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
