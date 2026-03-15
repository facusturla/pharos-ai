'use client';

import { useState } from 'react';

import { Eraser, Minus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useChat } from '../hooks/use-chat';
import { useChatPanelSize } from '../hooks/use-chat-panel-size';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ChatResizeHandle } from './ChatResizeHandle';
import { ChatTrigger } from './ChatTrigger';

const CONFLICT_ID = process.env.NEXT_PUBLIC_CONFLICT_ID ?? 'iran-2026';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile, size, startResize } = useChatPanelSize();
  const { messages, input, setInput, isLoading, isReady, error, handleSubmit, stop, clear } = useChat({
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
        <div
          className="chat-panel fixed bottom-20 right-5 z-50 flex flex-col overflow-hidden rounded border border-[var(--bd)] bg-[var(--bg-1)] shadow-2xl"
          style={isMobile ? undefined : { width: size.width, height: size.height }}
        >
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
                  <p className="mb-1 text-[13px] text-[var(--t3)]">Pharos Intel Assistant</p>
                  <p className="max-w-[260px] text-[11px] text-[var(--t4)]">
                    {isReady
                      ? 'Ask about events, actors, signals, or any intelligence in the conflict database.'
                      : 'Loading prior session...'}
                  </p>
                </div>
              )}
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {error && <p className="px-1 pt-2 text-[11px] text-[var(--danger)]">{error}</p>}
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
          <ChatResizeHandle hidden={isMobile} onPointerDown={startResize} />
        </div>
      )}
    </>
  );
}
