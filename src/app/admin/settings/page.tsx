'use client';

import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { useReports } from '@/context';
import { Category } from '@/types';
import { generateId } from '@/lib/utils';

export default function SettingsPage() {
  const { settings, updateSettings, templates, deleteTemplate } = useReports();
  const [categories, setCategories] = useState<Category[]>(settings.categories);
  const [defaultStartTime, setDefaultStartTime] = useState(settings.defaultStartTime);
  const [defaultEndTime, setDefaultEndTime] = useState(settings.defaultEndTime);

  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3B82F6',
  });

  const addCategory = () => {
    if (!newCategory.name.trim()) return;

    const category: Category = {
      id: generateId(),
      name: newCategory.name,
      color: newCategory.color,
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', color: '#3B82F6' });
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const updateCategoryColor = (id: string, color: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, color } : c)));
  };

  const saveSettings = () => {
    updateSettings({
      categories,
      defaultStartTime,
      defaultEndTime,
    });
    alert('設定を保存しました');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        設定
      </h1>

      {/* Time Settings */}
      <Card>
        <CardHeader>
          <CardTitle>デフォルト勤務時間</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="time"
              label="開始時間"
              value={defaultStartTime}
              onChange={(e) => setDefaultStartTime(e.target.value)}
            />
            <Input
              type="time"
              label="終了時間"
              value={defaultEndTime}
              onChange={(e) => setDefaultEndTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>カテゴリ設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing categories */}
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <input
                    type="color"
                    value={category.color}
                    onChange={(e) => updateCategoryColor(category.id, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="flex-1 text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                  <button
                    onClick={() => removeCategory(category.id)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new category */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                placeholder="新しいカテゴリ名"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="flex-1"
              />
              <Button onClick={addCategory}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>テンプレート管理</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              テンプレートがありません
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {template.tasks.length}個のタスク
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg">
          <Save className="w-5 h-5 mr-2" />
          設定を保存
        </Button>
      </div>
    </div>
  );
}
