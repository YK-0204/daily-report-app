'use client';

import { ReactNode } from 'react';

interface DiaryPageProps {
  date: string;
  title: string;
  children: ReactNode;
  variant?: 'morning' | 'evening';
}

export function DiaryPage({ date, title, children, variant = 'morning' }: DiaryPageProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[d.getDay()];
    return { year, month, day, weekday };
  };

  const { year, month, day, weekday } = formatDate(date);

  return (
    <div className="diary-container">
      {/* ヘッダー */}
      <div className="diary-header">
        <div className="diary-date-block">
          <span className="diary-date-num">{month}/{day}</span>
          <span className="diary-date-info">{year}年 ({weekday})</span>
        </div>
        <h2 className="diary-title">{title}</h2>
        <div className={`diary-badge ${variant === 'morning' ? 'diary-badge-morning' : 'diary-badge-evening'}`}>
          {variant === 'morning' ? '朝' : '夕'}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="diary-body">
        {children}
      </div>
    </div>
  );
}

interface DiaryTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export function DiaryTextArea({ value, onChange, placeholder, rows = 4, label }: DiaryTextAreaProps) {
  return (
    <div className="diary-field">
      {label && <label className="diary-field-label">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="diary-textarea"
      />
    </div>
  );
}

interface DiaryTaskItemProps {
  task: string;
  category: string;
  categoryColor: string;
  hours: number;
  estimatedHours?: number;
  onHoursChange?: (hours: number) => void;
  onRemove?: () => void;
  showActual?: boolean;
}

export function DiaryTaskItem({
  task,
  category,
  categoryColor,
  hours,
  estimatedHours,
  onHoursChange,
  onRemove,
  showActual = false,
}: DiaryTaskItemProps) {
  return (
    <div className="diary-task">
      <div className="diary-task-color" style={{ backgroundColor: categoryColor }} />
      <div className="diary-task-info">
        <span className="diary-task-name">{task}</span>
        <span className="diary-task-cat" style={{ color: categoryColor }}>{category}</span>
      </div>
      <div className="diary-task-time">
        {showActual && estimatedHours !== undefined && (
          <span className="diary-task-est">{estimatedHours}h →</span>
        )}
        {onHoursChange ? (
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={hours}
            onChange={(e) => onHoursChange(parseFloat(e.target.value) || 0)}
            className="diary-task-input"
          />
        ) : (
          <span className="diary-task-hrs">{hours}h</span>
        )}
      </div>
      {onRemove && (
        <button onClick={onRemove} className="diary-task-del">×</button>
      )}
    </div>
  );
}

interface DiaryIssueItemProps {
  text: string;
  category: string;
  onRemove?: () => void;
}

export function DiaryIssueItem({ text, category, onRemove }: DiaryIssueItemProps) {
  return (
    <div className="diary-issue">
      <span className="diary-issue-icon">!</span>
      <div className="diary-issue-info">
        <span className="diary-issue-text">{text}</span>
        <span className="diary-issue-cat">{category}</span>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="diary-task-del">×</button>
      )}
    </div>
  );
}

interface DiaryFooterProps {
  children: ReactNode;
  totalHours?: number;
  estimatedHours?: number;
}

export function DiaryFooter({ children, totalHours, estimatedHours }: DiaryFooterProps) {
  const diff = totalHours !== undefined && estimatedHours !== undefined ? totalHours - estimatedHours : null;

  return (
    <div className="diary-footer">
      {totalHours !== undefined && (
        <div className="diary-stats">
          {estimatedHours !== undefined && (
            <span className="diary-stat">予定 {estimatedHours.toFixed(1)}h</span>
          )}
          <span className="diary-stat diary-stat-main">実績 {totalHours.toFixed(1)}h</span>
          {diff !== null && diff !== 0 && (
            <span className={`diary-stat-diff ${diff > 0 ? 'over' : 'under'}`}>
              ({diff > 0 ? '+' : ''}{diff.toFixed(1)}h)
            </span>
          )}
        </div>
      )}
      <div className="diary-actions">
        {children}
      </div>
    </div>
  );
}

interface DiarySectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function DiarySection({ title, icon, children }: DiarySectionProps) {
  return (
    <div className="diary-section">
      <h3 className="diary-section-title">
        {icon}
        {title}
      </h3>
      <div className="diary-section-body">
        {children}
      </div>
    </div>
  );
}
