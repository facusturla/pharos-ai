'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Bell, CheckCircle, Clock } from 'lucide-react';
import { AlertModal } from './AlertModal';
import mockAlerts from '@/data/mockAlerts.json';

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

export const NotificationPanel = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const rawAlerts = (mockAlerts as any).alerts || mockAlerts;
  const alerts = (rawAlerts as Alert[]).filter((a) => !dismissedAlerts.includes(a.id));

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleDismiss = (e: React.MouseEvent, alertId: number) => {
    e.stopPropagation();
    setDismissedAlerts((prev) => [...prev, alertId]);
  };

  const getImportanceStyle = (level: number) => {
    switch (level) {
      case 3: return { border: 'border-red-600', bg: 'bg-red-50', badge: 'bg-red-600 text-white', label: 'CRITICAL' };
      case 2: return { border: 'border-orange-500', bg: 'bg-orange-50', badge: 'bg-orange-500 text-white', label: 'HIGH' };
      default: return { border: 'border-slate-300', bg: 'bg-slate-50', badge: 'bg-slate-500 text-white', label: 'STANDARD' };
    }
  };

  return (
    <>
      <Card className="bg-white border-slate-300">
        <div className="p-4 border-b border-slate-200 bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-white font-sans text-sm uppercase tracking-[0.05em]">INTELLIGENCE ALERTS</h2>
            </div>
            {alerts.length > 0 && (
              <Badge className="bg-red-600 text-white text-xs font-sans uppercase tracking-[0.05em]">{alerts.length} ACTIVE</Badge>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {alerts.length === 0 && (
            <div className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-serif leading-relaxed">All clear. No active alerts.</p>
            </div>
          )}
          {alerts.map((alert) => {
            const style = getImportanceStyle(alert.importance);
            return (
              <div
                key={alert.id}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${style.border}`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.importance === 3 ? 'text-red-600' : alert.importance === 2 ? 'text-orange-500' : 'text-slate-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                        <div className={`px-2 py-0.5 text-xs font-bold font-sans text-sm uppercase tracking-[0.05em] ${style.badge}`}>{style.label}</div>
                        {alert.verified && <CheckCircle className="w-3 h-3 text-green-600" />}
                      </div>
                      <p className="text-sm font-bold text-slate-900 font-sans font-bold tracking-tight line-clamp-2">{alert.title}</p>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 font-sans text-sm uppercase tracking-[0.05em] mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDismiss(e, alert.id)}
                    className="text-slate-400 hover:text-slate-600 ml-2 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <AlertModal alert={selectedAlert} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
