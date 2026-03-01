'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { OutlookItem } from '@/types';
import { getTopicColor } from '@/utils/topicColors';

interface DailyOutlookCardProps { outlook: OutlookItem; }

export const DailyOutlookCard = ({ outlook }: DailyOutlookCardProps) => {
  return (
    <Card className="bg-white border-slate-300 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className={`text-xs font-sans uppercase tracking-[0.05em] ${getTopicColor(outlook.topic)}`}>{outlook.topic}</Badge>
            <div className="flex items-center text-slate-500 text-sm font-sans uppercase tracking-[0.05em]">
              <Clock className="w-3 h-3 mr-1" />
              {outlook.date}
            </div>
          </div>
          <div className="flex items-center text-slate-500 text-sm font-sans uppercase tracking-[0.05em]">
            <FileText className="w-3 h-3 mr-1" />
            {outlook.readTime} read
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-3 font-sans font-bold tracking-tight leading-tight">{outlook.title}</h2>
        <p className="text-slate-600 font-serif leading-relaxed mb-4">{outlook.summary}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {outlook.regions.map((region, index) => (
              <div key={index} className="flex items-center text-slate-500 text-xs font-sans uppercase tracking-[0.05em]">
                <MapPin className="w-3 h-3 mr-1" />
                {region}
              </div>
            ))}
          </div>
          <Link href={`/outlook/${outlook.id}`}>
            <Button className="font-sans text-sm uppercase tracking-[0.05em] bg-slate-900 text-white hover:bg-slate-800" size="sm">
              READ FULL OUTLOOK <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
