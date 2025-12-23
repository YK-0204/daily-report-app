import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { reports, categories } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Calculate totals from reports
    const totalHours = reports.reduce((sum: number, report: { tasks: { hours: number }[] }) => {
      return sum + report.tasks.reduce((taskSum: number, task: { hours: number }) => taskSum + task.hours, 0);
    }, 0);

    const categoryBreakdown: Record<string, number> = {};
    reports.forEach((report: { tasks: { category: string; hours: number }[] }) => {
      report.tasks.forEach((task: { category: string; hours: number }) => {
        if (!categoryBreakdown[task.category]) {
          categoryBreakdown[task.category] = 0;
        }
        categoryBreakdown[task.category] += task.hours;
      });
    });

    // Prepare prompt for Claude
    const reportSummary = reports.map((report: { date: string; tasks: { content: string; category: string; hours: number }[]; memo: string }) => {
      return `
日付: ${report.date}
タスク:
${report.tasks.map((t: { content: string; category: string; hours: number }) => `- ${t.content} (${categories.find((c: { id: string }) => c.id === t.category)?.name || t.category}, ${t.hours}時間)`).join('\n')}
メモ: ${report.memo || 'なし'}
`;
    }).join('\n---\n');

    const prompt = `以下は1週間の日報データです。このデータを分析して、週次サマリーを生成してください。

${reportSummary}

以下の形式でJSONを返してください：
{
  "highlights": ["今週の主な成果や注目点を3-5個"],
  "suggestions": ["来週への提案や改善点を2-3個"]
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
        { error: 'Failed to generate summary' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      console.error('Failed to parse Claude response:', content);
      parsed = {
        highlights: ['AIサマリーの生成に失敗しました'],
        suggestions: ['もう一度お試しください'],
      };
    }

    return NextResponse.json({
      totalHours,
      categoryBreakdown,
      highlights: parsed.highlights || [],
      suggestions: parsed.suggestions || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
