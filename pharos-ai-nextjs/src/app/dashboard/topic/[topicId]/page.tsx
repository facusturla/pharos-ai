'use client';
import { Header } from '@/components/dashboard/Header';
import { TopicDetail } from '@/components/dashboard/TopicDetail';

export default function TopicDetailPage({ params }: { params: { topicId: string } }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <TopicDetail topicId={params.topicId} />
        </div>
      </main>
    </div>
  );
}
