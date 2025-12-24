'use client';

import { useState, useEffect } from 'react';
import { Plus, BookMarked, FileText, Send, ListTodo } from 'lucide-react';
import { Modal } from '@/components/ui';
import {
  DiaryPage,
  DiarySection,
  DiaryTaskItem,
  DiaryFooter,
} from '@/components/ui/DiaryPage';
import { PlannedTask, Template, Category, StartDraft } from '@/types';
import { generateId } from '@/lib/utils';

interface StartReportFormProps {
  workDate: string;
  categories: Category[];
  templates: Template[];
  draft?: StartDraft;
  onSubmit: (data: { workDate: string; plannedTasks: PlannedTask[] }) => void;
  onSaveDraft: (data: StartDraft) => void;
  onSaveTemplate: (template: Omit<Template, 'id'>) => void;
}

export function StartReportForm({
  workDate,
  categories,
  templates,
  draft,
  onSubmit,
  onSaveDraft,
  onSaveTemplate,
}: StartReportFormProps) {
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTask, setNewTask] = useState({
    task: '',
    estimatedHours: 1,
    categoryId: categories[0]?.id || '',
  });

  // Load draft on mount
  useEffect(() => {
    if (draft) {
      setPlannedTasks(draft.plannedTasks);
    }
  }, [draft]);

  // Auto-save draft when tasks change
  useEffect(() => {
    if (plannedTasks.length > 0) {
      onSaveDraft({ workDate, plannedTasks });
    }
  }, [plannedTasks, workDate, onSaveDraft]);

  const addTask = () => {
    if (!newTask.task.trim()) return;

    const task: PlannedTask = {
      id: generateId(),
      task: newTask.task,
      estimatedHours: newTask.estimatedHours,
      categoryId: newTask.categoryId,
    };

    setPlannedTasks([...plannedTasks, task]);
    setNewTask({
      task: '',
      estimatedHours: 1,
      categoryId: categories[0]?.id || '',
    });
  };

  const removeTask = (id: string) => {
    setPlannedTasks(plannedTasks.filter((t) => t.id !== id));
  };

  const updateTaskHours = (id: string, hours: number) => {
    setPlannedTasks(
      plannedTasks.map((t) => (t.id === id ? { ...t, estimatedHours: hours } : t))
    );
  };

  const applyTemplate = (template: Template) => {
    const newTasks = template.tasks.map((t) => ({
      ...t,
      id: generateId(),
    }));
    setPlannedTasks([...plannedTasks, ...newTasks]);
    setShowTemplateModal(false);
  };

  const saveAsTemplate = () => {
    if (!newTemplateName.trim() || plannedTasks.length === 0) return;

    onSaveTemplate({
      name: newTemplateName,
      tasks: plannedTasks.map(({ task, estimatedHours, categoryId }) => ({
        task,
        estimatedHours,
        categoryId,
      })),
    });

    setNewTemplateName('');
    setShowSaveTemplateModal(false);
  };

  const handleSubmit = () => {
    if (plannedTasks.length === 0) return;
    onSubmit({ workDate, plannedTasks });
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6B7280';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  const totalHours = plannedTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <>
      <DiaryPage date={workDate} title="本日の予定" variant="morning">
        {/* テンプレートボタン */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="diary-btn diary-btn-secondary"
          >
            <BookMarked className="w-4 h-4" />
            テンプレート
          </button>
          {plannedTasks.length > 0 && (
            <button
              onClick={() => setShowSaveTemplateModal(true)}
              className="diary-btn diary-btn-secondary"
            >
              <FileText className="w-4 h-4" />
              保存
            </button>
          )}
        </div>

        {/* タスク追加エリア */}
        <DiarySection title="タスクを追加" icon={<Plus className="w-4 h-4 text-amber-600" />}>
          <div className="diary-add-task">
            <input
              type="text"
              placeholder="今日やることを書いてみましょう..."
              value={newTask.task}
              onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="diary-input"
            />
            <select
              value={newTask.categoryId}
              onChange={(e) => setNewTask({ ...newTask, categoryId: e.target.value })}
              className="diary-select"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={newTask.estimatedHours}
              onChange={(e) =>
                setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) || 0 })
              }
              className="diary-task-input"
              style={{ width: '60px' }}
            />
            <span className="text-sm text-amber-700 dark:text-amber-300">h</span>
            <button onClick={addTask} className="diary-btn diary-btn-primary">
              追加
            </button>
          </div>
        </DiarySection>

        {/* タスクリスト */}
        <DiarySection title="本日のタスク" icon={<ListTodo className="w-4 h-4 text-amber-600" />}>
          {plannedTasks.length === 0 ? (
            <div className="diary-empty">
              まだタスクがありません。<br />
              上のフォームからタスクを追加してください。
            </div>
          ) : (
            <div>
              {plannedTasks.map((task) => (
                <DiaryTaskItem
                  key={task.id}
                  task={task.task}
                  category={getCategoryName(task.categoryId)}
                  categoryColor={getCategoryColor(task.categoryId)}
                  hours={task.estimatedHours}
                  onHoursChange={(hours) => updateTaskHours(task.id, hours)}
                  onRemove={() => removeTask(task.id)}
                />
              ))}
            </div>
          )}
        </DiarySection>

        {/* フッター */}
        {plannedTasks.length > 0 && (
          <DiaryFooter totalHours={totalHours}>
            <button onClick={handleSubmit} className="diary-btn diary-btn-primary">
              <Send className="w-4 h-4" />
              勤務開始報告
            </button>
          </DiaryFooter>
        )}
      </DiaryPage>

      {/* Template selection modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="テンプレートを選択"
      >
        {templates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            テンプレートがありません
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {template.tasks.length}個のタスク
                </p>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Save template modal */}
      <Modal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        title="テンプレートとして保存"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              テンプレート名
            </label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="例：週次ミーティング日"
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowSaveTemplateModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              キャンセル
            </button>
            <button
              onClick={saveAsTemplate}
              className="diary-btn diary-btn-primary"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
