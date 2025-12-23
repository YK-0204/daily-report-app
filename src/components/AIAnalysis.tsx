'use client';

import { useState } from 'react';
import { Brain, Sparkles, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { WeeklyComparisonChart } from './Charts';
import { EndReport, Category, WeeklySummary, ComparisonAnalysis } from '@/types';

interface AIAnalysisProps {
  reports: EndReport[];
  categories: Category[];
  memberName?: string;
}

export function AIAnalysis({ reports, categories, memberName = 'チーム' }: AIAnalysisProps) {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [comparison, setComparison] = useState<ComparisonAnalysis | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get this week's and last week's reports
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);

  const thisWeekReports = reports.filter((r) => {
    const date = new Date(r.workDate);
    return date >= startOfWeek && date < new Date();
  });

  const lastWeekReports = reports.filter((r) => {
    const date = new Date(r.workDate);
    return date >= startOfLastWeek && date < startOfWeek;
  });

  const generateSummary = async () => {
    if (thisWeekReports.length === 0) {
      setError('今週の日報がありません');
      return;
    }

    setLoading('summary');
    setError(null);

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reports: thisWeekReports,
          categories,
        }),
      });

      if (!response.ok) {
        throw new Error('サマリー生成に失敗しました');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(null);
    }
  };

  const generateComparison = async () => {
    if (thisWeekReports.length === 0 && lastWeekReports.length === 0) {
      setError('比較するデータがありません');
      return;
    }

    setLoading('comparison');
    setError(null);

    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentWeekReports: thisWeekReports,
          previousWeekReports: lastWeekReports,
          categories,
        }),
      });

      if (!response.ok) {
        throw new Error('比較分析に失敗しました');
      }

      const data = await response.json();
      setComparison(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(null);
    }
  };

  const generateImage = async () => {
    if (thisWeekReports.length === 0) {
      setError('今週の日報がありません');
      return;
    }

    setLoading('image');
    setError(null);

    try {
      // First, generate the image prompt
      const promptResponse = await fetch('/api/ai/image-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reports: thisWeekReports,
          categories,
          memberName,
        }),
      });

      if (!promptResponse.ok) {
        throw new Error('プロンプト生成に失敗しました');
      }

      const promptData = await promptResponse.json();
      setImagePrompt(promptData.prompt);

      // Then, generate the image
      const imageResponse = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptData.prompt,
        }),
      });

      if (!imageResponse.ok) {
        throw new Error('画像生成に失敗しました');
      }

      const imageData = await imageResponse.json();
      setGeneratedImage(imageData.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={generateSummary}
          isLoading={loading === 'summary'}
          disabled={loading !== null}
          className="h-auto py-4"
        >
          <div className="flex flex-col items-center gap-2">
            <Brain className="w-6 h-6" />
            <span>週次サマリー生成</span>
          </div>
        </Button>

        <Button
          onClick={generateComparison}
          isLoading={loading === 'comparison'}
          disabled={loading !== null}
          variant="secondary"
          className="h-auto py-4"
        >
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6" />
            <span>週間比較分析</span>
          </div>
        </Button>

        <Button
          onClick={generateImage}
          isLoading={loading === 'image'}
          disabled={loading !== null}
          variant="outline"
          className="h-auto py-4"
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            <span>週間イメージ生成</span>
          </div>
        </Button>
      </div>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              週次サマリー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  今週のハイライト
                </h4>
                <ul className="space-y-2">
                  {summary.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500">✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  改善提案
                </h4>
                <ul className="space-y-2">
                  {summary.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-500">→</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                合計作業時間: {summary.totalHours}時間
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              週間比較分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyComparisonChart
              currentWeek={comparison.currentWeek.categoryBreakdown.reduce((acc, item) => {
                acc[item.categoryId] = item.hours;
                return acc;
              }, {} as Record<string, number>)}
              previousWeek={comparison.previousWeek.categoryBreakdown.reduce((acc, item) => {
                acc[item.categoryId] = item.hours;
                return acc;
              }, {} as Record<string, number>)}
              categories={categories}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  インサイト
                </h4>
                <ul className="space-y-2">
                  {comparison.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-purple-500">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  トレンド
                </h4>
                <ul className="space-y-2">
                  {comparison.trends.map((trend, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-orange-500">↗</span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              週間イメージ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={generatedImage}
                alt="Generated weekly image"
                className="w-full h-full object-cover"
              />
            </div>
            {imagePrompt && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                プロンプト: {imagePrompt}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
