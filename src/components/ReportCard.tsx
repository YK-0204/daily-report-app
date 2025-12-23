'use client';

// This component is deprecated and replaced by inline report displays in each page.
// Keeping it for backwards compatibility but with minimal implementation.

import { Card, CardContent } from '@/components/ui';
import { EndReport, Category, REACTIONS } from '@/types';

interface ReportCardProps {
  report: EndReport;
  categories: Category[];
  currentUserId: string;
  currentUserName: string;
  showUserName?: boolean;
}

export function ReportCard({
  report,
  categories,
  showUserName = false,
}: ReportCardProps) {
  const totalHours = report.completedTasks.reduce((sum, t) => sum + t.actualHours, 0);

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {report.workDate}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              提出: {report.submittedAt}
            </p>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
            {totalHours.toFixed(1)}h
          </span>
        </div>

        {report.summary && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            {report.summary}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
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
      </CardContent>
    </Card>
  );
}
