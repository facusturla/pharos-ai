export interface OutlookItem {
  id: string;
  title: string;
  summary: string;
  topic: string;
  date: string;
  readTime: string;
  regions: string[];
  publishedAt?: string;
  confidenceScore?: number;
  sourceCount?: number;
  wordCount?: number;
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
  content: {
    standard: string;
    easierEnglish: string;
  };
  annotations: Array<{
    term: string;
    type: string;
    description: string;
  }>;
  sources: Array<{
    id: string;
    url: string;
    title: string;
  }>;
  mapConfig: any;
}
