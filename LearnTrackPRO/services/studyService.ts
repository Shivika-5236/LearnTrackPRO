import api from './database';
import { FocusBlock, Session } from '@/context/StudyContext';

export const studyService = {
  // Focus Block operations
  getFocusBlocksByUserId: async (): Promise<FocusBlock[]> => {
    try {
      const { data } = await api.get<FocusBlock[]>('/api/study/focus-blocks');
      return data.map(b => ({ ...b, id: (b as any)._id?.toString() || b.id }));
    } catch (error: any) {
      console.error('Error getting focus blocks:', error.response?.data?.message || error.message);
      return [];
    }
  },

  createFocusBlock: async (block: Omit<FocusBlock, 'id'>): Promise<FocusBlock | null> => {
    try {
      const { data } = await api.post<FocusBlock>('/api/study/focus-blocks', block);
      return { ...data, id: (data as any)._id?.toString() || data.id };
    } catch (error: any) {
      console.error('Error creating focus block:', error.response?.data?.message || error.message);
      return null;
    }
  },

  updateFocusBlock: async (blockId: string, updates: Partial<Omit<FocusBlock, 'id'>>): Promise<boolean> => {
    try {
      await api.put(`/api/study/focus-blocks/${blockId}`, updates);
      return true;
    } catch (error: any) {
      console.error('Error updating focus block:', error.response?.data?.message || error.message);
      return false;
    }
  },

  deleteFocusBlock: async (blockId: string): Promise<boolean> => {
    try {
      await api.delete(`/api/study/focus-blocks/${blockId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting focus block:', error.response?.data?.message || error.message);
      return false;
    }
  },

  // Study Session operations
  getSessionsByUserId: async (): Promise<Session[]> => {
    try {
      const { data } = await api.get<any[]>('/api/study/sessions');
      return data.map(s => ({
        ...s,
        id: s._id?.toString() || s.id,
        date: new Date(s.sessionDate || s.date),
      }));
    } catch (error: any) {
      console.error('Error getting sessions:', error.response?.data?.message || error.message);
      return [];
    }
  },

  createSession: async (session: Omit<Session, 'id'>): Promise<Session | null> => {
    try {
      const { data } = await api.post<any>('/api/study/sessions', {
        ...session,
        date: session.date instanceof Date ? session.date.toISOString() : session.date,
      });
      return { ...data, id: data._id?.toString() || data.id, date: new Date(data.sessionDate || data.date) };
    } catch (error: any) {
      console.error('Error creating session:', error.response?.data?.message || error.message);
      return null;
    }
  },

  deleteSession: async (sessionId: string): Promise<boolean> => {
    try {
      await api.delete(`/api/study/sessions/${sessionId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting session:', error.response?.data?.message || error.message);
      return false;
    }
  },
};

export default studyService;
