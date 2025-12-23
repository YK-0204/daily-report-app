'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Category, EndReport, DEMO_USERS } from '@/types';

interface CategoryChartProps {
  reports: EndReport[];
  categories: Category[];
}

export function CategoryPieChart({ reports, categories }: CategoryChartProps) {
  const categoryData = categories.map((cat) => {
    const hours = reports.reduce((sum, report) => {
      return (
        sum +
        (report.completedTasks || [])
          .filter((t) => t.categoryId === cat.id)
          .reduce((taskSum, t) => taskSum + (t.actualHours || 0), 0)
      );
    }, 0);
    return {
      name: cat.name,
      value: hours,
      color: cat.color,
    };
  }).filter((d) => d.value > 0);

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value}時間`, '作業時間']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface DailyBarChartProps {
  reports: EndReport[];
  categories: Category[];
}

export function DailyBarChart({ reports, categories }: DailyBarChartProps) {
  // Group reports by date and calculate hours per category
  const dateMap = new Map<string, Record<string, number>>();

  reports.forEach((report) => {
    if (!dateMap.has(report.workDate)) {
      dateMap.set(report.workDate, {});
    }
    const dateData = dateMap.get(report.workDate)!;

    (report.completedTasks || []).forEach((task) => {
      if (!dateData[task.categoryId]) {
        dateData[task.categoryId] = 0;
      }
      dateData[task.categoryId] += task.actualHours || 0;
    });
  });

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, categoryHours]) => ({
      date: new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      ...categoryHours,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {categories.map((cat) => (
          <Bar
            key={cat.id}
            dataKey={cat.id}
            name={cat.name}
            stackId="a"
            fill={cat.color}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface WeeklyComparisonChartProps {
  currentWeek: Record<string, number>;
  previousWeek: Record<string, number>;
  categories: Category[];
}

export function WeeklyComparisonChart({
  currentWeek,
  previousWeek,
  categories,
}: WeeklyComparisonChartProps) {
  const chartData = categories.map((cat) => ({
    name: cat.name,
    今週: currentWeek[cat.id] || 0,
    先週: previousWeek[cat.id] || 0,
  })).filter((d) => d.今週 > 0 || d.先週 > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="今週" fill="#3B82F6" />
        <Bar dataKey="先週" fill="#9CA3AF" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TeamHoursBarChartProps {
  reports: EndReport[];
}

export function TeamHoursBarChart({ reports }: TeamHoursBarChartProps) {
  const members = DEMO_USERS.filter((u) => u.role === 'user');

  const chartData = members.map((member) => {
    const memberReports = reports.filter((r) => r.memberId === member.id);
    const totalHours = memberReports.reduce((sum, r) => {
      return sum + (r.completedTasks || []).reduce((ts, t) => ts + (t.actualHours || 0), 0);
    }, 0);
    return {
      name: member.name,
      hours: totalHours,
    };
  }).filter((d) => d.hours > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" unit="h" />
        <YAxis type="category" dataKey="name" width={80} />
        <Tooltip formatter={(value) => [`${value}時間`, '作業時間']} />
        <Bar dataKey="hours" fill="#10B981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
