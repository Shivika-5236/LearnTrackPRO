import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import courseService from '@/services/courseService';
import { useAuth } from './AuthContext';

export type CourseTag = 'Self' | 'College' | 'Online Course' | 'Certification' | 'Personal Learning';

export interface Assignment {
    id: string;
    title: string;
    description: string;
    dueDate?: string;
    status?: 'Submitted' | 'Not Submitted';
    courseTag?: string;
    pdfUrl?: string;
    completedAt?: string;
}

export interface Note {
    id: string;
    heading: string;
    content: string;
    pdfUrl?: string;
}

export interface ProjectTask {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
}

export interface Project {
    id: string;
    name: string;
    techStack: string;
    details: string;
    status?: 'In Progress' | 'Completed' | 'Pending';
    deadline?: string;
    githubLink?: string;
    tasks?: ProjectTask[];
    pdfUrl?: string;
    completedAt?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    totalHours: number;
    credits: number;
    tag: CourseTag;
    progress: number;
    courseLink?: string;
    label?: string;
    labelColor?: string;
    durationValue?: string;
    durationUnit?: string;
    courseEndDate?: string;
    image?: string;
    assignments: Assignment[];
    notes: Note[];
    projects: Project[];
}

interface CourseContextType {
    courses: Course[];
    addCourse: (course: Omit<Course, 'id' | 'assignments' | 'notes' | 'projects'>) => Promise<void>;
    updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
    deleteCourse: (courseId: string) => Promise<void>;
    addAssignment: (courseId: string, assignment: Omit<Assignment, 'id'>) => Promise<void>;
    updateAssignment: (courseId: string, assignmentId: string, updates: Partial<Omit<Assignment, 'id'>>) => Promise<void>;
    deleteAssignment: (courseId: string, assignmentId: string) => Promise<void>;
    addNote: (courseId: string, note: Omit<Note, 'id'>) => Promise<void>;
    updateNote: (courseId: string, noteId: string, note: Partial<Omit<Note, 'id'>>) => Promise<void>;
    deleteNote: (courseId: string, noteId: string) => Promise<void>;
    addProject: (courseId: string, project: Omit<Project, 'id'>) => Promise<void>;
    updateProject: (courseId: string, projectId: string, project: Partial<Omit<Project, 'id'>>) => Promise<void>;
    deleteProject: (courseId: string, projectId: string) => Promise<void>;
    refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourses = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourses must be used within a CourseProvider');
    }
    return context;
};

export const CourseProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        if (user) {
            refreshCourses();
        } else {
            setCourses([]);
        }
    }, [user]);

    const refreshCourses = async () => {
        if (!user) return;
        const loadedCourses = await courseService.getCoursesByUserId();
        if (loadedCourses) {
            setCourses(loadedCourses);
        }
    };

    const addCourse = async (newCourse: Omit<Course, 'id' | 'assignments' | 'notes' | 'projects'>) => {
        if (!user) return;
        const created = await courseService.createCourse(newCourse);
        if (created) await refreshCourses();
    };

    const deleteCourse = async (courseId: string) => {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        await courseService.deleteCourse(courseId);
    };

    const updateCourse = async (courseId: string, updates: Partial<Course>) => {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...updates } : c));
        await courseService.updateCourse(courseId, updates);
    };

    const addAssignment = async (courseId: string, assignment: Omit<Assignment, 'id'>) => {
        const created = await courseService.createAssignment(courseId, assignment);
        if (created) {
            await refreshCourses();
            return created;
        }
        return null;
    };

    const updateAssignment = async (courseId: string, assignmentId: string, updates: Partial<Omit<Assignment, 'id'>>) => {
        setCourses(prev => prev.map(c => c.id === courseId ? {
            ...c,
            assignments: c.assignments.map(a => a.id === assignmentId ? { ...a, ...updates } : a)
        } : c));
        await courseService.updateAssignment(courseId, assignmentId, updates);
    };

    const deleteAssignment = async (courseId: string, assignmentId: string) => {
        setCourses(prev => prev.map(c => c.id === courseId ? {
            ...c,
            assignments: c.assignments.filter(a => a.id !== assignmentId)
        } : c));
        await courseService.deleteAssignment(courseId, assignmentId);
    };

    const addNote = async (courseId: string, note: Omit<Note, 'id'>) => {
        const created = await courseService.createNote(courseId, note);
        if (created) {
            await refreshCourses();
            return created;
        }
        return null;
    };

    const updateNote = async (courseId: string, noteId: string, noteUpdates: Partial<Omit<Note, 'id'>>) => {
        // Optimistic update
        setCourses(prev => prev.map(c => c.id === courseId ? {
            ...c,
            notes: c.notes.map(n => n.id === noteId ? { ...n, ...noteUpdates } : n)
        } : c));
        
        await courseService.updateNote(courseId, noteId, noteUpdates);
        // Don't refresh immediately to avoid overwriting optimistic state with stale data
    };

    const deleteNote = async (courseId: string, noteId: string) => {
        setCourses(prev => prev.map(c => c.id === courseId ? {
            ...c,
            notes: c.notes.filter(n => n.id !== noteId)
        } : c));
        await courseService.deleteNote(courseId, noteId);
    };

    const addProject = async (courseId: string, project: Omit<Project, 'id'>) => {
        const created = await courseService.createProject(courseId, project);
        if (created) {
            await refreshCourses();
            return created;
        }
        return null;
    };

    const updateProject = async (courseId: string, projectId: string, projectUpdates: Partial<Omit<Project, 'id'>>) => {
        // Optimistic update
        setCourses(prev => prev.map(c => c.id === courseId ? {
            ...c,
            projects: c.projects.map(p => p.id === projectId ? { ...p, ...projectUpdates } : p)
        } : c));

        await courseService.updateProject(courseId, projectId, projectUpdates);
        // Don't refresh immediately to avoid overwriting optimistic state with stale data
    };

    const deleteProject = async (courseId: string, projectId: string) => {
        setCourses(prev => prev.map(c => c.id === courseId ? {
            ...c,
            projects: c.projects.filter(p => p.id !== projectId)
        } : c));
        await courseService.deleteProject(courseId, projectId);
    };

    return (
        <CourseContext.Provider
            value={{
                courses,
                addCourse,
                updateCourse,
                deleteCourse,
                addAssignment,
                updateAssignment,
                deleteAssignment,
                addNote,
                updateNote,
                deleteNote,
                addProject,
                updateProject,
                deleteProject,
                refreshCourses,
            }}
        >
            {children}
        </CourseContext.Provider>
    );
};
