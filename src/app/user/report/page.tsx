'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

export default function ReportPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      router.push('/user');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="pt-6 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            日報入力
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            日報入力はホーム画面から行うことができます。
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
            3秒後にホーム画面に移動します...
          </p>
          <button
            onClick={() => router.push('/user')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ホーム画面へ
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
