'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Report,
  StartReport,
  EndReport,
  Template,
  Settings,
  Comment,
  StartDraft,
  EndDraft,
  Alert,
  SubmissionStatus,
  DEFAULT_CATEGORIES,
  DEFAULT_ISSUE_CATEGORIES,
  DEMO_USERS,
} from '@/types';
import { getFromStorage, setToStorage, generateId } from '@/lib/utils';

interface ReportContextType {
  reports: Report[];
  templates: Template[];
  settings: Settings;
  drafts: Record<string, StartDraft | EndDraft>;
  comments: Record<string, Comment[]>;
  reactions: Record<string, string[]>;

  // Report actions
  addStartReport: (report: Omit<StartReport, 'id' | 'submittedAt'>) => void;
  addEndReport: (report: Omit<EndReport, 'id' | 'submittedAt'>) => void;
  deleteReport: (id: string) => void;

  // Query helpers
  getTodayStart: (memberId: string) => StartReport | undefined;
  getTodayEnd: (memberId: string) => EndReport | undefined;
  getReportsByMember: (memberId: string) => Report[];
  getMemberStats: (memberId: string) => { total: number; cats: Record<string, number>; count: number };
  getWeekData: (memberId: string) => EndReport[];
  getAlerts: () => Alert[];
  getSubmissionStatus: () => SubmissionStatus[];

  // Draft actions
  saveDraft: (key: string, data: StartDraft | EndDraft) => void;
  getDraft: (key: string) => StartDraft | EndDraft | undefined;
  clearDraft: (key: string) => void;
  hasDraft: (key: string) => boolean;

  // Template actions
  addTemplate: (template: Omit<Template, 'id'>) => void;
  deleteTemplate: (id: string) => void;

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void;

