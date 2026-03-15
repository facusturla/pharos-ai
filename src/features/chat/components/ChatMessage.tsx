'use client';

import { useEffect, useRef } from 'react';

import type { Message } from '../hooks/use-chat';

type Props = {
  message: Message;
};

export function ChatMessage({ message }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isUser = message.role === 'user';

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [message.content]);

  return (
    <div ref={ref} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[85%] rounded px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[var(--blue-dim)] text-[var(--t1)]'
            : 'bg-[var(--bg-2)] text-[var(--t2)]'
        }`}
      >
        {!isUser && (
          <span className="label mb-1 block text-[var(--blue-l)]">PHAROS INTEL</span>
        )}
        {message.content || (
          <span className="inline-flex items-center gap-1 text-[var(--t4)]">
            <span className="chat-dot-pulse" />
            Analyzing...
          </span>
        )}
      </div>
    </div>
  );
}
