'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Send, Clock, AlertTriangle } from 'lucide-react';
import { Button, Input, Select, Card, CardContent } from '@/components/ui';
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
  const timeDiff = totalActual - totalEstimated;

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            本日の実績報告
          </h2>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            本日の概要
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="今日行った作業の概要を記入してください..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Completed tasks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            完了タスク（実績時間を入力）
          </label>
          <div className="space-y-2">
            {completedTasks.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                朝の報告がありません
              </p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: getCategoryColor(task.categoryId) }}
                  />
                  <span className="flex-1 text-gray-900 dark:text-white">
                    {task.task}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getCategoryName(task.categoryId)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      予定: {task.estimatedHours}h
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">→</span>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={task.actualHours}
                      onChange={(e) =>
                        updateTaskActualHours(task.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-600 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">h</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Time summary */}
          {completedTasks.length > 0 && (
            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  予定: {totalEstimated.toFixed(1)}h
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  実績: {totalActual.toFixed(1)}h
                </span>
                <span
                  className={`font-medium ${
                    timeDiff > 0
                      ? 'text-red-500'
                      : timeDiff < 0
                      ? 'text-green-500'
                      : 'text-gray-500'
                  }`}
                >
                  {timeDiff > 0 ? '+' : ''}
                  {timeDiff.toFixed(1)}h
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Issues */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" />
            課題・困りごと
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1">
              <Input
                placeholder="課題や困りごとを入力..."
                value={newIssue.text}
                onChange={(e) => setNewIssue({ ...newIssue, text: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addIssue()}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={newIssue.categoryId}
                onChange={(e) => setNewIssue({ ...newIssue, categoryId: e.target.value })}
                options={issueCategories.map((c) => ({ value: c.id, label: c.name }))}
                className="w-40"
              />
              <Button onClick={addIssue} size="md">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="flex-1 text-gray-900 dark:text-white">
                  {issue.text}
                </span>
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  {getIssueCategoryName(issue.categoryId)}
                </span>
                <button
                  onClick={() => removeIssue(issue.id)}
                  className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            備考・明日への申し送り
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="明日の予定や引き継ぎ事項など..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t dark:border-gray-600">
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            勤務終了報告
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
