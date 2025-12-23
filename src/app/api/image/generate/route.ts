import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Use Gemini Imagen API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: '16:9',
            safetyFilterLevel: 'block_some',
            personGeneration: 'dont_allow',
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini Imagen API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate image', details: error },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Gemini Imagen returns base64 encoded image
    if (data.predictions && data.predictions.length > 0) {
      const base64Image = data.predictions[0].bytesBase64Encoded;
      const mimeType = data.predictions[0].mimeType || 'image/png';

      return NextResponse.json({
        image: `data:${mimeType};base64,${base64Image}`,
        generatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'No image generated' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
