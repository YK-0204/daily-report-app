import { NextRequest, NextResponse } from 'next/server';

interface CompletedTask {
  task: string;
  categoryId: string;
  actualHours: number;
}

interface EndReport {
  workDate: string;
  completedTasks: CompletedTask[];
  summary?: string;
  notes?: string;
}

interface Category {
  id: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const { reports, categories, memberName = 'チーム' } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Prepare report summary using new EndReport structure
    const reportSummary = reports.map((report: EndReport) => {
      return `
日付: ${report.workDate}
タスク:
${(report.completedTasks || []).map((t: CompletedTask) => `- ${t.task} (${categories.find((c: Category) => c.id === t.categoryId)?.name || t.categoryId}, ${t.actualHours}h)`).join('\n')}
概要: ${report.summary || 'なし'}
備考: ${report.notes || 'なし'}
`;
    }).join('\n---\n');

    const memberContext = memberName === 'チーム全体' || memberName === 'チーム'
      ? 'チーム全体'
      : `${memberName}さん`;

    const prompt = `以下は${memberContext}の1週間の日報データです。この週の活動を視覚的に表現する画像生成プロンプトを作成してください。

${reportSummary}

以下の条件でプロンプトを作成してください：
1. 英語で記述
2. 50-100語程度
3. ${memberContext === 'チーム全体' ? 'チームの協力や成果' : 'この人の仕事ぶりや達成感'}をポジティブに表現
4. 抽象的かつ芸術的な表現（具体的な人物やテキストは避ける）
5. カラフルで明るい雰囲気
6. タスクの内容やカテゴリを反映したイメージ

以下の形式でJSONを返してください：
{
  "prompt": "生成した画像プロンプト",
  "description": "このプロンプトの日本語説明（50字以内）"
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
        max_tokens: 512,
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
        { error: 'Failed to generate image prompt' },
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
        prompt: 'A vibrant abstract illustration of productivity and achievement, with flowing colorful lines representing progress and success, modern office environment, digital art style',
        description: 'デフォルトの画像プロンプト',
      };
    }

    return NextResponse.json({
      prompt: parsed.prompt,
      description: parsed.description,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Image prompt generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
