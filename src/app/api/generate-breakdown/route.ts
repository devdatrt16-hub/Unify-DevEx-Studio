import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, stepTitle, csConcept, prompt } = body;

    const userPrompt = prompt || `Explain why the file "${fileName || 'source file'}" exists in the project architecture and what CS concept (${csConcept || 'Software Architecture'}) it demonstrates for the setup step "${stepTitle || 'Configuration'}". Keep response concise (under 80 words).`;

    const ollamaPayload = {
      model: 'qwen2.5-coder:7b',
      messages: [
        {
          role: 'system',
          content: 'You are an expert DevEx assistant and Computer Science tutor. Provide concise, clear, and highly accurate technical breakdowns (under 80 words) for repository code files and setup steps.',
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      options: {
        temperature: 0.2,
        num_predict: 200,
      },
      stream: false,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Ollama service returned error status ${response.status}` },
        { status: 503 }
      );
    }

    const data = await response.json();
    const breakdown = data.message?.content || 'No explanation generated.';

    return NextResponse.json({
      success: true,
      breakdown,
      model: 'qwen2.5-coder:7b',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          'Local Ollama instance at http://127.0.0.1:11434 is unreachable. Please ensure Ollama is running with qwen2.5-coder:7b model.',
      },
      { status: 503 }
    );
  }
}
