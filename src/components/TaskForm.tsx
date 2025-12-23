'use client';

// This component is deprecated - task input is now handled in StartReportForm and EndReportForm.
// Keeping for backwards compatibility.

export function TaskForm() {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <p className="text-amber-700 dark:text-amber-300">
        このコンポーネントは廃止されました。タスク入力はStartReportFormとEndReportFormで行います。
      </p>
    </div>
  );
}
