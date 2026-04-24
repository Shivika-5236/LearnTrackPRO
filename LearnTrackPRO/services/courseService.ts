import api from './database';
import { Course, Assignment, Note, Project } from '@/context/CourseContext';

export const courseService = {
  // Get all courses for the logged-in user
  getCoursesByUserId: async (): Promise<Course[]> => {
    try {
      const { data } = await api.get<Course[]>('/api/courses');
      return data;
    } catch (error: any) {
      console.error('Error getting courses:', error.response?.data?.message || error.message);
      return [];
    }
  },

  // Create new course
  createCourse: async (course: Omit<Course, 'id' | 'assignments' | 'notes' | 'projects'>): Promise<Course | null> => {
    try {
      const { data } = await api.post<Course>('/api/courses', course);
      return data;
    } catch (error: any) {
      console.error('Error creating course:', error.response?.data?.message || error.message);
      return null;
    }
  },

  // Update course
  updateCourse: async (courseId: string, updates: Partial<Course>): Promise<Course | null> => {
    try {
      const { data } = await api.put<Course>(`/api/courses/${courseId}`, updates);
      return data;
    } catch (error: any) {
      console.error('Error updating course:', error.response?.data?.message || error.message);
      return null;
    }
  },

  // Delete course
  deleteCourse: async (courseId: string): Promise<boolean> => {
    try {
      await api.delete(`/api/courses/${courseId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting course:', error.response?.data?.message || error.message);
      return false;
    }
  },

  // Assignment operations
  createAssignment: async (courseId: string, assignment: Omit<Assignment, 'id'>): Promise<Assignment | null> => {
    try {
      const { data } = await api.post<Assignment>(`/api/courses/${courseId}/assignments`, assignment);
      return data;
    } catch (error: any) {
      console.error('Error creating assignment:', error.response?.data?.message || error.message);
      return null;
    }
  },

  updateAssignment: async (courseId: string, assignmentId: string, updates: Partial<Omit<Assignment, 'id'>>): Promise<boolean> => {
    try {
      await api.put(`/api/courses/${courseId}/assignments/${assignmentId}`, updates);
      return true;
    } catch (error: any) {
      console.error('Error updating assignment:', error.response?.data?.message || error.message);
      return false;
    }
  },

  deleteAssignment: async (courseId: string, assignmentId: string): Promise<boolean> => {
    try {
      await api.delete(`/api/courses/${courseId}/assignments/${assignmentId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting assignment:', error.response?.data?.message || error.message);
      return false;
    }
  },

  // Note operations
  createNote: async (courseId: string, note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const { data } = await api.post<Note>(`/api/courses/${courseId}/notes`, note);
      return data;
    } catch (error: any) {
      console.error('Error creating note:', error.response?.data?.message || error.message);
      return null;
    }
  },

  updateNote: async (courseId: string, noteId: string, note: Partial<Omit<Note, 'id'>>): Promise<boolean> => {
    try {
      await api.put(`/api/courses/${courseId}/notes/${noteId}`, note);
      return true;
    } catch (error: any) {
      console.error('Error updating note:', error.response?.data?.message || error.message);
      return false;
    }
  },

  deleteNote: async (courseId: string, noteId: string): Promise<boolean> => {
    try {
      await api.delete(`/api/courses/${courseId}/notes/${noteId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting note:', error.response?.data?.message || error.message);
      return false;
    }
  },

  // Project operations
  createProject: async (courseId: string, project: Omit<Project, 'id'>): Promise<Project | null> => {
    try {
      const { data } = await api.post<Project>(`/api/courses/${courseId}/projects`, project);
      return data;
    } catch (error: any) {
      console.error('Error creating project:', error.response?.data?.message || error.message);
      return null;
    }
  },

  updateProject: async (courseId: string, projectId: string, project: Partial<Omit<Project, 'id'>>): Promise<boolean> => {
    try {
      await api.put(`/api/courses/${courseId}/projects/${projectId}`, project);
      return true;
    } catch (error: any) {
      console.error('Error updating project:', error.response?.data?.message || error.message);
      return false;
    }
  },

  deleteProject: async (courseId: string, projectId: string): Promise<boolean> => {
    try {
      await api.delete(`/api/courses/${courseId}/projects/${projectId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error.response?.data?.message || error.message);
      return false;
    }
  },
};

export default courseService;
