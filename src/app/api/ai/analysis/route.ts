import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { currentWeekReports, previousWeekReports, categories } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Helper function to calculate stats
    const calculateStats = (reports: { tasks: { category: string; hours: number }[] }[]) => {
      const totalHours = reports.reduce((sum, report) => {
        return sum + report.tasks.reduce((taskSum, task) => taskSum + task.hours, 0);
      }, 0);

      const categoryBreakdown: Record<string, number> = {};
      reports.forEach((report) => {
        report.tasks.forEach((task) => {
          if (!categoryBreakdown[task.category]) {
            categoryBreakdown[task.category] = 0;
          }
          categoryBreakdown[task.category] += task.hours;
        });
      });

      return { totalHours, categoryBreakdown };
    };

    const currentWeek = calculateStats(currentWeekReports);
    const previousWeek = calculateStats(previousWeekReports);

    // Prepare comparison data for Claude
    const formatWeekData = (reports: { date: string; tasks: { content: string; category: string; hours: number }[] }[], weekName: string) => {
      if (reports.length === 0) return `${weekName}: データなし`;

      return `${weekName}:
${reports.map((report) => `
日付: ${report.date}
タスク:
${report.tasks.map((t) => `- ${t.content} (${categories.find((c: { id: string }) => c.id === t.category)?.name || t.category}, ${t.hours}時間)`).join('\n')}
`).join('\n')}`;
    };

    const prompt = `以下は2週間分の日報データです。今週と先週を比較分析してください。

${formatWeekData(previousWeekReports, '先週')}

${formatWeekData(currentWeekReports, '今週')}

今週の合計時間: ${currentWeek.totalHours}時間
先週の合計時間: ${previousWeek.totalHours}時間

以下の形式でJSONを返してください：
{
  "insights": ["比較から得られる洞察を3-5個"],
  "trends": ["傾向や変化のポイントを2-3個"]
}

JSONのみを返してください。説明文は不要です。`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate analysis' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse the JSON response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      console.error('Failed to parse Claude response:', content);
      parsed = {
        insights: ['分析の生成に失敗しました'],
        trends: ['もう一度お試しください'],
      };
    }

    return NextResponse.json({
      currentWeek,
      previousWeek,
      insights: parsed.insights || [],
      trends: parsed.trends || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
