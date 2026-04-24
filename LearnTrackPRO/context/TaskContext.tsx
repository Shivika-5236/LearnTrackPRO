import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import taskService from '@/services/taskService';
import { useAuth } from './AuthContext';

export type TaskStatus = 'Not started' | 'Doing' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
    id: string;
    title: string;
    details?: string;
    deadline?: string;
    parsedDeadline?: string;
    priority: TaskPriority;
    status: TaskStatus;
    courseId?: string;
    completedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}


interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>;
    getTasksByCourse: (courseId: string) => Task[];
    refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const { user, refreshUser } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (user) {
            refreshTasks();
        } else {
            setTasks([]);
        }
    }, [user]);

    const refreshTasks = async () => {
        if (!user) return;
        const loadedTasks = await taskService.getTasksByUserId();
        setTasks(loadedTasks);
    };

    const addTask = async (newTask: Omit<Task, 'id'>) => {
        if (!user) return;
        const created = await taskService.createTask(newTask);
        if (created) await refreshTasks();
    };

    const deleteTask = async (id: string) => {
        await taskService.deleteTask(id);
        await refreshTasks();
    };

    const updateTaskStatus = async (id: string, status: TaskStatus) => {
        await taskService.updateTask(id, { status });
        await refreshTasks();
        if (status === 'Completed') {
            await refreshUser();
        }
    };

    const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
        await taskService.updateTask(id, updates);
        await refreshTasks();
    };

    const getTasksByCourse = (courseId: string): Task[] => {
        return tasks.filter(t => t.courseId === courseId);
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                deleteTask,
                updateTaskStatus,
                updateTask,
                getTasksByCourse,
                refreshTasks,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};
