import { Task } from '@/context/TaskContext';
import { Session } from '@/context/StudyContext';

const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const generateICS = (tasks: Task[], sessions: Session[]) => {
    const icsChunks = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//LearnTrackPRO//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    // Add Tasks
    tasks.forEach(task => {
        if (!task.parsedDeadline) return;

        const date = new Date(task.parsedDeadline);
        const endDate = new Date(date.getTime() + 60 * 60 * 1000); // Default 1 hour duration

        icsChunks.push('BEGIN:VEVENT');
        icsChunks.push(`UID:task-${task.id}@learntrackpro.com`);
        icsChunks.push(`DTSTAMP:${formatICSDate(new Date())}`);
        icsChunks.push(`DTSTART:${formatICSDate(date)}`);
        icsChunks.push(`DTEND:${formatICSDate(endDate)}`);
        icsChunks.push(`SUMMARY:${task.title}`);
        icsChunks.push(`DESCRIPTION:Priority: ${task.priority}${task.details ? '\\nDetails: ' + task.details.replace(/\n/g, '\\n') : ''}`);
        icsChunks.push('END:VEVENT');
    });

    // Add Study Sessions
    sessions.forEach(session => {
        const date = new Date(session.date);
        
        // Parse duration like "2h 30m" or "45m"
        let durationMs = 60 * 60 * 1000; // Default 1h
        const hMatch = session.duration.match(/(\d+)h/);
        const mMatch = session.duration.match(/(\d+)m/);
        
        if (hMatch || mMatch) {
            const hours = hMatch ? parseInt(hMatch[1]) : 0;
            const minutes = mMatch ? parseInt(mMatch[1]) : 0;
            durationMs = (hours * 60 + minutes) * 60 * 1000;
        }
        
        const endDate = new Date(date.getTime() + durationMs);

        icsChunks.push('BEGIN:VEVENT');
        icsChunks.push(`UID:session-${session.id}@learntrackpro.com`);
        icsChunks.push(`DTSTAMP:${formatICSDate(new Date())}`);
        icsChunks.push(`DTSTART:${formatICSDate(date)}`);
        icsChunks.push(`DTEND:${formatICSDate(endDate)}`);
        icsChunks.push(`SUMMARY:Study Log: ${session.course}`);
        icsChunks.push(`DESCRIPTION:Focus: ${session.focus}`);
        icsChunks.push('END:VEVENT');
    });

    icsChunks.push('END:VCALENDAR');
    return icsChunks.join('\r\n');
};
