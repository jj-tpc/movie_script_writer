import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildPrompt } from '@/lib/ai';
import { DEFAULT_PROMPT_TEMPLATE } from '@/lib/constants';
import type { SynopsisInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, apiKey, promptTemplate } = body as {
      input: SynopsisInput;
      apiKey?: string;
      promptTemplate?: string;
    };

    const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!resolvedKey) {
      return Response.json(
        { error: 'API 키가 설정되지 않았습니다. 설정 페이지에서 Anthropic API 키를 입력해주세요.' },
        { status: 400 },
      );
    }

    if (!input.title?.trim()) {
      return Response.json({ error: '제목을 입력해주세요.' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: resolvedKey });
    const template = promptTemplate || DEFAULT_PROMPT_TEMPLATE;
    const prompt = buildPrompt(input, template);

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'AI 생성 중 오류가 발생했습니다.';
          controller.enqueue(encoder.encode(`\n\n[오류] ${message}`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '요청 처리 중 오류가 발생했습니다.';
    return Response.json({ error: message }, { status: 500 });
  }
}
