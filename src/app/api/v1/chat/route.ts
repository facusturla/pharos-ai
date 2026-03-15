import { createChatStream } from '@/server/lib/rag/chat-engine';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { ok: false, error: { code: 'CONFIG_ERROR', message: 'OPENAI_API_KEY is not configured' } },
      { status: 503 },
    );
  }

  let body: { conflictId?: string; messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } },
      { status: 400 },
    );
  }

  const { conflictId, messages } = body;

  if (!conflictId || !messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { ok: false, error: { code: 'INVALID_PARAMS', message: 'conflictId and messages[] are required' } },
      { status: 400 },
    );
  }

  const chatMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  if (chatMessages.length === 0) {
    return Response.json(
      { ok: false, error: { code: 'INVALID_PARAMS', message: 'At least one user message is required' } },
      { status: 400 },
    );
  }

  const result = await createChatStream(conflictId, chatMessages);
  return result.toTextStreamResponse();
}
