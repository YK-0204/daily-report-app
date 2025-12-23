'use client';

import { useCallback, useMemo } from 'react';
import { Sun, Moon, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { StartReportForm } from '@/components/StartReportForm';
import { EndReportForm } from '@/components/EndReportForm';
import { useAuth, useReports } from '@/context';
import { formatDate, formatDateISO } from '@/lib/utils';
import { StartDraft, EndDraft, EndReport, PlannedTask } from '@/types';

export default function UserHomePage() {
  const { user } = useAuth();
  const {
    reports,
    settings,
    templates,
    getTodayStart,
    getTodayEnd,
    getMemberStats,
    getWeekData,
    addStartReport,
    addEndReport,
    saveDraft,
    getDraft,
    clearDraft,
    addTemplate,
  } = useReports();

  const today = formatDateISO(new Date());
  const memberId = user?.id || '';

  const todayStart = getTodayStart(memberId);
  const todayEnd = getTodayEnd(memberId);
  const stats = getMemberStats(memberId);
  const weekData = getWeekData(memberId);

  const startDraftKey = `${memberId}-${today}-start`;
  const endDraftKey = `${memberId}-${today}-end`;

  const startDraft = getDraft(startDraftKey) as StartDraft | undefined;
  const endDraft = getDraft(endDraftKey) as EndDraft | undefined;

  // Calculate week stats
  const weekTotalHours = useMemo(() => {
    return weekData.reduce((sum, r) => {
      return sum + (r.completedTasks || []).reduce((ts, t) => ts + (t.actualHours || 0), 0);
    }, 0);
  }, [weekData]);

  const handleStartSubmit = useCallback(
    (data: { workDate: string; plannedTasks: PlannedTask[] }) => {
      addStartReport({
        type: 'start',
        memberId,
        workDate: data.workDate,
        plannedTasks: data.plannedTasks,
      });
      clearDraft(startDraftKey);
    },
    [addStartReport, memberId, clearDraft, startDraftKey]
  );

  const handleEndSubmit = useCallback(
    (data: {
      summary: string;
      completedTasks: EndReport['completedTasks'];
      issues: EndReport['issues'];
      notes: string;
    }) => {
      addEndReport({
        type: 'end',
        memberId,
        workDate: today,
        summary: data.summary,
        completedTasks: data.completedTasks,
        issues: data.issues,
        notes: data.notes,
      });
      clearDraft(endDraftKey);
    },
    [addEndReport, memberId, today, clearDraft, endDraftKey]
  );

  const handleStartDraftSave = useCallback(
    (data: StartDraft) => {
      saveDraft(startDraftKey, data);
    },
    [saveDraft, startDraftKey]
  );

  const handleEndDraftSave = useCallback(
    (data: EndDraft) => {
      saveDraft(endDraftKey, data);
    },
    [saveDraft, endDraftKey]
  );

  const handleSaveTemplate = useCallback(
    (template: Omit<typeof templates[0], 'id'>) => {
      addTemplate(template);
    },
    [addTemplate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          こんにちは、{user?.name}さん
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{formatDate(new Date())}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">今週の作業時間</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weekTotalHours.toFixed(1)}時間
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">報告件数（累計）</p>
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
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
      </div>

      {/* Today's Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`border-2 ${
            todayStart
              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
              : 'border-blue-300 dark:border-blue-700'
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${
                  todayStart
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-blue-100 dark:bg-blue-900'
                }`}
              >
                <Sun
                  className={`w-6 h-6 ${
                    todayStart
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">勤務開始</p>
                {todayStart ? (
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    報告済み ({todayStart.submittedAt})
                  </p>
                ) : (
                  <p className="font-semibold text-blue-600 dark:text-blue-400">未報告</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-2 ${
            todayEnd
              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
              : todayStart
              ? 'border-amber-300 dark:border-amber-700'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${
                  todayEnd
                    ? 'bg-green-100 dark:bg-green-900'
                    : todayStart
                    ? 'bg-amber-100 dark:bg-amber-900'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Moon
                  className={`w-6 h-6 ${
                    todayEnd
                      ? 'text-green-600 dark:text-green-400'
                      : todayStart
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">勤務終了</p>
                {todayEnd ? (
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    報告済み ({todayEnd.submittedAt})
                  </p>
                ) : todayStart ? (
                  <p className="font-semibold text-amber-600 dark:text-amber-400">未報告</p>
                ) : (
                  <p className="font-semibold text-gray-400 dark:text-gray-500">
                    開始報告後に入力可能
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Forms */}
      {!todayStart && (
        <StartReportForm
          workDate={today}
          categories={settings.categories}
          templates={templates}
          draft={startDraft}
          onSubmit={handleStartSubmit}
          onSaveDraft={handleStartDraftSave}
          onSaveTemplate={handleSaveTemplate}
        />
      )}

      {todayStart && !todayEnd && (
        <EndReportForm
          workDate={today}
          plannedTasks={todayStart.plannedTasks}
          categories={settings.categories}
          issueCategories={settings.issueCategories}
          draft={endDraft}
          onSubmit={handleEndSubmit}
          onSaveDraft={handleEndDraftSave}
        />
      )}

      {/* Today's completed reports summary */}
      {todayEnd && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              本日の報告完了
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">概要</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {todayEnd.summary || '（概要なし）'}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">完了タスク</h4>
              <div className="space-y-2">
                {todayEnd.completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            settings.categories.find((c) => c.id === task.categoryId)
                              ?.color || '#6B7280',
                        }}
                      />
                      <span className="text-gray-900 dark:text-white">{task.task}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      予定: {task.estimatedHours}h → 実績: {task.actualHours}h
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {todayEnd.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  課題・困りごと
                </h4>
                <div className="space-y-2">
                  {todayEnd.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                    >
                      <p className="text-gray-900 dark:text-white">{issue.text}</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                        {settings.issueCategories.find((c) => c.id === issue.categoryId)
                          ?.name || issue.categoryId}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {todayEnd.notes && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  備考・申し送り
                </h4>
                <p className="text-gray-600 dark:text-gray-400">{todayEnd.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
