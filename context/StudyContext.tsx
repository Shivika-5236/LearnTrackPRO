import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import studyService from '@/services/studyService';
import { useAuth } from './AuthContext';

export interface FocusBlock {
    id: string;
    title: string;
    details?: string;
    day: string;
    date: string;
    time: string;
    duration: number;
    color: string;
    isActive?: boolean;
    isPaused?: boolean;
    elapsedTime?: number;
    flaggedTimes?: string[];
}

export interface Session {
    id: string;
    course: string;
    duration: string;
    focus: string;
    loggedAt: string;
    color: string;
    date: Date;
}

interface StudyContextType {
    upcomingBlocks: FocusBlock[];
    recentSessions: Session[];
    addFocusBlock: (block: Omit<FocusBlock, 'id'>) => void;
    updateFocusBlock: (id: string, updates: Partial<Omit<FocusBlock, 'id'>>) => void;
    deleteFocusBlock: (id: string) => void;
    addSession: (session: Omit<Session, 'id'>) => void;
    deleteSession: (id: string) => void;
    refreshStudyData: () => void;
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
    const { user } = useAuth();
    const [upcomingBlocks, setUpcomingBlocks] = useState<FocusBlock[]>([]);
    const [recentSessions, setRecentSessions] = useState<Session[]>([]);

    // Load data when user changes
    useEffect(() => {
        if (user) {
            refreshStudyData();
        } else {
            setUpcomingBlocks([]);
            setRecentSessions([]);
        }
    }, [user]);

    const refreshStudyData = () => {
        if (!user) return;
        const blocks = studyService.getFocusBlocksByUserId(user.id);
        const sessions = studyService.getSessionsByUserId(user.id);
        setUpcomingBlocks(blocks);
        setRecentSessions(sessions);
    };

    const addFocusBlock = async (block: Omit<FocusBlock, 'id'>) => {
        if (!user) return;

        const blockId = studyService.createFocusBlock(user.id, block);
        if (blockId) {
            refreshStudyData();
        }
    };

    const updateFocusBlock = (id: string, updates: Partial<Omit<FocusBlock, 'id'>>) => {
        studyService.updateFocusBlock(parseInt(id), updates);
        refreshStudyData();
    };

    const deleteFocusBlock = async (id: string) => {
        studyService.deleteFocusBlock(parseInt(id));
        refreshStudyData();
    };

    const addSession = (session: Omit<Session, 'id'>) => {
        if (!user) return;

        const sessionId = studyService.createSession(user.id, session);
        if (sessionId) {
            refreshStudyData();
        }
    };

    const deleteSession = (id: string) => {
        studyService.deleteSession(parseInt(id));
        refreshStudyData();
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
