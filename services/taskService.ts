import db from './database';
import { Task, TaskStatus } from '@/context/TaskContext';

export const taskService = {
    // Get all tasks for a user
    getTasksByUserId: (userId: number): Task[] => {
        try {
            const tasks = db.getAllSync<any>(
                'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return tasks.map(t => ({ ...t, id: t.id.toString() }));
        } catch (error) {
            console.error('Error getting tasks:', error);
            return [];
        }
    },

    // Get tasks by status
    getTasksByStatus: (userId: number, status: TaskStatus): Task[] => {
        try {
            const tasks = db.getAllSync<any>(
                'SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
                [userId, status]
            );
            return tasks.map(t => ({ ...t, id: t.id.toString() }));
        } catch (error) {
            console.error('Error getting tasks by status:', error);
            return [];
        }
    },

    // Create new task
    createTask: (userId: number, task: Omit<Task, 'id'>): number | null => {
        try {
            const result = db.runSync(
                `INSERT INTO tasks (user_id, title, details, deadline, priority, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, task.title, task.details || null, task.deadline || null, task.priority, task.status]
            );
            return result.lastInsertRowId || null;
        } catch (error) {
            console.error('Error creating task:', error);
            return null;
        }
    },

    // Update task status
    updateTaskStatus: (taskId: number, status: TaskStatus): boolean => {
        try {
            db.runSync('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
            return true;
        } catch (error) {
            console.error('Error updating task status:', error);
            return false;
        }
    },

    // Update task
    updateTask: (taskId: number, updates: Partial<Omit<Task, 'id'>>): boolean => {
        try {
            const updateFields: string[] = [];
            const values: any[] = [];

            if (updates.title !== undefined) {
                updateFields.push('title = ?');
                values.push(updates.title);
            }
            if (updates.details !== undefined) {
                updateFields.push('details = ?');
                values.push(updates.details);
            }
            if (updates.deadline !== undefined) {
                updateFields.push('deadline = ?');
                values.push(updates.deadline);
            }
            if (updates.priority !== undefined) {
                updateFields.push('priority = ?');
                values.push(updates.priority);
            }
            if (updates.status !== undefined) {
                updateFields.push('status = ?');
                values.push(updates.status);
            }

            if (updateFields.length > 0) {
                values.push(taskId);
                db.runSync(`UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`, values);
            }
            return true;
        } catch (error) {
            console.error('Error updating task:', error);
            return false;
        }
    },

    // Delete task
    deleteTask: (taskId: number): boolean => {
        try {
            db.runSync('DELETE FROM tasks WHERE id = ?', [taskId]);
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    },
};

export default taskService;
