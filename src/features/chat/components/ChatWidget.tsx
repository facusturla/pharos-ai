'use client';

import { useState } from 'react';

import { Eraser, Minus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useChat } from '../hooks/use-chat';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ChatTrigger } from './ChatTrigger';

const CONFLICT_ID = process.env.NEXT_PUBLIC_CONFLICT_ID ?? 'iran-2026';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, setInput, isLoading, handleSubmit, stop, clear } = useChat({
    conflictId: CONFLICT_ID,
  });

  return (
    <>
      <ChatTrigger
        isOpen={isOpen}
        hasMessages={messages.length > 0}
        onToggle={() => setIsOpen(prev => !prev)}
      />

      {isOpen && (
        <div className="chat-panel fixed bottom-20 right-5 z-50 flex flex-col overflow-hidden rounded border border-[var(--bd)] bg-[var(--bg-1)] shadow-2xl">
          {/* Header */}
          <div className="panel-header justify-between">
            <span className="section-title flex items-center gap-2">
              <span className="dot dot-live" />
              INTEL ASSISTANT
            </span>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon-sm" onClick={clear} aria-label="Clear chat">
                  <Eraser size={12} />
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)} aria-label="Minimize chat">
                <Minus size={12} />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-[var(--t3)] text-[13px] mb-1">Pharos Intel Assistant</p>
                  <p className="text-[var(--t4)] text-[11px] max-w-[260px]">
                    Ask about events, actors, signals, or any intelligence in the conflict database.
                  </p>
                </div>
              )}
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <ChatInput
            value={input}
            isLoading={isLoading}
            onChange={setInput}
            onSubmit={handleSubmit}
            onStop={stop}
          />
        </div>
      )}
    </>
  );
}
