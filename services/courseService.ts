import db from './database';
import { Course, Assignment, Note, Project } from '@/context/CourseContext';

export const courseService = {
    // Get all courses for a user
    getCoursesByUserId: (userId: number): Course[] => {
        try {
            const courses = db.getAllSync<any>(
                'SELECT * FROM courses WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );

            // Load related data for each course
            return courses.map(course => ({
                id: course.id.toString(),
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                totalHours: course.total_hours, // Map snake_case to camelCase
                credits: course.credits,
                tag: course.tag,
                progress: course.progress,
                assignments: getAssignmentsByCourseId(course.id),
                notes: getNotesByCourseId(course.id),
                projects: getProjectsByCourseId(course.id),
            }));
        } catch (error) {
            console.error('Error getting courses:', error);
            return [];
        }
    },

    // Create new course
    createCourse: (userId: number, course: Omit<Course, 'id' | 'assignments' | 'notes' | 'projects'>): number | null => {
        try {
            const result = db.runSync(
                `INSERT INTO courses (user_id, title, description, instructor, total_hours, credits, tag, progress) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, course.title, course.description, course.instructor, course.totalHours, course.credits, course.tag, course.progress]
            );
            return result.lastInsertRowId || null;
        } catch (error) {
            console.error('Error creating course:', error);
            return null;
        }
    },

    // Delete course
    deleteCourse: (courseId: number): boolean => {
        try {
            db.runSync('DELETE FROM courses WHERE id = ?', [courseId]);
            return true;
        } catch (error) {
            console.error('Error deleting course:', error);
            return false;
        }
    },

    // Assignment operations
    createAssignment: (courseId: number, assignment: Omit<Assignment, 'id'>): number | null => {
        try {
            const result = db.runSync(
                'INSERT INTO assignments (course_id, title, description) VALUES (?, ?, ?)',
                [courseId, assignment.title, assignment.description]
            );
            return result.lastInsertRowId || null;
        } catch (error) {
            console.error('Error creating assignment:', error);
            return null;
        }
    },

    deleteAssignment: (assignmentId: number): boolean => {
        try {
            db.runSync('DELETE FROM assignments WHERE id = ?', [assignmentId]);
            return true;
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return false;
        }
    },

    // Note operations
    createNote: (courseId: number, note: Omit<Note, 'id'>): number | null => {
        try {
            const result = db.runSync(
                'INSERT INTO notes (course_id, heading, content) VALUES (?, ?, ?)',
                [courseId, note.heading, note.content]
            );
            return result.lastInsertRowId || null;
        } catch (error) {
            console.error('Error creating note:', error);
            return null;
        }
    },

    updateNote: (noteId: number, note: Partial<Omit<Note, 'id'>>): boolean => {
        try {
            const updates: string[] = [];
            const values: any[] = [];

            if (note.heading !== undefined) {
                updates.push('heading = ?');
                values.push(note.heading);
            }
            if (note.content !== undefined) {
                updates.push('content = ?');
                values.push(note.content);
            }

            if (updates.length > 0) {
                values.push(noteId);
                db.runSync(`UPDATE notes SET ${updates.join(', ')} WHERE id = ?`, values);
            }
            return true;
        } catch (error) {
            console.error('Error updating note:', error);
            return false;
        }
    },

    deleteNote: (noteId: number): boolean => {
        try {
            db.runSync('DELETE FROM notes WHERE id = ?', [noteId]);
            return true;
        } catch (error) {
            console.error('Error deleting note:', error);
            return false;
        }
    },

    // Project operations
    createProject: (courseId: number, project: Omit<Project, 'id'>): number | null => {
        try {
            const result = db.runSync(
                'INSERT INTO projects (course_id, name, tech_stack, details, pdf_url) VALUES (?, ?, ?, ?, ?)',
                [courseId, project.name, project.techStack, project.details, project.pdfUrl || null]
            );
            return result.lastInsertRowId || null;
        } catch (error) {
            console.error('Error creating project:', error);
            return null;
        }
    },

    updateProject: (projectId: number, project: Partial<Omit<Project, 'id'>>): boolean => {
        try {
            const updates: string[] = [];
            const values: any[] = [];

            if (project.name !== undefined) {
                updates.push('name = ?');
                values.push(project.name);
            }
            if (project.techStack !== undefined) {
                updates.push('tech_stack = ?');
                values.push(project.techStack);
            }
            if (project.details !== undefined) {
                updates.push('details = ?');
                values.push(project.details);
            }
            if (project.pdfUrl !== undefined) {
                updates.push('pdf_url = ?');
                values.push(project.pdfUrl);
            }

            if (updates.length > 0) {
                values.push(projectId);
                db.runSync(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, values);
            }
            return true;
        } catch (error) {
            console.error('Error updating project:', error);
            return false;
        }
    },

    deleteProject: (projectId: number): boolean => {
        try {
            db.runSync('DELETE FROM projects WHERE id = ?', [projectId]);
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    },
};

// Helper functions to get related data
function getAssignmentsByCourseId(courseId: number): Assignment[] {
    try {
        const assignments = db.getAllSync<any>(
            'SELECT * FROM assignments WHERE course_id = ? ORDER BY created_at DESC',
            [courseId]
        );
        return assignments.map(a => ({ ...a, id: a.id.toString() }));
    } catch (error) {
        console.error('Error getting assignments:', error);
        return [];
    }
}

function getNotesByCourseId(courseId: number): Note[] {
    try {
        const notes = db.getAllSync<any>(
            'SELECT * FROM notes WHERE course_id = ? ORDER BY created_at DESC',
            [courseId]
        );
        return notes.map(n => ({ ...n, id: n.id.toString() }));
    } catch (error) {
        console.error('Error getting notes:', error);
        return [];
    }
}

function getProjectsByCourseId(courseId: number): Project[] {
    try {
        const projects = db.getAllSync<any>(
            'SELECT * FROM projects WHERE course_id = ? ORDER BY created_at DESC',
            [courseId]
        );
        return projects.map(p => ({ ...p, id: p.id.toString(), techStack: p.tech_stack, pdfUrl: p.pdf_url }));
    } catch (error) {
        console.error('Error getting projects:', error);
        return [];
    }
}

export default courseService;
