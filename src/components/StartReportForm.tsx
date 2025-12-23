'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Send, BookMarked, FileText, Clock } from 'lucide-react';
import { Button, Input, Select, Card, CardContent, Modal } from '@/components/ui';
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

  const updateTask = (id: string, updates: Partial<PlannedTask>) => {
    setPlannedTasks(
      plannedTasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
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
      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                本日の予定タスク
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateModal(true)}
              >
                <BookMarked className="w-4 h-4 mr-1" />
                テンプレート
              </Button>
              {plannedTasks.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveTemplateModal(true)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  保存
                </Button>
              )}
            </div>
          </div>

          {/* New task input */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="タスクを入力..."
                value={newTask.task}
                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={newTask.categoryId}
                onChange={(e) => setNewTask({ ...newTask, categoryId: e.target.value })}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                className="w-32"
              />
              <Input
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                value={newTask.estimatedHours}
                onChange={(e) =>
                  setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) || 0 })
                }
                className="w-20"
              />
              <Button onClick={addTask} size="md">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {plannedTasks.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                タスクがありません
              </p>
            ) : (
              plannedTasks.map((task) => (
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
                  <input
                    type="number"
                    min={0.5}
                    max={24}
                    step={0.5}
                    value={task.estimatedHours}
                    onChange={(e) =>
                      updateTask(task.id, {
                        estimatedHours: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-16 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-600 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">h</span>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Total and submit */}
          {plannedTasks.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t dark:border-gray-600">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                予定合計: <span className="font-semibold">{totalHours.toFixed(1)}時間</span>
              </span>
              <Button onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" />
                勤務開始報告
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
          <Input
            label="テンプレート名"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="例：週次ミーティング日"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSaveTemplateModal(false)}>
              キャンセル
            </Button>
            <Button onClick={saveAsTemplate}>
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
