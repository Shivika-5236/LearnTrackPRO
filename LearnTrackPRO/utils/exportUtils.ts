import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Task } from '@/context/TaskContext';
import { Session } from '@/context/StudyContext';
import { Course } from '@/context/CourseContext';
import { User } from '@/context/AuthContext';

/**
 * Generates a CSV string from tasks and study sessions
 */
export const generateCSV = (tasks: Task[], sessions: Session[]) => {
    let csvContent = 'Type,Title,Date,Details,Status/Duration,Priority/Focus\n';

    // Add Tasks
    tasks.forEach(task => {
        const title = (task.title || '').replace(/,/g, '');
        const details = (task.details || '').replace(/,/g, '').replace(/\n/g, ' ');
        const date = task.deadline || '';
        const status = task.status || '';
        const priority = task.priority || '';
        csvContent += `Task,${title},${date},${details},${status},${priority}\n`;
    });

    // Add Study Sessions
    sessions.forEach(session => {
        const course = (session.course || '').replace(/,/g, '');
        const focus = (session.focus || '').replace(/,/g, '').replace(/\n/g, ' ');
        const date = session.date instanceof Date ? session.date.toLocaleDateString() : new Date(session.date).toLocaleDateString();
        const duration = session.duration || '';
        csvContent += `Study Session,${course},${date},${focus},${duration},-\n`;
    });

    return csvContent;
};

/**
 * Generates HTML content for the PDF Progress Report
 */
export const generateProgressReportHTML = (user: User | null, tasks: Task[], sessions: Session[], courses: Course[]) => {
    const totalStudyTimeMinutes = sessions.reduce((acc, s) => {
        const mins = parseInt(s.duration) || 0;
        return acc + mins;
    }, 0);

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const sessionRows = sessions.slice(0, 10).map(s => `
        <tr>
            <td>${s.date instanceof Date ? s.date.toLocaleDateString() : new Date(s.date).toLocaleDateString()}</td>
            <td>${s.course}</td>
            <td>${s.focus || 'Focus'}</td>
            <td>${s.duration}</td>
        </tr>
    `).join('');

    const courseRows = courses.map(c => {
        const courseSessions = sessions.filter(s => s.courseId === c.id || s.course === c.title);
        const courseMins = courseSessions.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0);
        return `
            <div class="course-stat">
                <strong>${c.title}</strong>
                <span>${Math.floor(courseMins / 60)}h ${courseMins % 60}m</span>
            </div>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1E293B; margin: 0; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #5B6BFA; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { color: #5B6BFA; margin: 0; font-size: 32px; }
            .user-info { text-align: right; }
            .user-info p { margin: 2px 0; color: #64748B; }
            
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0; text-align: center; }
            .stat-card h3 { margin: 0; font-size: 14px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
            .stat-card p { margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #1E293B; }
            
            h2 { font-size: 20px; border-left: 4px solid #5B6BFA; padding-left: 12px; margin-top: 40px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background: #F1F5F9; padding: 12px; font-size: 14px; color: #64748B; }
            td { padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
            
            .course-stats { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px; }
            .course-stat { background: #EEF2FF; border: 1px solid #C7D2FE; padding: 8px 12px; border-radius: 8px; display: flex; flex-direction: column; min-width: 120px; }
            .course-stat strong { font-size: 13px; color: #5B6BFA; }
            .course-stat span { font-size: 16px; font-weight: bold; }
            
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <p style="margin: 0; color: #5B6BFA; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Progress Report</p>
                <h1>LearnTrackPRO</h1>
            </div>
            <div class="user-info">
                <strong>${user?.name || 'Student'}</strong>
                <p>${user?.email || ''}</p>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Study Time</h3>
                <p>${Math.floor(totalStudyTimeMinutes / 60)}h ${totalStudyTimeMinutes % 60}m</p>
            </div>
            <div class="stat-card">
                <h3>Task Completion</h3>
                <p>${completionRate}%</p>
            </div>
            <div class="stat-card">
                <h3>Current Streak</h3>
                <p>${user?.streak || 0} Days</p>
            </div>
        </div>

        <h2>Course Breakdown</h2>
        <div class="course-stats">
            ${courseRows}
        </div>

        <h2>Recent Sessions</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Focus</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                ${sessionRows}
                ${sessions.length === 0 ? '<tr><td colspan="4" style="text-align:center">No sessions logged yet.</td></tr>' : ''}
            </tbody>
        </table>

        <div class="footer">
            Generated by LearnTrackPRO - Your personal study companion.
        </div>
    </body>
    </html>
    `;
};
