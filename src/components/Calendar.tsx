'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getMonthDates, formatDateISO } from '@/lib/utils';
import { StartReport, EndReport } from '@/types';

interface CalendarProps {
  startReports: StartReport[];
  endReports: EndReport[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];

export function Calendar({ startReports, endReports, onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const weeks = getMonthDates(year, month);

  const startDates = new Set(startReports.map((r) => r.workDate));
  const endDates = new Set(endReports.map((r) => r.workDate));

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {year}年 {month + 1}月
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-medium py-2',
              i === 5 && 'text-blue-500',
              i === 6 && 'text-red-500',
              i < 5 && 'text-gray-600 dark:text-gray-400'
            )}
          >
            {day}
          </div>
        ))}

        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            if (!date) {
              return <div key={`empty-${weekIndex}-${dayIndex}`} className="p-2" />;
            }

            const dateStr = formatDateISO(date);
            const hasStart = startDates.has(dateStr);
            const hasEnd = endDates.has(dateStr);
            const isSelected = selectedDate === dateStr;
            const isTodayDate = isToday(date);

            return (
              <button
                key={dateStr}
                onClick={() => onDateSelect(dateStr)}
                className={cn(
                  'p-2 text-center rounded-lg transition-colors relative',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  isSelected && 'bg-blue-500 text-white hover:bg-blue-600',
                  isTodayDate && !isSelected && 'ring-2 ring-blue-500',
                  dayIndex === 5 && !isSelected && 'text-blue-500',
                  dayIndex === 6 && !isSelected && 'text-red-500'
                )}
              >
                <span className="text-sm">{date.getDate()}</span>
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {hasStart && (
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-yellow-300' : 'bg-yellow-400'
                      )}
                    />
                  )}
                  {hasEnd && (
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-green-300' : 'bg-green-500'
                      )}
                    />
                  )}
                </div>
              </button>
            );
          })
        )}
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
    </div>
  );
}
