'use client';

import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useReports } from '@/context';
import { AIAnalysis } from '@/components';
import { Select } from '@/components/ui';
import { EndReport, DEMO_USERS } from '@/types';

export default function AnalysisPage() {
  const { reports, settings } = useReports();
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const members = DEMO_USERS.filter((u) => u.role === 'user');

  const memberOptions = [
    { value: 'all', label: 'チーム全体' },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];

  const endReports = useMemo(() => {
    const filtered = reports.filter((r): r is EndReport => r.type === 'end');
    if (selectedMember === 'all') {
      return filtered;
    }
    return filtered.filter((r) => r.memberId === selectedMember);
  }, [reports, selectedMember]);

  const selectedMemberName =
    selectedMember === 'all'
      ? 'チーム全体'
      : members.find((m) => m.id === selectedMember)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI分析
        </h1>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <Select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            options={memberOptions}
            className="w-48"
          />
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        Claude AIとGemini Imagenを使用して、
        <span className="font-medium text-gray-900 dark:text-white">
          {selectedMemberName}
        </span>
        の週次データを分析・可視化します。
      </p>

      <AIAnalysis
        reports={endReports}
        categories={settings.categories}
        memberName={selectedMemberName}
      />
    </div>
  );
}
