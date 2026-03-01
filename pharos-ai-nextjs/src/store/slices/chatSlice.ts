import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApiClient } from '@/lib/chatApi';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
  sources?: Array<{ id: number; url: string; title: string; domain: string; footnote_number: number }>;
}

export interface ChatConversation {
  id: string;
  outlook_title: string;
  messages: ChatMessage[];
  suggestedQuestions?: string[];
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
  preview: string;
  suggested_questions: string[];
}

interface ChatState {
  currentConversation: ChatConversation | null;
  conversationHistory: ConversationSummary[];
  loading: { createConversation: boolean; sendMessage: boolean; loadMessages: boolean; loadHistory: boolean; createNewChat: boolean };
  error: { createConversation: string | null; sendMessage: string | null; loadMessages: string | null; loadHistory: string | null; createNewChat: string | null };
  isTyping: boolean;
  lastMessageId: string | null;
}

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (params: { outlookSlug: string; sessionId?: string }) => chatApiClient.createConversation(params)
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (params: { conversationId: string; message: string; outlookSlug: string }) => chatApiClient.sendMessage(params)
);

export const getOutlookConversation = createAsyncThunk(
  'chat/getOutlookConversation',
  async (outlookId: string) => chatApiClient.getOutlookConversation(outlookId)
);

export const submitMessageFeedback = createAsyncThunk(
  'chat/submitMessageFeedback',
  async (params: { messageId: string; feedbackType: 'thumbs_up' | 'thumbs_down'; comment?: string }) => chatApiClient.submitFeedback(params)
);

export const createNewChat = createAsyncThunk(
  'chat/createNewChat',
  async (outlookSlug: string) => chatApiClient.createConversation({ outlookSlug })
);

export const getConversationHistory = createAsyncThunk(
  'chat/getConversationHistory',
  async (outlookId: string) => chatApiClient.getOutlookConversations(outlookId)
);

export const loadSpecificConversation = createAsyncThunk(
  'chat/loadSpecificConversation',
  async (conversationId: string) => chatApiClient.getMessages(conversationId)
);

const initialState: ChatState = {
  currentConversation: null,
  conversationHistory: [],
  loading: { createConversation: false, sendMessage: false, loadMessages: false, loadHistory: false, createNewChat: false },
  error: { createConversation: null, sendMessage: null, loadMessages: null, loadHistory: null, createNewChat: null },
  isTyping: false,
  lastMessageId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.error = { createConversation: null, sendMessage: null, loadMessages: null, loadHistory: null, createNewChat: null };
    },
    clearErrors: (state) => {
      state.error = { createConversation: null, sendMessage: null, loadMessages: null, loadHistory: null, createNewChat: null };
    },
    setTyping: (state, action: PayloadAction<boolean>) => { state.isTyping = action.payload; },
    addOptimisticMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (state.currentConversation) state.currentConversation.messages.push(action.payload);
    },
    removeOptimisticMessage: (state, action: PayloadAction<string>) => {
      if (state.currentConversation) {
        state.currentConversation.messages = state.currentConversation.messages.filter(m => m.id !== action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createConversation.pending, (state) => { state.loading.createConversation = true; state.error.createConversation = null; })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading.createConversation = false;
        state.currentConversation = { id: action.payload.conversation_id, outlook_title: action.payload.outlook_title, messages: [], suggestedQuestions: action.payload.suggested_questions || [], created_at: new Date().toISOString() };
      })
      .addCase(createConversation.rejected, (state, action) => { state.loading.createConversation = false; state.error.createConversation = action.error.message || 'Failed'; });

    builder
      .addCase(sendMessage.pending, (state) => { state.loading.sendMessage = true; state.error.sendMessage = null; state.isTyping = true; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sendMessage = false; state.isTyping = false; state.lastMessageId = action.payload.assistant_message_id;
        if (state.currentConversation) {
          state.currentConversation.messages = state.currentConversation.messages.filter(m => !m.id.startsWith('optimistic-'));
          state.currentConversation.messages.push(
            { id: action.payload.user_message_id, role: 'user', content: (action.meta.arg as any).message, created_at: new Date().toISOString() },
            { id: action.payload.assistant_message_id, role: 'ai', content: action.payload.response, created_at: new Date().toISOString(), sources: action.payload.sources }
          );
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sendMessage = false; state.isTyping = false; state.error.sendMessage = action.error.message || 'Failed';
        if (state.currentConversation) state.currentConversation.messages = state.currentConversation.messages.filter(m => !m.id.startsWith('optimistic-'));
      });

    builder
      .addCase(getOutlookConversation.pending, (state) => { state.loading.loadMessages = true; state.error.loadMessages = null; })
      .addCase(getOutlookConversation.fulfilled, (state, action) => {
        state.loading.loadMessages = false;
        state.currentConversation = {
          id: action.payload.conversation_id, outlook_title: action.payload.outlook_title || 'Daily Outlook',
          messages: (action.payload.messages || []).map((m: any) => ({ id: m.id, role: m.role === 'assistant' ? 'ai' : m.role, content: m.content, created_at: m.created_at || m.timestamp })),
          suggestedQuestions: action.payload.suggested_questions || [], created_at: new Date().toISOString(),
        };
      })
      .addCase(getOutlookConversation.rejected, (state, action) => { state.loading.loadMessages = false; state.error.loadMessages = action.error.message || 'Failed'; });

    builder
      .addCase(createNewChat.pending, (state) => { state.loading.createNewChat = true; state.error.createNewChat = null; })
      .addCase(createNewChat.fulfilled, (state, action) => {
        state.loading.createNewChat = false;
        state.currentConversation = { id: action.payload.conversation_id, outlook_title: action.payload.outlook_title, messages: [], suggestedQuestions: action.payload.suggested_questions || [], created_at: new Date().toISOString() };
      })
      .addCase(createNewChat.rejected, (state, action) => { state.loading.createNewChat = false; state.error.createNewChat = action.error.message || 'Failed'; });

    builder
      .addCase(getConversationHistory.pending, (state) => { state.loading.loadHistory = true; state.error.loadHistory = null; })
      .addCase(getConversationHistory.fulfilled, (state, action) => { state.loading.loadHistory = false; state.conversationHistory = action.payload.conversations as any; })
      .addCase(getConversationHistory.rejected, (state, action) => { state.loading.loadHistory = false; state.error.loadHistory = action.error.message || 'Failed'; });

    builder
      .addCase(loadSpecificConversation.pending, (state) => { state.loading.loadMessages = true; state.error.loadMessages = null; })
      .addCase(loadSpecificConversation.fulfilled, (state, action) => {
        state.loading.loadMessages = false;
        state.currentConversation = {
          id: action.payload.conversation_id, outlook_title: action.payload.outlook_title,
          messages: (action.payload.messages || []).map((m: any) => ({ id: m.id, role: m.role === 'assistant' ? 'ai' : m.role, content: m.content, created_at: m.created_at })),
          suggestedQuestions: [], created_at: new Date().toISOString(),
        };
      })
      .addCase(loadSpecificConversation.rejected, (state, action) => { state.loading.loadMessages = false; state.error.loadMessages = action.error.message || 'Failed'; });
  },
});

export const { clearCurrentConversation, clearErrors, setTyping, addOptimisticMessage, removeOptimisticMessage } = chatSlice.actions;
export default chatSlice.reducer;
