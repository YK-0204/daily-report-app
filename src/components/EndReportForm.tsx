'use client';

import { useState, useEffect } from 'react';
import { Plus, Send, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import {
  DiaryPage,
  DiarySection,
  DiaryTextArea,
  DiaryTaskItem,
  DiaryIssueItem,
  DiaryFooter,
} from '@/components/ui/DiaryPage';
import {
  PlannedTask,
  CompletedTask,
  Issue,
  Category,
  IssueCategory,
  EndDraft,
} from '@/types';
import { generateId } from '@/lib/utils';

interface EndReportFormProps {
  workDate: string;
  plannedTasks: PlannedTask[];
  categories: Category[];
  issueCategories: IssueCategory[];
  draft?: EndDraft;
  onSubmit: (data: {
    summary: string;
    completedTasks: CompletedTask[];
    issues: Issue[];
    notes: string;
  }) => void;
  onSaveDraft: (data: EndDraft) => void;
}

export function EndReportForm({
  workDate,
  plannedTasks,
  categories,
  issueCategories,
  draft,
  onSubmit,
  onSaveDraft,
}: EndReportFormProps) {
  const [summary, setSummary] = useState('');
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notes, setNotes] = useState('');
  const [newIssue, setNewIssue] = useState({
    text: '',
    categoryId: issueCategories[0]?.id || '',
  });

  // Initialize from planned tasks or draft
  useEffect(() => {
    if (draft) {
      setSummary(draft.summary);
      setCompletedTasks(draft.completedTasks);
      setIssues(draft.issues);
      setNotes(draft.notes);
    } else if (plannedTasks.length > 0) {
      // Convert planned tasks to completed tasks with actual hours = estimated hours
      const converted: CompletedTask[] = plannedTasks.map((pt) => ({
        ...pt,
        actualHours: pt.estimatedHours,
      }));
      setCompletedTasks(converted);
    }
  }, [draft, plannedTasks]);

  // Auto-save draft
  useEffect(() => {
    if (summary || completedTasks.length > 0 || issues.length > 0 || notes) {
      onSaveDraft({ summary, completedTasks, issues, notes });
    }
  }, [summary, completedTasks, issues, notes, onSaveDraft]);

  const updateTaskActualHours = (id: string, actualHours: number) => {
    setCompletedTasks(
      completedTasks.map((t) => (t.id === id ? { ...t, actualHours } : t))
    );
  };

  const addIssue = () => {
    if (!newIssue.text.trim()) return;

    const issue: Issue = {
      id: generateId(),
      text: newIssue.text,
      categoryId: newIssue.categoryId,
    };

    setIssues([...issues, issue]);
    setNewIssue({
      text: '',
      categoryId: issueCategories[0]?.id || '',
    });
  };

  const removeIssue = (id: string) => {
    setIssues(issues.filter((i) => i.id !== id));
  };

  const handleSubmit = () => {
    onSubmit({ summary, completedTasks, issues, notes });
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6B7280';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  const getIssueCategoryName = (categoryId: string) => {
    return issueCategories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  const totalEstimated = completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const totalActual = completedTasks.reduce((sum, t) => sum + t.actualHours, 0);

  return (
    <DiaryPage date={workDate} title="本日のふりかえり" variant="evening">
      {/* 本日の概要 */}
      <DiarySection title="今日の概要" icon={<MessageSquare className="w-4 h-4 text-indigo-500" />}>
        <DiaryTextArea
          value={summary}
          onChange={setSummary}
          placeholder="今日一日を振り返って、どんな一日でしたか..."
          rows={4}
        />
      </DiarySection>

      {/* 完了タスク */}
      <DiarySection title="完了したこと" icon={<CheckCircle className="w-4 h-4 text-green-500" />}>
        {completedTasks.length === 0 ? (
          <div className="diary-empty">
            朝の報告がありません
          </div>
        ) : (
          <div>
            {completedTasks.map((task) => (
              <DiaryTaskItem
                key={task.id}
                task={task.task}
                category={getCategoryName(task.categoryId)}
                categoryColor={getCategoryColor(task.categoryId)}
                hours={task.actualHours}
                estimatedHours={task.estimatedHours}
                onHoursChange={(hours) => updateTaskActualHours(task.id, hours)}
                showActual
              />
            ))}
          </div>
        )}
      </DiarySection>

      {/* 課題・困りごと */}
      <DiarySection title="困ったこと・課題" icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}>
        <div className="diary-add-task mb-4">
          <input
            type="text"
            placeholder="困ったことや課題があれば..."
            value={newIssue.text}
            onChange={(e) => setNewIssue({ ...newIssue, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addIssue()}
            className="diary-input"
          />
          <select
            value={newIssue.categoryId}
            onChange={(e) => setNewIssue({ ...newIssue, categoryId: e.target.value })}
            className="diary-select"
          >
            {issueCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button onClick={addIssue} className="diary-btn diary-btn-primary">
            追加
          </button>
        </div>

        {issues.length > 0 && (
          <div>
            {issues.map((issue) => (
              <DiaryIssueItem
                key={issue.id}
                text={issue.text}
                category={getIssueCategoryName(issue.categoryId)}
                onRemove={() => removeIssue(issue.id)}
              />
            ))}
          </div>
        )}

        {issues.length === 0 && (
          <div className="diary-empty" style={{ padding: '16px' }}>
            特になし
          </div>
        )}
      </DiarySection>

      {/* 備考・明日への申し送り */}
      <DiarySection title="明日の自分へ" icon={<MessageSquare className="w-4 h-4 text-indigo-500" />}>
        <DiaryTextArea
          value={notes}
          onChange={setNotes}
          placeholder="明日やること、引き継ぎ事項など..."
          rows={3}
        />
      </DiarySection>

      {/* フッター */}
      <DiaryFooter totalHours={totalActual} estimatedHours={totalEstimated}>
        <button onClick={handleSubmit} className="diary-btn diary-btn-primary">
          <Send className="w-4 h-4" />
          勤務終了報告
        </button>
      </DiaryFooter>
    </DiaryPage>
  );
}
