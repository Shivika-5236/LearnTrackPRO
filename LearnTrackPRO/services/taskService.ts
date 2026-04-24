import api from './database';
import { Task } from '@/context/TaskContext';

export const taskService = {
  // Get all tasks for the logged-in user
  getTasksByUserId: async (): Promise<Task[]> => {
    try {
      const { data } = await api.get<Task[]>('/api/tasks');
      return data.map(t => ({ ...t, id: (t as any)._id?.toString() || t.id }));
    } catch (error: any) {
      console.error('Error getting tasks:', error.response?.data?.message || error.message);
      return [];
    }
  },
  
  // Get tasks for a specific course
  getTasksByCourse: async (courseId: string): Promise<Task[]> => {
    try {
      const { data } = await api.get<Task[]>(`/api/tasks/by-course/${courseId}`);
      return data.map(t => ({ ...t, id: (t as any)._id?.toString() || t.id }));
    } catch (error: any) {
      console.error('Error getting course tasks:', error.response?.data?.message || error.message);
      return [];
    }
  },

  // Create new task
  createTask: async (task: Omit<Task, 'id'>): Promise<Task | null> => {
    try {
      const { data } = await api.post<Task>('/api/tasks', task);
      return { ...data, id: (data as any)._id?.toString() || data.id };
    } catch (error: any) {
      console.error('Error creating task:', error.response?.data?.message || error.message);
      return null;
    }
  },

  // Update task
  updateTask: async (taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<boolean> => {
    try {
      await api.put(`/api/tasks/${taskId}`, updates);
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error.response?.data?.message || error.message);
      return false;
    }
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<boolean> => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error.response?.data?.message || error.message);
      return false;
    }
  },
};

export default taskService;
