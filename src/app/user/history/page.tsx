'use client';

import { useState } from 'react';
import { useAuth, useReports } from '@/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { AlertTriangle, Clock, FileText } from 'lucide-react';
import { EndReport } from '@/types';

export default function HistoryPage() {
  const { user } = useAuth();
  const { reports, settings, getMemberStats, reactions } = useReports();

  const memberId = user?.id || '';
  const stats = getMemberStats(memberId);

  const userEndReports = reports
    .filter((r): r is EndReport => r.type === 'end' && r.memberId === memberId)
    .sort((a, b) => b.workDate.localeCompare(a.workDate));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        履歴
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">総報告数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.count}件
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">累計作業時間</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total.toFixed(1)}時間
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">カテゴリ別時間</p>
              <div className="space-y-1">
                {Object.entries(stats.cats)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([catId, hours]) => {
                    const cat = settings.categories.find((c) => c.id === catId);
                    return (
                      <div key={catId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat?.color || '#6B7280' }}
                          />
                          <span className="text-gray-700 dark:text-gray-300">{cat?.name || catId}</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">{hours.toFixed(1)}h</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>終了報告一覧 ({userEndReports.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {userEndReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              終了報告がありません
            </div>
          ) : (
            <div className="space-y-4">
              {userEndReports.map((report) => {
                const totalActual = report.completedTasks.reduce(
                  (sum, t) => sum + t.actualHours,
                  0
                );
                const totalEstimated = report.completedTasks.reduce(
                  (sum, t) => sum + t.estimatedHours,
                  0
                );

                return (
                  <div
                    key={report.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {report.workDate}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          提出: {report.submittedAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          {totalActual.toFixed(1)}h
                        </span>
                        {totalActual !== totalEstimated && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            予定: {totalEstimated.toFixed(1)}h
                          </p>
                        )}
                      </div>
                    </div>

                    {report.summary && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {report.summary}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {report.completedTasks.map((task) => {
                        const cat = settings.categories.find((c) => c.id === task.categoryId);
                        return (
                          <span
                            key={task.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cat?.color || '#6B7280' }}
                            />
                            {task.task.length > 20 ? task.task.slice(0, 20) + '...' : task.task}
                            ({task.actualHours}h)
                          </span>
                        );
                      })}
                    </div>

                    {report.issues.length > 0 && (
                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          課題 ({report.issues.length}件)
                        </p>
                        {report.issues.map((issue) => (
                          <p key={issue.id} className="text-sm text-amber-600 dark:text-amber-400">
                            • {issue.text}
                          </p>
                        ))}
                      </div>
                    )}

                    {report.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                        備考: {report.notes}
                      </p>
                    )}

                    {/* Reactions */}
                    {reactions[report.id] && reactions[report.id].length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {reactions[report.id].map((emoji, i) => (
                          <span key={i} className="text-lg">{emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
