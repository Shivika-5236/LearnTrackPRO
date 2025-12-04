import db from './database';
import { FocusBlock, Session } from '@/context/StudyContext';

export const studyService = {
    // Focus Block operations
    getFocusBlocksByUserId: (userId: number): FocusBlock[] => {
        try {
            const blocks = db.getAllSync<any>(
                'SELECT * FROM focus_blocks WHERE user_id = ? ORDER BY date, time',
                [userId]
            );
            return blocks.map(b => ({
                id: b.id.toString(),
                title: b.title,
                details: b.details,
                day: b.day,
                date: b.date,
                time: b.time,
                duration: b.duration,
                color: b.color,
                isActive: b.is_active === 1,
                isPaused: b.is_paused === 1,
                elapsedTime: b.elapsed_time || 0,
                flaggedTimes: b.flagged_times ? JSON.parse(b.flagged_times) : [],
            }));
        } catch (error) {
            console.error('Error getting focus blocks:', error);
            return [];
        }
    },

    createFocusBlock: (userId: number, block: Omit<FocusBlock, 'id'>): number | null => {
        try {
            const flaggedTimesJson = block.flaggedTimes ? JSON.stringify(block.flaggedTimes) : null;
            const result = db.runSync(
                `INSERT INTO focus_blocks (user_id, title, details, day, date, time, duration, color, is_active, is_paused, elapsed_time, flagged_times) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    block.title,
                    block.details || null,
                    block.day,
                    block.date,
                    block.time,
                    block.duration,
                    block.color,
                    block.isActive ? 1 : 0,
                    block.isPaused ? 1 : 0,
                    block.elapsedTime || 0,
                    flaggedTimesJson
                ]
            );
            return result.lastInsertRowId || null;
        } catch (error) {
            console.error('Error creating focus block:', error);
            return null;
        }
    },

    updateFocusBlock: (blockId: number, updates: Partial<Omit<FocusBlock, 'id'>>): boolean => {
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
            if (updates.day !== undefined) {
                updateFields.push('day = ?');
                values.push(updates.day);
            }
            if (updates.date !== undefined) {
                updateFields.push('date = ?');
                values.push(updates.date);
            }
            if (updates.time !== undefined) {
                updateFields.push('time = ?');
                values.push(updates.time);
            }
            if (updates.duration !== undefined) {
                updateFields.push('duration = ?');
                values.push(updates.duration);
            }
            if (updates.color !== undefined) {
                updateFields.push('color = ?');
                values.push(updates.color);
            }
            if (updates.isActive !== undefined) {
                updateFields.push('is_active = ?');
                values.push(updates.isActive ? 1 : 0);
            }
            if (updates.isPaused !== undefined) {
                updateFields.push('is_paused = ?');
                values.push(updates.isPaused ? 1 : 0);
            }
            if (updates.elapsedTime !== undefined) {
                updateFields.push('elapsed_time = ?');
                values.push(updates.elapsedTime);
            }
            if (updates.flaggedTimes !== undefined) {
                updateFields.push('flagged_times = ?');
                values.push(JSON.stringify(updates.flaggedTimes));
            }

            if (updateFields.length > 0) {
                values.push(blockId);
                db.runSync(`UPDATE focus_blocks SET ${updateFields.join(', ')} WHERE id = ?`, values);
            }
            return true;
        } catch (error) {
            console.error('Error updating focus block:', error);
            return false;
        }
    },

    deleteFocusBlock: (blockId: number): boolean => {
        try {
            db.runSync('DELETE FROM focus_blocks WHERE id = ?', [blockId]);
            return true;
        } catch (error) {
            console.error('Error deleting focus block:', error);
            return false;
        }
    },

    // Study Session operations
    getSessionsByUserId: (userId: number): Session[] => {
        try {
            const sessions = db.getAllSync<any>(
                'SELECT * FROM study_sessions WHERE user_id = ? ORDER BY session_date DESC',
                [userId]
            );
            return sessions.map(s => ({
                ...s,
                id: s.id.toString(),
                date: new Date(s.session_date),
            }));
        } catch (error) {
            console.error('Error getting sessions:', error);
            return [];
        }
    },

    createSession: (userId: number, session: Omit<Session, 'id'>): number | null => {
        try {
            const result = db.runSync(
                `INSERT INTO study_sessions (user_id, course, duration, focus, logged_at, color, session_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, session.course, session.duration, session.focus, session.loggedAt, session.color, session.date.toISOString()]
            );
            return result.lastInsertRowId || null;
        } catch (error) {
            console.error('Error creating session:', error);
            return null;
        }
    },

    deleteSession: (sessionId: number): boolean => {
        try {
            db.runSync('DELETE FROM study_sessions WHERE id = ?', [sessionId]);
            return true;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    },
};

export default studyService;
