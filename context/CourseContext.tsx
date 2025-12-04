import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import courseService from '@/services/courseService';
import { useAuth } from './AuthContext';

export type CourseTag = 'Self' | 'College';

export interface Assignment {
    id: string;
    title: string;
    description: string;
}

export interface Note {
    id: string;
    heading: string;
    content: string;
}

export interface Project {
    id: string;
    name: string;
    techStack: string;
    details: string;
    pdfUrl?: string;
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
    image?: string;
    assignments: Assignment[];
    notes: Note[];
    projects: Project[];
}

interface CourseContextType {
    courses: Course[];
    addCourse: (course: Omit<Course, 'id' | 'assignments' | 'notes' | 'projects'>) => void;
    deleteCourse: (courseId: string) => void;
    addAssignment: (courseId: string, assignment: Omit<Assignment, 'id'>) => void;
    deleteAssignment: (courseId: string, assignmentId: string) => void;
    addNote: (courseId: string, note: Omit<Note, 'id'>) => void;
    updateNote: (courseId: string, noteId: string, note: Partial<Omit<Note, 'id'>>) => void;
    deleteNote: (courseId: string, noteId: string) => void;
    addProject: (courseId: string, project: Omit<Project, 'id'>) => void;
    updateProject: (courseId: string, projectId: string, project: Partial<Omit<Project, 'id'>>) => void;
    deleteProject: (courseId: string, projectId: string) => void;
    refreshCourses: () => void;
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

    // Load courses when user changes
    useEffect(() => {
        if (user) {
            refreshCourses();
        } else {
            setCourses([]);
        }
    }, [user]);

    const refreshCourses = () => {
        if (!user) return;
        const loadedCourses = courseService.getCoursesByUserId(user.id);
        setCourses(loadedCourses);
    };

    const addCourse = (newCourse: Omit<Course, 'id' | 'assignments' | 'notes' | 'projects'>) => {
        if (!user) return;

        const courseId = courseService.createCourse(user.id, newCourse);
        if (courseId) {
            refreshCourses();
        }
    };

    const deleteCourse = (courseId: string) => {
        courseService.deleteCourse(parseInt(courseId));
        refreshCourses();
    };

    const addAssignment = (courseId: string, assignment: Omit<Assignment, 'id'>) => {
        courseService.createAssignment(parseInt(courseId), assignment);
        refreshCourses();
    };

    const deleteAssignment = (courseId: string, assignmentId: string) => {
        courseService.deleteAssignment(parseInt(assignmentId));
        refreshCourses();
    };

    const addNote = (courseId: string, note: Omit<Note, 'id'>) => {
        courseService.createNote(parseInt(courseId), note);
        refreshCourses();
    };

    const updateNote = (courseId: string, noteId: string, note: Partial<Omit<Note, 'id'>>) => {
        courseService.updateNote(parseInt(noteId), note);
        refreshCourses();
    };

    const deleteNote = (courseId: string, noteId: string) => {
        courseService.deleteNote(parseInt(noteId));
        refreshCourses();
    };

    const addProject = (courseId: string, project: Omit<Project, 'id'>) => {
        courseService.createProject(parseInt(courseId), project);
        refreshCourses();
    };

    const updateProject = (courseId: string, projectId: string, project: Partial<Omit<Project, 'id'>>) => {
        courseService.updateProject(parseInt(projectId), project);
        refreshCourses();
    };

    const deleteProject = (courseId: string, projectId: string) => {
        courseService.deleteProject(parseInt(projectId));
        refreshCourses();
    };

    return (
        <CourseContext.Provider
            value={{
                courses,
                addCourse,
                deleteCourse,
                addAssignment,
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
