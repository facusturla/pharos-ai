'use client';

import { useCallback, useRef, useState } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type UseChatOptions = {
  conflictId: string;
};

/**
 * Custom chat hook that streams responses from the Pharos RAG chat endpoint.
 * Uses fetch + ReadableStream for SSE-style streaming.
 */
export function useChat({ conflictId }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const append = useCallback(
    async (userContent: string) => {
      if (!userContent.trim() || isLoading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userContent.trim(),
      };

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setInput('');
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const allMessages = [...messages, userMsg].map(m => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conflictId, messages: allMessages }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snapshot = accumulated;
          setMessages(prev =>
            prev.map(m => (m.id === assistantMsg.id ? { ...m, content: snapshot } : m)),
          );
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        const msg = e instanceof Error ? e.message : 'An error occurred';
        setError(msg);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id ? { ...m, content: `⚠ ${msg}` } : m,
          ),
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [conflictId, isLoading, messages],
  );

  const handleSubmit = useCallback(() => {
    append(input);
  }, [append, input]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, input, setInput, isLoading, error, handleSubmit, stop, clear };
}

export type { Message };
