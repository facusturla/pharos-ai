'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Clock, MapPin, CheckCircle } from 'lucide-react';
import { getTopicColor } from '@/utils/topicColors';

interface Alert {
  id: number;
  title: string;
  content: string;
  time: string;
  timestamp: string;
  importance: number;
  topic: string;
  source: string;
  region: string;
  verified: boolean;
}

interface AlertModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AlertModal = ({ alert, isOpen, onClose }: AlertModalProps) => {
  if (!isOpen || !alert) return null;

  const getImportanceIndicator = (level: number) => {
    switch (level) {
      case 3: return { color: 'bg-red-600', label: 'CRITICAL', border: 'border-red-600' };
      case 2: return { color: 'bg-orange-500', label: 'HIGH PRIORITY', border: 'border-orange-500' };
      default: return { color: 'bg-slate-500', label: 'STANDARD', border: 'border-slate-400' };
    }
  };

  const indicator = getImportanceIndicator(alert.importance);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className={`p-4 border-b-4 ${indicator.border} bg-slate-100`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div className={`px-3 py-1 text-xs font-bold font-sans text-sm uppercase tracking-[0.05em] ${indicator.color} text-white`}>{indicator.label}</div>
              {alert.verified && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold font-sans text-sm uppercase tracking-[0.05em]">VERIFIED</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-500 hover:text-slate-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold font-sans font-bold tracking-tight text-slate-900 mb-2">{alert.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">
              <div className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{alert.time}</span></div>
              <div className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{alert.region}</span></div>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-slate-700 font-serif leading-relaxed">{alert.content}</p>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={`text-xs font-sans uppercase tracking-[0.05em] ${getTopicColor(alert.topic)}`}>{alert.topic}</Badge>
                <span className="text-xs text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">SOURCE: {alert.source}</span>
              </div>
              <div className="text-xs text-slate-400 font-sans text-sm uppercase tracking-[0.05em]">{new Date(alert.timestamp).toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" className="font-sans text-sm uppercase tracking-[0.05em] border-slate-400 text-slate-700">MARK AS READ</Button>
            <Button className="font-sans text-sm uppercase tracking-[0.05em] bg-slate-900 text-white hover:bg-slate-800">VIEW RELATED INTELLIGENCE</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
