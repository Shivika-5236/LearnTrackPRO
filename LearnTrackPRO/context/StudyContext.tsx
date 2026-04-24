import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import studyService from '@/services/studyService';
import { useAuth } from './AuthContext';

export interface FocusBlock {
    id: string;
    title: string;
    details?: string;
    courseId?: any;
    day: string;
    date: string;
    time: string;
    duration: number;
    color: string;
    isActive?: boolean;
    isPaused?: boolean;
    elapsedTime?: number;
    flaggedTimes?: number[];
    pdfUri?: string;
    pdfName?: string;
    tasks?: { id: string; text: string; completed: boolean }[];
    subjectLabel?: string;
    subjectColor?: string;
    subjectIcon?: string;
}

export interface Session {
    id: string;
    course: string;
    courseId?: string;
    duration: string;
    focus: string;
    loggedAt: string;
    color: string;
    date: Date;
}

interface StudyContextType {
    upcomingBlocks: FocusBlock[];
    recentSessions: Session[];
    addFocusBlock: (block: Omit<FocusBlock, 'id'>) => Promise<void>;
    updateFocusBlock: (id: string, updates: Partial<Omit<FocusBlock, 'id'>>) => Promise<void>;
    deleteFocusBlock: (id: string) => Promise<void>;
    addSession: (session: Omit<Session, 'id'>) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    refreshStudyData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
    const context = useContext(StudyContext);
    if (!context) {
        throw new Error('useStudy must be used within a StudyProvider');
    }
    return context;
};

export const StudyProvider = ({ children }: { children: ReactNode }) => {
    const { user, refreshUser } = useAuth();
    const [upcomingBlocks, setUpcomingBlocks] = useState<FocusBlock[]>([]);
    const [recentSessions, setRecentSessions] = useState<Session[]>([]);

    useEffect(() => {
        if (user) {
            refreshStudyData();
        } else {
            setUpcomingBlocks([]);
            setRecentSessions([]);
        }
    }, [user]);

    const refreshStudyData = async () => {
        if (!user) return;
        const [blocks, sessions] = await Promise.all([
            studyService.getFocusBlocksByUserId(),
            studyService.getSessionsByUserId(),
        ]);
        setUpcomingBlocks(blocks);
        setRecentSessions(sessions);
    };

    const addFocusBlock = async (block: Omit<FocusBlock, 'id'>) => {
        if (!user) return;
        const created = await studyService.createFocusBlock(block);
        if (created) await refreshStudyData();
    };

    const updateFocusBlock = async (id: string, updates: Partial<Omit<FocusBlock, 'id'>>) => {
        await studyService.updateFocusBlock(id, updates);
        await refreshStudyData();
    };

    const deleteFocusBlock = async (id: string) => {
        await studyService.deleteFocusBlock(id);
        await refreshStudyData();
    };

    const addSession = async (session: Omit<Session, 'id'>) => {
        if (!user) return;
        const created = await studyService.createSession(session);
        if (created) {
            await refreshStudyData();
            await refreshUser();
        }
    };

    const deleteSession = async (id: string) => {
        await studyService.deleteSession(id);
        await refreshStudyData();
    };

    return (
        <StudyContext.Provider
            value={{
                upcomingBlocks,
                recentSessions,
                addFocusBlock,
                updateFocusBlock,
                deleteFocusBlock,
                addSession,
                deleteSession,
                refreshStudyData,
            }}
        >
            {children}
        </StudyContext.Provider>
    );
};
