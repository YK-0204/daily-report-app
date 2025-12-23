// User types
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  color: string;
}

// Issue Category types
export interface IssueCategory {
  id: string;
  name: string;
}

// Planned Task (for start report)
export interface PlannedTask {
  id: string;
  task: string;
  estimatedHours: number;
  categoryId: string;
}

// Completed Task (for end report)
export interface CompletedTask extends PlannedTask {
  actualHours: number;
}

// Issue (for end report)
export interface Issue {
  id: string;
  text: string;
  categoryId: string;
}

// Report types - Start Report
export interface StartReport {
  id: string;
  type: 'start';
  memberId: string;
  workDate: string;
  plannedTasks: PlannedTask[];
  submittedAt: string;
}

// Report types - End Report
export interface EndReport {
  id: string;
  type: 'end';
  memberId: string;
  workDate: string;
  summary: string;
  completedTasks: CompletedTask[];
  issues: Issue[];
  notes: string;
  submittedAt: string;
}

export type Report = StartReport | EndReport;

// Draft types
export interface StartDraft {
  workDate: string;
  plannedTasks: PlannedTask[];
}

export interface EndDraft {
  summary: string;
  completedTasks: CompletedTask[];
  issues: Issue[];
  notes: string;
}

// Template types
export interface Template {
  id: string;
  name: string;
  tasks: Omit<PlannedTask, 'id'>[];
}

// Comment types
export interface Comment {
  id: string;
  text: string;
  author: string;
  time: string;
}

// Settings types
export interface Settings {
  categories: Category[];
  issueCategories: IssueCategory[];
  defaultStartTime: string;
  defaultEndTime: string;
  notifications: boolean;
}

// Alert types
export interface Alert {
  member: string;
  memberId: string;
  category: string;
  count: number;
}

// Submission status
export interface SubmissionStatus {
  id: string;
  name: string;
  hasStart: boolean;
  hasEnd: boolean;
}

// Demo users
export const DEMO_USERS: User[] = [
  { id: 'user1', name: '田中 太郎', role: 'user' },
  { id: 'user2', name: '佐藤 花子', role: 'user' },
  { id: 'user3', name: '鈴木 一郎', role: 'user' },
  { id: 'admin1', name: '山田 美咲', role: 'admin' },
];

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'dev', name: '開発/実装', color: '#3B82F6' },
  { id: 'mtg', name: 'MTG', color: '#8B5CF6' },
  { id: 'doc', name: 'ドキュメント', color: '#10B981' },
  { id: 'review', name: 'レビュー', color: '#F59E0B' },
  { id: 'learning', name: '学習', color: '#EC4899' },
  { id: 'misc', name: '雑務/その他', color: '#6B7280' },
];

// Default issue categories
export const DEFAULT_ISSUE_CATEGORIES: IssueCategory[] = [
  { id: 'tech', name: '技術的な課題' },
  { id: 'resource', name: 'リソース/時間不足' },
  { id: 'communication', name: 'コミュニケーション' },
  { id: 'unclear', name: '要件/仕様の不明点' },
  { id: 'other', name: 'その他' },
];

// Reactions
export const REACTIONS = ['👍', '❤️', '🎉', '💪', '🙏'];

// AI Analysis types
export interface WeeklySummary {
  highlights: string[];
  suggestions: string[];
  totalHours: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  hours: number;
}

export interface WeekData {
  totalHours: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface ComparisonAnalysis {
  currentWeek: WeekData;
  previousWeek: WeekData;
  insights: string[];
  trends: string[];
}
