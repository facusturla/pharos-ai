const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8100/api/news';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getDashboardOutlooks(): Promise<DashboardOutlooksResponse> {
    return this.request<DashboardOutlooksResponse>('/dashboard/');
  }

  async getOutlooks(params?: OutlookListParams): Promise<OutlookListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.topic) searchParams.append('topic', params.topic);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    const query = searchParams.toString();
    return this.request<OutlookListResponse>(`/outlooks/${query ? `?${query}` : ''}`);
  }

  async getOutlookDetail(outlookId: string): Promise<OutlookDetailResponse> {
    return this.request<OutlookDetailResponse>(`/outlooks/${outlookId}/`);
  }

  async getAvailableTopics(): Promise<AvailableTopicsResponse> {
    return this.request<AvailableTopicsResponse>('/topics/available/');
  }

  async getOutlookCalendarDates(topicSlug: string, params?: CalendarDatesParams): Promise<CalendarDatesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.year) searchParams.append('year', params.year.toString());
    if (params?.month) searchParams.append('month', params.month.toString());
    const query = searchParams.toString();
    return this.request<CalendarDatesResponse>(`/topics/${topicSlug}/calendar-dates/${query ? `?${query}` : ''}`);
  }

  async getOutlooksByDate(date: string): Promise<OutlooksByDateResponse> {
    return this.request<OutlooksByDateResponse>(`/calendar/date/${date}/`);
  }
}

export const apiClient = new ApiClient();

export interface OutlookListParams {
  limit?: number;
  offset?: number;
  topic?: string;
  date_from?: string;
  date_to?: string;
}

export interface DashboardOutlook {
  topic_id: string;
  topic_name: string;
  latest_outlook: {
    id: string;
    title: string;
    summary: string;
    date: string;
    readTime: string;
    regions: string[];
    publishedAt: string;
    confidenceScore?: number;
    sourceCount?: number;
    wordCount?: number;
  } | null;
}

export interface DashboardOutlooksResponse {
  success: boolean;
  data: { latest_outlooks: DashboardOutlook[] };
  meta?: { timestamp: string; version: string; total_topics: number };
}

export interface OutlookListItem {
  id: string;
  title: string;
  summary: string;
  topic: string;
  date: string;
  readTime: string;
  regions: string[];
  publishedAt: string;
  confidenceScore: number;
  sourceCount: number;
  wordCount: number;
}

export interface OutlookListResponse {
  success: boolean;
  data: {
    outlooks: OutlookListItem[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasNext: boolean;
      hasPrevious: boolean;
      nextOffset: number | null;
      previousOffset: number | null;
    };
    filters: { topic: string | null; dateFrom: string | null; dateTo: string | null };
  };
  meta?: { timestamp: string; version: string };
}

export interface OutlookDetail {
  id: string;
  title: string;
  summary: string;
  topic: string;
  topicSlug: string;
  date: string;
  readTime: string;
  regions: string[];
  publishedAt: string;
  content: { standard: string; easierEnglish: string };
  annotations: Array<{ term: string; type: string; description: string }>;
  sources: Array<{ id: string; url: string; title: string }>;
  mapConfig: any;
}

export interface OutlookDetailResponse {
  success: boolean;
  data: OutlookDetail;
  meta?: { timestamp: string; version: string };
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  priority: number;
  active_rss_feeds_count: number;
  created_at: string;
}

export interface AvailableTopicsResponse {
  available_topics: Topic[];
  count: number;
  description: string;
}

export interface CalendarDatesParams { year?: number; month?: number; }

export interface CalendarDateItem {
  date: string;
  outlook_slug: string;
  title: string;
  has_content: boolean;
  created_at: string;
  confidence_score: number;
  source_count: number;
}

export interface CalendarDatesResponse {
  success: boolean;
  data: {
    topic_slug: string;
    topic_name: string;
    dates: CalendarDateItem[];
    year: number;
    month: number | null;
    total_dates: number;
  };
  meta?: { timestamp: string; version: string };
}

export interface DashboardOutlookItem {
  id: string;
  title: string;
  summary: string;
  topic: string;
  topic_slug: string;
  readTime: string;
  regions: string[];
  publishedAt: string;
  confidence_score: number;
  source_count: number;
  word_count: number;
}

export interface OutlooksByDateResponse {
  success: boolean;
  data: {
    date: string;
    formatted_date: string;
    total_active_topics: number;
    outlooks_available: number;
    coverage_percentage: number;
    outlooks: DashboardOutlookItem[];
  };
  meta?: { timestamp: string; version: string };
}
