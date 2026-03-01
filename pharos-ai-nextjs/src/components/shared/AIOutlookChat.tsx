'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Copy, Check, GripVertical, ExternalLink, Bot, User, Plus, History, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  getOutlookConversation, sendMessage, submitMessageFeedback,
  clearCurrentConversation, addOptimisticMessage, createNewChat,
  getConversationHistory, loadSpecificConversation, type ChatMessage,
} from '@/store/slices/chatSlice';

interface AIOutlookChatProps { outlookTitle: string; outlookTopic: string; outlookId: string; }

const AIOutlookChat: React.FC<AIOutlookChatProps> = ({ outlookTitle, outlookTopic, outlookId }) => {
  const dispatch = useAppDispatch();
  const { currentConversation, conversationHistory, loading, error, isTyping } = useAppSelector((state) => state.chat);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [chatWidth, setChatWidth] = useState(400);
  const [chatHeight, setChatHeight] = useState(600);
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const [showSourcesFor, setShowSourcesFor] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !currentConversation && outlookId) dispatch(getOutlookConversation(outlookId));
  }, [isOpen, currentConversation, outlookId, dispatch]);

  useEffect(() => () => { dispatch(clearCurrentConversation()); }, [dispatch]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingWidth) setChatWidth(Math.max(300, Math.min(800, window.innerWidth - e.clientX)));
      if (isResizingHeight) setChatHeight(Math.max(400, Math.min(window.innerHeight - 100, window.innerHeight - e.clientY)));
    };
    const handleMouseUp = () => { setIsResizingWidth(false); setIsResizingHeight(false); };
    if (isResizingWidth || isResizingHeight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizingWidth, isResizingHeight]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentConversation?.messages]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  const handleNewChat = async () => {
    if (!outlookId || loading.createNewChat) return;
    try { await dispatch(createNewChat(outlookId)).unwrap(); setShowHistory(false); } catch {}
  };

  const handleShowHistory = async () => {
    if (!showHistory && !loading.loadHistory) {
      try { await dispatch(getConversationHistory(outlookId)).unwrap(); } catch {}
    }
    setShowHistory(!showHistory);
  };

  const handleLoadConversation = async (conversationId: string) => {
    try { await dispatch(loadSpecificConversation(conversationId)).unwrap(); setShowHistory(false); } catch {}
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversation || loading.sendMessage) return;
    const text = inputValue.trim();
    setInputValue('');
    dispatch(addOptimisticMessage({ id: `optimistic-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() }));
    try { await dispatch(sendMessage({ conversationId: currentConversation.id, message: text, outlookSlug: outlookId })).unwrap(); } catch {}
  };

  const copyMessage = async (id: string, content: string) => {
    try { await navigator.clipboard.writeText(content); setCopiedMessageId(id); setTimeout(() => setCopiedMessageId(null), 2000); } catch {}
  };

  const handleFeedback = async (messageId: string, feedbackType: 'thumbs_up' | 'thumbs_down') => {
    try { await dispatch(submitMessageFeedback({ messageId, feedbackType })).unwrap(); } catch {}
  };

  const renderMessageContent = (content: string, sources?: any[]) => {
    if (!sources?.length) return <span>{content}</span>;
    const sourceMap = new Map(sources.map((s) => [s.footnote_number.toString(), s]));
    const parts: Array<{ type: 'text' | 'footnote'; content: string; source?: any }> = [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIdx = 0, m, counter = 1;
    while ((m = regex.exec(content)) !== null) {
      if (m.index > lastIdx) parts.push({ type: 'text', content: content.slice(lastIdx, m.index) });
      const src = sources.find((s) => s.url === m![2] || s.domain === m![1] || s.title === m![1]);
      if (src) { parts.push({ type: 'footnote', content: String(counter++), source: src }); }
      else { parts.push({ type: 'text', content: m[0] }); }
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < content.length) parts.push({ type: 'text', content: content.slice(lastIdx) });
    return (
      <span>
        {parts.map((p, i) => p.type === 'footnote' && p.source ? (
          <TooltipProvider key={i}><Tooltip>
            <TooltipTrigger asChild><sup className="text-blue-600 hover:text-blue-800 cursor-help font-medium">[{p.content}]</sup></TooltipTrigger>
            <TooltipContent className="max-w-sm p-3 border shadow-md bg-white">
              <p className="text-sm font-medium text-slate-900">{p.source.title}</p>
              <a href={p.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">{p.source.url}</a>
            </TooltipContent>
          </Tooltip></TooltipProvider>
        ) : <span key={i}>{p.content}</span>)}
      </span>
    );
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-[1000] group" aria-label="Open AI Chat">
        <MessageCircle className="w-6 h-6" />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-sans text-sm uppercase tracking-[0.05em]">ASK AI ABOUT THIS OUTLOOK</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 bg-white border-l-2 border-t-2 border-slate-300 shadow-2xl z-[1000] flex flex-col" style={{ width: `${chatWidth}px`, height: `${chatHeight}px` }}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-300 hover:bg-slate-400 cursor-row-resize" onMouseDown={() => setIsResizingHeight(true)}></div>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 hover:bg-slate-400 cursor-col-resize" onMouseDown={() => setIsResizingWidth(true)}></div>

      <div className="bg-slate-900 text-white p-4 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <div>
              <span className="font-bold text-sm uppercase tracking-wider font-sans text-sm uppercase tracking-[0.05em]">INTELLIGENCE ASSISTANT</span>
              <div className="text-xs text-slate-300 font-sans text-sm uppercase tracking-[0.05em]">Ask questions about this outlook</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider><Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleShowHistory} className="p-1 hover:bg-slate-800 rounded-full transition-colors" disabled={loading.loadHistory}>
                  {loading.loadHistory ? <div className="w-5 h-5 animate-spin rounded-full border-2 border-slate-300 border-t-white"></div> : <History className="w-5 h-5 text-slate-300" />}
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Chat History</p></TooltipContent>
            </Tooltip></TooltipProvider>
            <TooltipProvider><Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleNewChat} className="p-1 hover:bg-slate-800 rounded-full transition-colors" disabled={loading.createNewChat}>
                  {loading.createNewChat ? <div className="w-5 h-5 animate-spin rounded-full border-2 border-slate-300 border-t-white"></div> : <Plus className="w-5 h-5 text-slate-300" />}
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Start New Chat</p></TooltipContent>
            </Tooltip></TooltipProvider>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-300" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {loading.loadMessages && <div className="text-center py-8"><Bot className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" /><p className="text-slate-600 text-sm font-serif leading-relaxed">Loading conversation...</p></div>}
        {error.loadMessages && <div className="text-center py-8"><div className="text-red-600 text-sm mb-4">{error.loadMessages}</div><button onClick={() => dispatch(getOutlookConversation(outlookId))} className="px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800">Try Again</button></div>}
        {!loading.loadMessages && !error.loadMessages && (!currentConversation?.messages?.length) && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 text-sm font-serif leading-relaxed mb-4">Ask me anything about this intelligence outlook</p>
            {currentConversation?.suggestedQuestions?.length ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans text-sm uppercase tracking-[0.05em] mb-3">Suggested Questions</p>
                {currentConversation.suggestedQuestions.slice(0, 3).map((q, i) => (
                  <button key={i} onClick={() => setInputValue(q)} className="w-full text-left p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded text-sm font-serif leading-relaxed transition-colors" disabled={loading.sendMessage}>{q}</button>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {currentConversation?.messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
              {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[75%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
              <div className="text-sm font-serif leading-relaxed">
                {message.role === 'ai' ? renderMessageContent(message.content, message.sources) : message.content}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className={`text-xs font-sans uppercase tracking-[0.05em] ${message.role === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center space-x-2">
                  {message.role === 'ai' && (
                    <button onClick={() => setShowSourcesFor(showSourcesFor === message.id ? null : message.id)} className="flex items-center space-x-1 text-xs text-blue-600 font-sans text-sm uppercase tracking-[0.05em]">
                      <ExternalLink className="w-3 h-3" /><span>SOURCES ({message.sources?.length || 0})</span>
                    </button>
                  )}
                  <button onClick={() => copyMessage(message.id, message.content)} className={`transition-opacity ${message.role === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                    {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  {message.role === 'ai' && (
                    <>
                      <button onClick={() => handleFeedback(message.id, 'thumbs_up')} className="text-slate-500 hover:text-green-600 transition-colors"><ThumbsUp className="w-3 h-3" /></button>
                      <button onClick={() => handleFeedback(message.id, 'thumbs_down')} className="text-slate-500 hover:text-red-600 transition-colors"><ThumbsDown className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              </div>
              {message.role === 'ai' && showSourcesFor === message.id && (
                <div className="mt-3 pt-3 border-t border-slate-200 bg-slate-50 -m-3 p-3 rounded-b-lg">
                  <h5 className="text-xs font-bold text-slate-700 mb-2 font-sans text-sm uppercase tracking-[0.05em] tracking-wider">Intelligence Sources:</h5>
                  {message.sources?.length ? (
                    <div className="space-y-2">
                      {message.sources.map((src) => (
                        <div key={src.id} className="flex items-start space-x-2 text-xs">
                          <span className="text-blue-600 font-bold font-sans text-sm uppercase tracking-[0.05em]">[{src.footnote_number}]</span>
                          <div><a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block font-serif leading-relaxed">{src.title}</a><span className="text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">({src.domain})</span></div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500 font-serif leading-relaxed">No sources available.</p>}
                </div>
              )}
            </div>
          </div>
        ))}

        {(loading.sendMessage || isTyping) && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4" /></div>
            <div className="bg-white border border-slate-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  {[0, 0.1, 0.2].map((d, i) => <div key={i} className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }}></div>)}
                </div>
                <span className="text-sm text-slate-600 font-serif leading-relaxed">Analyzing intelligence data...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showHistory && (
        <div className="border-t border-slate-300 bg-slate-50 max-h-64 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-sans text-sm uppercase tracking-[0.05em]">Chat History</h4>
              <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            {loading.loadHistory && <div className="text-center py-4"><div className="w-6 h-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 mx-auto mb-2"></div><p className="text-xs text-slate-600 font-serif leading-relaxed">Loading chat history...</p></div>}
            {!loading.loadHistory && conversationHistory.length === 0 && <div className="text-center py-4"><p className="text-xs text-slate-600 font-serif leading-relaxed">No previous conversations</p></div>}
            {!loading.loadHistory && conversationHistory.map((conv) => (
              <button key={conv.id} onClick={() => handleLoadConversation(conv.id)} disabled={loading.loadMessages}
                className={`w-full text-left p-2 rounded text-xs border transition-colors mb-2 ${currentConversation?.id === conv.id ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium font-sans text-sm uppercase tracking-[0.05em]">{conv.message_count} messages</span>
                  <div className="flex items-center text-slate-500"><Clock className="w-3 h-3 mr-1" /><span className="font-sans text-sm uppercase tracking-[0.05em]">{new Date(conv.created_at).toLocaleDateString()}</span></div>
                </div>
                <p className="text-slate-600 font-serif leading-relaxed line-clamp-2">{conv.preview}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-slate-300 p-4 bg-white">
        {error.sendMessage && <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">Failed to send: {error.sendMessage}</div>}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Ask about this outlook..."
            disabled={loading.sendMessage || !currentConversation}
            className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-100"
          />
          <button onClick={handleSendMessage} disabled={!inputValue.trim() || loading.sendMessage || !currentConversation} className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${currentConversation ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
          {currentConversation ? 'INTELLIGENCE ASSISTANT ACTIVE' : 'CONNECTING...'}
        </div>
      </div>
    </div>
  );
};

export default AIOutlookChat;
