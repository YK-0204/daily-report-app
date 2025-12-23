'use client';

// This component is deprecated - use StartReportForm and EndReportForm instead.
// Keeping for backwards compatibility.

export function ReportForm() {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <p className="text-amber-700 dark:text-amber-300">
        このコンポーネントは廃止されました。StartReportFormとEndReportFormを使用してください。
      </p>
    </div>
  );
}
