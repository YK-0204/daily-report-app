'use client';

import { Users, FileText, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle, Sun, Moon, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CategoryPieChart } from '@/components';
import { useAuth, useReports } from '@/context';
import { DEMO_USERS, EndReport } from '@/types';
import { formatDate, formatDateISO } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const {
    reports,
    settings,
    getAlerts,
    getSubmissionStatus,
    reactions,
    comments,
    addReaction,
    addComment,
  } = useReports();

  const today = formatDateISO(new Date());
  const alerts = getAlerts();
  const submissionStatus = getSubmissionStatus();

  // Get this week's end reports for stats
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  const weekStartStr = formatDateISO(startOfWeek);

  const weekEndReports = reports.filter(
    (r): r is EndReport => r.type === 'end' && r.workDate >= weekStartStr
  );

  const totalWeekHours = weekEndReports.reduce(
    (sum, r) => sum + (r.completedTasks || []).reduce((ts, t) => ts + (t.actualHours || 0), 0),
    0
  );

  const activeUsers = new Set(weekEndReports.map((r) => r.memberId)).size;
  const totalUsers = DEMO_USERS.filter((u) => u.role === 'user').length;

  const todayCompleted = submissionStatus.filter((s) => s.hasStart && s.hasEnd).length;
  const todayStartOnly = submissionStatus.filter((s) => s.hasStart && !s.hasEnd).length;

  // Recent end reports (last 10)
  const recentEndReports = reports
    .filter((r): r is EndReport => r.type === 'end')
    .sort((a, b) => {
      const dateCompare = b.workDate.localeCompare(a.workDate);
      if (dateCompare !== 0) return dateCompare;
      return b.submittedAt.localeCompare(a.submittedAt);
    })
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          管理者ダッシュボード
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{formatDate(new Date())}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">アクティブユーザー</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeUsers}/{totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">今日の完了報告</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayCompleted}/{totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">今週の総作業時間</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalWeekHours.toFixed(1)}時間
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">今週の報告数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weekEndReports.length}件
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            今週のカテゴリ別作業時間
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryPieChart reports={weekEndReports} categories={settings.categories} />
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="border-amber-300 dark:border-amber-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              注意が必要なメンバー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {alert.member}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      「{alert.category}」の課題が3日間で{alert.count}回報告されています
                    </p>
                  </div>
                  <a
                    href={`/admin/team?member=${alert.memberId}`}
                    className="px-3 py-1 text-sm bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                  >
                    詳細を見る
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Submission Status */}
      <Card>
        <CardHeader>
          <CardTitle>本日の提出状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {submissionStatus.map((status) => (
              <div
                key={status.id}
                className={`p-4 rounded-lg border ${
                  status.hasStart && status.hasEnd
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : status.hasStart
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="font-medium text-gray-900 dark:text-white mb-2">
                  {status.name}
                </p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <Sun className={`w-4 h-4 ${status.hasStart ? 'text-green-500' : 'text-gray-400'}`} />
                    {status.hasStart ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Moon className={`w-4 h-4 ${status.hasEnd ? 'text-green-500' : 'text-gray-400'}`} />
                    {status.hasEnd ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent End Reports */}
      <Card>
        <CardHeader>
          <CardTitle>最新の終了報告</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEndReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              終了報告がありません
            </div>
          ) : (
            <div className="space-y-4">
              {recentEndReports.map((report) => {
                const member = DEMO_USERS.find((u) => u.id === report.memberId);
                const totalActual = report.completedTasks.reduce(
                  (sum, t) => sum + t.actualHours,
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
                          {member?.name || '不明なユーザー'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {report.workDate} - {report.submittedAt}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {totalActual.toFixed(1)}h
                      </span>
                    </div>

                    {report.summary && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {report.summary}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {report.completedTasks.slice(0, 3).map((task) => (
                        <span
                          key={task.id}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {task.task.length > 20 ? task.task.slice(0, 20) + '...' : task.task}
                        </span>
                      ))}
                      {report.completedTasks.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                          +{report.completedTasks.length - 3}
                        </span>
                      )}
                    </div>

                    {report.issues.length > 0 && (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{report.issues.length}件の課題</span>
                      </div>
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