  // Reaction/Comment actions
  addReaction: (reportId: string, emoji: string) => void;
  addComment: (reportId: string, comment: Omit<Comment, 'id' | 'time'>) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  categories: DEFAULT_CATEGORIES,
  issueCategories: DEFAULT_ISSUE_CATEGORIES,
  defaultStartTime: '09:00',
  defaultEndTime: '18:00',
  notifications: true,
};

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [drafts, setDrafts] = useState<Record<string, StartDraft | EndDraft>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setReports(getFromStorage<Report[]>('dr-reports', []));
    setTemplates(getFromStorage<Template[]>('dr-templates', []));
    setSettings(getFromStorage<Settings>('dr-settings', DEFAULT_SETTINGS));
    setDrafts(getFromStorage<Record<string, StartDraft | EndDraft>>('dr-drafts', {}));
    setComments(getFromStorage<Record<string, Comment[]>>('dr-comments', {}));
    setReactions(getFromStorage<Record<string, string[]>>('dr-reactions', {}));
    setIsLoaded(true);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (isLoaded) setToStorage('dr-reports', reports);
  }, [reports, isLoaded]);

  useEffect(() => {
    if (isLoaded) setToStorage('dr-templates', templates);
  }, [templates, isLoaded]);

  useEffect(() => {
    if (isLoaded) setToStorage('dr-settings', settings);
  }, [settings, isLoaded]);

  useEffect(() => {
    if (isLoaded) setToStorage('dr-drafts', drafts);
  }, [drafts, isLoaded]);

  useEffect(() => {
    if (isLoaded) setToStorage('dr-comments', comments);
  }, [comments, isLoaded]);

  useEffect(() => {
    if (isLoaded) setToStorage('dr-reactions', reactions);
  }, [reactions, isLoaded]);

  const today = new Date().toISOString().split('T')[0];

  // Report actions
  const addStartReport = (reportData: Omit<StartReport, 'id' | 'submittedAt'>) => {
    const newReport: StartReport = {
      ...reportData,
      id: generateId(),
      submittedAt: new Date().toLocaleString('ja-JP'),
    };
    setReports((prev) => [...prev, newReport]);
  };

  const addEndReport = (reportData: Omit<EndReport, 'id' | 'submittedAt'>) => {
    const newReport: EndReport = {
      ...reportData,
      id: generateId(),
      submittedAt: new Date().toLocaleString('ja-JP'),
    };
    setReports((prev) => [...prev, newReport]);
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  // Query helpers
  const getTodayStart = (memberId: string): StartReport | undefined => {
    return reports.find(
      (r): r is StartReport => r.type === 'start' && r.workDate === today && r.memberId === memberId
    );
  };

  const getTodayEnd = (memberId: string): EndReport | undefined => {
    return reports.find(
      (r): r is EndReport => r.type === 'end' && r.workDate === today && r.memberId === memberId
    );
  };

  const getReportsByMember = (memberId: string): Report[] => {
    return reports.filter((r) => r.memberId === memberId);
  };

  const getMemberStats = (memberId: string) => {
    const ends = reports.filter((r): r is EndReport => r.memberId === memberId && r.type === 'end');
    let total = 0;
    const cats: Record<string, number> = {};

    ends.forEach((r) => {
      (r.completedTasks || []).forEach((t) => {
        total += t.actualHours || 0;
        cats[t.categoryId] = (cats[t.categoryId] || 0) + (t.actualHours || 0);
      });
    });

    return { total, cats, count: ends.length };
  };

  const getWeekData = (memberId: string): EndReport[] => {
    const now = new Date();
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return reports.filter(
      (r): r is EndReport =>
        r.memberId === memberId && r.type === 'end' && new Date(r.workDate) >= week
    );
  };

  const getAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();
    const days3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const userMembers = DEMO_USERS.filter((m) => m.role === 'user');

    userMembers.forEach((m) => {
      const recent = reports.filter(
        (r): r is EndReport =>
          r.memberId === m.id && r.type === 'end' && new Date(r.workDate) >= days3
      );

      const counts: Record<string, number> = {};
      recent.forEach((r) => {
        (r.issues || []).forEach((i) => {
          if (i.text.trim()) {
            counts[i.categoryId] = (counts[i.categoryId] || 0) + 1;
          }
        });
      });

      Object.entries(counts).forEach(([catId, n]) => {
        if (n >= 2) {
          const catName =
            settings.issueCategories.find((c) => c.id === catId)?.name || 'その他';
          alerts.push({
            member: m.name,
            memberId: m.id,
            category: catName,
            count: n,
          });
        }
      });
    });

    return alerts;
  };

  const getSubmissionStatus = (): SubmissionStatus[] => {
    const userMembers = DEMO_USERS.filter((m) => m.role === 'user');
    return userMembers.map((m) => ({
      id: m.id,
      name: m.name,
      hasStart: reports.some((r) => r.memberId === m.id && r.type === 'start' && r.workDate === today),
      hasEnd: reports.some((r) => r.memberId === m.id && r.type === 'end' && r.workDate === today),
    }));
  };

  // Draft actions
  const saveDraft = (key: string, data: StartDraft | EndDraft) => {
    setDrafts((prev) => ({ ...prev, [key]: data }));
  };

  const getDraft = (key: string) => drafts[key];

  const clearDraft = (key: string) => {
    setDrafts((prev) => {
      const newDrafts = { ...prev };
      delete newDrafts[key];
      return newDrafts;
    });
  };

  const hasDraft = (key: string) => !!drafts[key];

  // Template actions
  const addTemplate = (templateData: Omit<Template, 'id'>) => {
    const newTemplate: Template = {
      ...templateData,
      id: generateId(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // Settings actions
  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Reaction/Comment actions
  const addReaction = (reportId: string, emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [reportId]: [...new Set([...(prev[reportId] || []), emoji])],
    }));
  };

  const addComment = (reportId: string, commentData: Omit<Comment, 'id' | 'time'>) => {
    const newComment: Comment = {
      ...commentData,
      id: generateId(),
      time: new Date().toLocaleString('ja-JP'),
    };
    setComments((prev) => ({
      ...prev,
      [reportId]: [...(prev[reportId] || []), newComment],
    }));
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        templates,
        settings,
        drafts,
        comments,
        reactions,
        addStartReport,
        addEndReport,
        deleteReport,
        getTodayStart,
        getTodayEnd,
        getReportsByMember,
        getMemberStats,
        getWeekData,
        getAlerts,
        getSubmissionStatus,
        saveDraft,
        getDraft,
        clearDraft,
        hasDraft,
        addTemplate,
        deleteTemplate,
        updateSettings,
        addReaction,
        addComment,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
}
