'use client';

import { useState, useMemo } from 'react';
import { Sun, Moon, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth, useReports } from '@/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatDateISO, formatDate, getMonthDates } from '@/lib/utils';
import { StartReport, EndReport } from '@/types';

export default function CalendarPage() {
  const { user } = useAuth();
  const { reports, settings, reactions } = useReports();

  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    formatDateISO(new Date())
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const memberId = user?.id || '';

  // Get user's reports
  const userStartReports = reports.filter(
    (r): r is StartReport => r.type === 'start' && r.memberId === memberId
  );
  const userEndReports = reports.filter(
    (r): r is EndReport => r.type === 'end' && r.memberId === memberId
  );

  const getDateStatus = (dateStr: string) => {
    const hasStart = userStartReports.some((r) => r.workDate === dateStr);
    const hasEnd = userEndReports.some((r) => r.workDate === dateStr);
    return { hasStart, hasEnd };
  };

  const selectedStart = selectedDate
    ? userStartReports.find((r) => r.workDate === selectedDate)
    : undefined;
  const selectedEnd = selectedDate
    ? userEndReports.find((r) => r.workDate === selectedDate)
    : undefined;

  // Calendar data
  const monthDates = useMemo(() => {
    return getMonthDates(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];
  const today = formatDateISO(new Date());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        カレンダー
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  &lt;
                </button>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  &gt;
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthDates.flat().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="p-2" />;
                  }

                  const dateStr = formatDateISO(date);
                  const { hasStart, hasEnd } = getDateStatus(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === today;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-2 text-sm rounded transition-colors ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isToday
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-center">{date.getDate()}</div>
                      <div className="flex justify-center gap-0.5 mt-1">
                        {hasStart && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-yellow-300' : 'bg-yellow-400'
                            }`}
                          />
                        )}
                        {hasEnd && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-green-300' : 'bg-green-500'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span>開始報告</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>終了報告</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected date details */}
        <div className="lg:col-span-2">
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>{formatDate(selectedDate)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      selectedStart
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className={`w-5 h-5 ${selectedStart ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="font-medium text-gray-900 dark:text-white">勤務開始</span>
                      {selectedStart ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    {selectedStart && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        提出: {selectedStart.submittedAt}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      selectedEnd
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className={`w-5 h-5 ${selectedEnd ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="font-medium text-gray-900 dark:text-white">勤務終了</span>
                      {selectedEnd ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    {selectedEnd && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        提出: {selectedEnd.submittedAt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Start Report Details */}
                {selectedStart && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      予定タスク
                    </h4>
                    <div className="space-y-2">
                      {selectedStart.plannedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  settings.categories.find((c) => c.id === task.categoryId)?.color ||
                                  '#6B7280',
                              }}
                            />
                            <span className="text-gray-900 dark:text-white">{task.task}</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            予定: {task.estimatedHours}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* End Report Details */}
                {selectedEnd && (
                  <div className="space-y-4">
                    {selectedEnd.summary && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">概要</h4>
                        <p className="text-gray-600 dark:text-gray-400">{selectedEnd.summary}</p>
                      </div>
                    )}

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Moon className="w-4 h-4 text-green-500" />
                        完了タスク
                      </h4>
                      <div className="space-y-2">
                        {selectedEnd.completedTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    settings.categories.find((c) => c.id === task.categoryId)?.color ||
                                    '#6B7280',
                                }}
                              />
                              <span className="text-gray-900 dark:text-white">{task.task}</span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              予定: {task.estimatedHours}h → 実績: {task.actualHours}h
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedEnd.issues.length > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          課題・困りごと
                        </h4>
                        {selectedEnd.issues.map((issue) => (
                          <div key={issue.id} className="p-2 bg-white dark:bg-gray-800 rounded mb-2">
                            <p className="text-gray-900 dark:text-white">{issue.text}</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                              {settings.issueCategories.find((c) => c.id === issue.categoryId)?.name ||
                                issue.categoryId}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedEnd.notes && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">備考・申し送り</h4>
                        <p className="text-gray-600 dark:text-gray-400">{selectedEnd.notes}</p>
                      </div>
                    )}

                    {/* Reactions */}
                    {reactions[selectedEnd.id] && reactions[selectedEnd.id].length > 0 && (
                      <div className="flex gap-2">
                        {reactions[selectedEnd.id].map((emoji, i) => (
                          <span key={i} className="text-2xl">{emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* No reports */}
                {!selectedStart && !selectedEnd && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>この日の報告はありません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
