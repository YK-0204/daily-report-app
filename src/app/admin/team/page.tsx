'use client';

import { useState, useMemo } from 'react';
import { User, Clock, FileText, AlertTriangle, BarChart3, MessageCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { TeamHoursBarChart } from '@/components';
import { useAuth, useReports } from '@/context';
import { DEMO_USERS, EndReport, REACTIONS } from '@/types';
import { formatDateISO } from '@/lib/utils';

export default function TeamPage() {
  const { user } = useAuth();
  const { reports, settings, getMemberStats, reactions, comments, addReaction, addComment } = useReports();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const teamMembers = DEMO_USERS.filter((u) => u.role === 'user');

  const getWeekStats = (memberId: string) => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const weekStartStr = formatDateISO(startOfWeek);

    const memberEndReports = reports.filter(
      (r): r is EndReport => r.type === 'end' && r.memberId === memberId && r.workDate >= weekStartStr
    );

    const totalHours = memberEndReports.reduce(
      (sum, r) => sum + (r.completedTasks || []).reduce((ts, t) => ts + (t.actualHours || 0), 0),
      0
    );

    const totalIssues = memberEndReports.reduce(
      (sum, r) => sum + (r.issues || []).length,
      0
    );

    return {
      weekReports: memberEndReports.length,
      weekHours: totalHours,
      weekIssues: totalIssues,
    };
  };

  const selectedMember = selectedUserId
    ? teamMembers.find((m) => m.id === selectedUserId)
    : null;

  const selectedMemberEndReports = selectedUserId
    ? reports
        .filter((r): r is EndReport => r.type === 'end' && r.memberId === selectedUserId)
        .sort((a, b) => b.workDate.localeCompare(a.workDate))
    : [];

  const selectedMemberStats = selectedUserId ? getMemberStats(selectedUserId) : null;

  const allEndReports = useMemo(() => {
    return reports.filter((r): r is EndReport => r.type === 'end');
  }, [reports]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        チームメンバー
      </h1>

      {/* Team Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            メンバー別作業時間（累計）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeamHoursBarChart reports={allEndReports} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teamMembers.map((member) => {
          const weekStats = getWeekStats(member.id);
          const isSelected = selectedUserId === member.id;

          return (
            <Card
              key={member.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedUserId(isSelected ? null : member.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      今週: {weekStats.weekReports}件 / {weekStats.weekHours.toFixed(1)}時間
                    </p>
                    {weekStats.weekIssues > 0 && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {weekStats.weekIssues}件の課題
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedMember && selectedMemberStats && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {selectedMember.name}の詳細
          </h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">累計報告数</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedMemberStats.count}件
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
                      {selectedMemberStats.total.toFixed(1)}時間
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
                    {Object.entries(selectedMemberStats.cats).slice(0, 4).map(([catId, hours]) => {
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

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>終了報告一覧 ({selectedMemberEndReports.length}件)</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMemberEndReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  終了報告がありません
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedMemberEndReports.slice(0, 10).map((report) => {
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
                              {report.workDate}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              提出: {report.submittedAt}
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
                          {report.completedTasks.map((task) => (
                            <span
                              key={task.id}
                              className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {task.task.length > 25 ? task.task.slice(0, 25) + '...' : task.task}
                              ({task.actualHours}h)
                            </span>
                          ))}
                        </div>

                        {report.issues.length > 0 && (
                          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              課題
                            </p>
                            {report.issues.map((issue) => (
                              <p key={issue.id} className="text-sm text-amber-600 dark:text-amber-400">
                                • {issue.text}
                                ({settings.issueCategories.find((c) => c.id === issue.categoryId)?.name || issue.categoryId})
                              </p>
                            ))}
                          </div>
                        )}

                        {report.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                            備考: {report.notes}
                          </p>
                        )}

                        {/* Reactions and Comments */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          {/* Reaction buttons */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">リアクション:</span>
                            <div className="flex gap-1">
                              {REACTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(report.id, emoji)}
                                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                                    reactions[report.id]?.includes(emoji)
                                      ? 'bg-blue-100 dark:bg-blue-900'
                                      : ''
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Display reactions */}
                          {reactions[report.id] && reactions[report.id].length > 0 && (
                            <div className="flex gap-1 mb-2">
                              {reactions[report.id].map((emoji, i) => (
                                <span key={i} className="text-xl">{emoji}</span>
                              ))}
                            </div>
                          )}

                          {/* Comments section */}
                          <button
                            onClick={() => setExpandedReportId(
                              expandedReportId === report.id ? null : report.id
                            )}
                            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <MessageCircle className="w-4 h-4" />
                            コメント ({comments[report.id]?.length || 0})
                          </button>

                          {expandedReportId === report.id && (
                            <div className="mt-3 space-y-3">
                              {/* Existing comments */}
                              {comments[report.id]?.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {comment.author}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {comment.time}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {comment.text}
                                  </p>
                                </div>
                              ))}

                              {/* New comment input */}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="コメントを入力..."
                                  value={expandedReportId === report.id ? newComment : ''}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newComment.trim()) {
                                      addComment(report.id, {
                                        text: newComment,
                                        author: user?.name || '管理者',
                                      });
                                      setNewComment('');
                                    }
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (newComment.trim()) {
                                      addComment(report.id, {
                                        text: newComment,
                                        author: user?.name || '管理者',
                                      });
                                      setNewComment('');
                                    }
                                  }}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
