const CHAT_API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8100/api/chat';

class ChatApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${CHAT_API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.success !== undefined && !data.success) {
      throw new Error(data.error || 'API request failed');
    }
    return data;
  }

  async createConversation(params: { outlookSlug: string; sessionId?: string }): Promise<CreateConversationResponse> {
    return this.request<CreateConversationResponse>('/conversations/', {
      method: 'POST',
      body: JSON.stringify({ outlook_slug: params.outlookSlug, session_id: params.sessionId }),
    });
  }

  async sendMessage(params: { conversationId: string; message: string; outlookSlug: string }): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/messages/', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: params.conversationId, message: params.message, outlook_slug: params.outlookSlug }),
    });
  }

  async getMessages(conversationId: string): Promise<GetMessagesResponse> {
    return this.request<GetMessagesResponse>(`/conversations/${conversationId}/messages/`);
  }

  async submitFeedback(params: { messageId: string; feedbackType: 'thumbs_up' | 'thumbs_down'; comment?: string }): Promise<SubmitFeedbackResponse> {
    return this.request<SubmitFeedbackResponse>('/feedback/', {
      method: 'POST',
      body: JSON.stringify({ message_id: params.messageId, feedback_type: params.feedbackType, comment: params.comment }),
    });
  }

  async getOutlookConversation(outlookId: string): Promise<GetOutlookConversationResponse> {
    return this.request<GetOutlookConversationResponse>(`/outlooks/${outlookId}/conversation/`);
  }

  async getOutlookConversations(outlookId: string): Promise<GetOutlookConversationsResponse> {
    return this.request<GetOutlookConversationsResponse>(`/outlooks/${outlookId}/conversations/`);
  }
}

export const chatApiClient = new ChatApiClient();

export interface CreateConversationResponse {
  success: boolean;
  conversation_id: string;
  outlook_title: string;
  suggested_questions?: string[];
}

export interface SendMessageResponse {
  success: boolean;
  user_message_id: string;
  assistant_message_id: string;
  response: string;
  sources: Array<{ id: number; url: string; title: string; domain: string; footnote_number: number }>;
  sources_count: number;
  search_queries_used: string[];
}

export interface GetMessagesResponse {
  success: boolean;
  conversation_id: string;
  outlook_title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    sources?: Array<{ id: number; url: string; title: string; domain: string; footnote_number: number }>;
  }>;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  feedback_id: string;
  created: boolean;
}

export interface GetOutlookConversationResponse {
  success: boolean;
  conversation_id: string;
  outlook_id: string;
  outlook_title?: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    created_at?: string;
    sources?: Array<{ title: string; url: string; domain: string }>;
  }>;
  suggested_questions?: string[];
  meta: { timestamp: string; version: string };
}

export interface GetOutlookConversationsResponse {
  success: boolean;
  conversations: Array<{
    id: string;
    title: string;
    created_at: string;
    message_count: number;
    preview: string;
    suggested_questions: string[];
  }>;
  meta: { timestamp: string; version: string; total_count: number };
}
