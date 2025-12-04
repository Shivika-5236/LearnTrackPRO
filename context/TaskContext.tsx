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
    priority: TaskPriority;
    status: TaskStatus;
}

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'>) => void;
    deleteTask: (id: string) => void;
    updateTaskStatus: (id: string, status: TaskStatus) => void;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
    refreshTasks: () => void;
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
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);

    // Load tasks when user changes
    useEffect(() => {
        if (user) {
            refreshTasks();
        } else {
            setTasks([]);
        }
    }, [user]);

    const refreshTasks = () => {
        if (!user) return;
        const loadedTasks = taskService.getTasksByUserId(user.id);
        setTasks(loadedTasks);
    };

    const addTask = (newTask: Omit<Task, 'id'>) => {
        if (!user) return;

        const taskId = taskService.createTask(user.id, newTask);
        if (taskId) {
            refreshTasks();
        }
    };

    const deleteTask = (id: string) => {
        taskService.deleteTask(parseInt(id));
        refreshTasks();
    };

    const updateTaskStatus = (id: string, status: TaskStatus) => {
        taskService.updateTaskStatus(parseInt(id), status);
        refreshTasks();
    };

    const updateTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
        taskService.updateTask(parseInt(id), updates);
        refreshTasks();
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                deleteTask,
                updateTaskStatus,
                updateTask,
                refreshTasks,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};
