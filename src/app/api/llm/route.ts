import { NextResponse } from 'next/server';

export type LLMTaskType =
  | 'policy'
  | 'failure_mode'
  | 'prerequisites'
  | 'node_inspector'
  | 'pr_storyteller';

export interface LLMRequestPayload {
  task: LLMTaskType;
  symbolId: string;
  input: {
    condition?: string;
    consequence?: string;
    functionSignature?: string;
    errorHandling?: string;
    manifests?: string[];
    nodeTitle?: string;
    nodeFile?: string;
    incomingEdgesCount?: number;
    outgoingEdgesCount?: number;
    changedSymbols?: string[];
    rawText?: string;
  };
}

const SYSTEM_PROMPT = `You are an expert software architect, DevEx specialist, and Computer Science tutor. 
Always follow strict output formatting instructions and keep your response grounded, ultra-concise, and technically accurate.`;

function buildUserPrompt(payload: LLMRequestPayload): { prompt: string; maxTokens: number } {
  const { task, input } = payload;

  switch (task) {
    case 'policy':
      return {
        prompt: `Translate this programming logic into a crisp business rule and operational risk for non-technical stakeholders.
Condition: ${input.condition || 'True'}
Consequence: ${input.consequence || 'Execute action'}

Output format:
Rule: <one sentence> | Failure Risk: <one sentence>`,
        maxTokens: 150,
      };

    case 'failure_mode':
      return {
        prompt: `Explain this code's failure impact in two concise bullets:
Function Signature: ${input.functionSignature || 'function execute()'}
Error Context: ${input.errorHandling || 'Unhandled exception throw'}

Output format:
• Real-World Analogy: <one sentence>
• System Failure Impact: <one sentence>`,
        maxTokens: 250,
      };

    case 'prerequisites':
      return {
        prompt: `Based on these project libraries and architecture signatures: ${
          (input.manifests || ['Next.js', 'React Flow', 'FastAPI', 'Tree-sitter']).join(', ')
        }, list 3 essential programming concepts or runtime patterns a junior engineer must understand to contribute safely. Output as 3 concise bullet points.`,
        maxTokens: 250,
      };

    case 'node_inspector':
      return {
        prompt: `Component Title: ${input.nodeTitle || 'AST Node'}
File Path: ${input.nodeFile || 'src/main.ts'}
Dependencies: ${input.incomingEdgesCount || 1} incoming edges, ${input.outgoingEdgesCount || 1} outgoing edges.

In 2 short sentences, describe this component's architectural role and whether its coupling level presents high or low dependency risk to the rest of the application.`,
        maxTokens: 150,
      };

    case 'pr_storyteller':
      return {
        prompt: `Synthesize these changed code symbols into a continuous 3-sentence narrative describing the business feature or fix being introduced across the system:
Changed Symbols: ${(input.changedSymbols || ['src/store/useDevExStore.ts', 'MacroViewCanvas.tsx']).join(', ')}`,
        maxTokens: 250,
      };

    default:
      return {
        prompt: `Provide a 2-sentence summary of ${input.rawText || 'software architecture'}.`,
        maxTokens: 150,
      };
  }
}

function getFallbackResponse(payload: LLMRequestPayload): string {
  const { task, input } = payload;
  switch (task) {
    case 'policy':
      return `Rule: Enforce state consistency when evaluating "${input.condition || 'conditional constraint'}". | Failure Risk: Unhandled boundary condition may cause runtime exceptions.`;
    case 'failure_mode':
      return `• Real-World Analogy: Like a main power circuit breaker tripping when overloaded.\n• System Failure Impact: Execution halts in ${input.nodeFile || 'module'}, preventing downstream state updates.`;
    case 'prerequisites':
      return `• Asynchronous Event Loops & Non-Blocking I/O\n• Tree-sitter Abstract Syntax Tree (AST) Parsing\n• State Synchronization & Reactive Data Binding`;
    case 'node_inspector':
      return `This component handles core application logic and data persistence. Its current dependency graph presents a low operational risk with modular isolation.`;
    case 'pr_storyteller':
      return `This Pull Request updates core state management and canvas components across the system. It introduces enhanced visualization layers to improve developer onboarding. The changes refine dependency tracking without disrupting existing API contracts.`;
  }
}

export async function POST(req: Request) {
  let payload: LLMRequestPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { task, symbolId } = payload;
  const cacheKey = `${task}:${symbolId || 'default'}`;
  const { prompt, maxTokens } = buildUserPrompt(payload);

  const ollamaPayload = {
    model: 'qwen2.5-coder:7b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    options: {
      temperature: 0.2,
      top_p: 0.9,
      num_predict: maxTokens,
    },
    stream: false,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const fallback = getFallbackResponse(payload);
      return NextResponse.json({
        success: true,
        task,
        symbolId,
        cacheKey,
        content: fallback,
        isFallback: true,
        model: 'qwen2.5-coder:7b (AST Fallback)',
        error: `Ollama status ${response.status}`,
      });
    }

    const data = await response.json();
    const content = data.message?.content || getFallbackResponse(payload);

    return NextResponse.json({
      success: true,
      task,
      symbolId,
      cacheKey,
      content,
      isFallback: false,
      model: 'qwen2.5-coder:7b',
    });
  } catch (err: any) {
    const fallback = getFallbackResponse(payload);
    return NextResponse.json({
      success: true,
      task,
      symbolId,
      cacheKey,
      content: fallback,
      isFallback: true,
      model: 'qwen2.5-coder:7b (AST Fallback)',
      error: 'Ollama daemon at http://127.0.0.1:11434 is offline.',
    });
  }
}
