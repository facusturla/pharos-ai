'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, Users, Clock } from 'lucide-react';

const recentEvents = [
  { id: 1, title: 'IDF confirms targeted precision strikes in Khan Younis sector', time: '2 MINUTES AGO', importance: 3, source: 'IDF OFFICIAL STATEMENT', verified: true, classification: 'CONFIRMED MILITARY ACTION', region: 'GAZA STRIP' },
  { id: 2, title: 'European Union foreign ministers schedule emergency consultation', time: '15 MINUTES AGO', importance: 2, source: 'EU COUNCIL PRESS OFFICE', verified: true, classification: 'DIPLOMATIC RESPONSE', region: 'BRUSSELS' },
  { id: 3, title: 'Social intelligence indicates potential ceasefire negotiations', time: '32 MINUTES AGO', importance: 1, source: 'MULTIPLE SOURCES', verified: false, classification: 'UNVERIFIED INTELLIGENCE', region: 'UNDISCLOSED' },
];

const actorResponses = [
  { actor: 'US STATE DEPARTMENT', response: 'Calls for immediate de-escalation and civilian protection', time: '1H AGO', stance: 'NEUTRAL', classification: 'OFFICIAL' },
  { actor: 'ISRAELI PRIME MINISTER', response: 'Defends military operations as necessary security measures', time: '45M AGO', stance: 'SUPPORTING', classification: 'OFFICIAL' },
  { actor: 'EGYPTIAN FOREIGN MINISTRY', response: 'Offers mediation services for renewed dialogue', time: '2H AGO', stance: 'NEUTRAL', classification: 'OFFICIAL' },
  { actor: 'UN SECRETARY-GENERAL', response: 'Condemns targeting of civilian infrastructure', time: '3H AGO', stance: 'OPPOSING', classification: 'OFFICIAL' },
];

const getImportanceIndicator = (level: number) => {
  switch (level) {
    case 3: return { color: 'border-red-600 bg-red-50', badge: 'bg-red-600 text-white', label: 'CRITICAL' };
    case 2: return { color: 'border-orange-500 bg-orange-50', badge: 'bg-orange-500 text-white', label: 'HIGH' };
    default: return { color: 'border-slate-400 bg-slate-50', badge: 'bg-slate-500 text-white', label: 'STANDARD' };
  }
};

const getStanceColor = (stance: string) => {
  switch (stance) {
    case 'SUPPORTING': return 'text-green-700 bg-green-100';
    case 'OPPOSING': return 'text-red-700 bg-red-100';
    default: return 'text-slate-700 bg-slate-100';
  }
};

interface DashboardProps { selectedTopic: string; }

export const Dashboard = ({ selectedTopic }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-300">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-sans font-bold tracking-tight">NEWS FEED</h2>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-bold font-sans text-sm uppercase tracking-[0.05em] text-sm">LIVE MONITORING</span>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {recentEvents.map((event) => {
            const indicator = getImportanceIndicator(event.importance);
            return (
              <div key={event.id} className={`border-l-4 pl-6 py-4 ${indicator.color} transition-colors cursor-pointer hover:bg-slate-50`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 text-xs font-bold font-sans text-sm uppercase tracking-[0.05em] ${indicator.badge}`}>{indicator.label}</div>
                    {event.verified && <div className="bg-green-600 text-white px-2 py-1 text-xs font-bold font-sans text-sm uppercase tracking-[0.05em]">VERIFIED</div>}
                    <Badge variant="outline" className="text-xs font-sans uppercase tracking-[0.05em] border-slate-400 text-slate-700">{event.region}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">{event.time}</div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 font-sans font-bold tracking-tight">{event.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span className="font-sans text-sm uppercase tracking-[0.05em]">SOURCE: {event.source}</span>
                  <span className="font-sans text-sm uppercase tracking-[0.05em]">CLASS: {event.classification}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="bg-white border-slate-300">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 font-sans font-bold tracking-tight">REACTION MONITORING</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actorResponses.map((response, index) => (
              <div key={index} className="p-4 border border-slate-300 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 font-sans font-bold tracking-tight text-sm">{response.actor}</span>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs font-sans uppercase tracking-[0.05em] ${getStanceColor(response.stance)}`}>{response.stance}</Badge>
                    <span className="text-xs text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">{response.time}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-700 font-serif leading-relaxed mb-2">{response.response}</p>
                <div className="text-xs text-slate-500 font-sans text-sm uppercase tracking-[0.05em]">CLASSIFICATION: {response.classification}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center bg-red-50 border-red-200">
          <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-700 font-sans font-bold tracking-tight">47</div>
          <div className="text-sm text-red-600 font-sans text-sm uppercase tracking-[0.05em]">ACTIVE EVENTS</div>
        </Card>
        <Card className="p-6 text-center bg-orange-50 border-orange-200">
          <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-700 font-sans font-bold tracking-tight">8</div>
          <div className="text-sm text-orange-600 font-sans text-sm uppercase tracking-[0.05em]">CRITICAL ALERTS</div>
        </Card>
        <Card className="p-6 text-center bg-slate-50 border-slate-200">
          <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-700 font-sans font-bold tracking-tight">12</div>
          <div className="text-sm text-slate-600 font-sans text-sm uppercase tracking-[0.05em]">ACTOR RESPONSES</div>
        </Card>
        <Card className="p-6 text-center bg-slate-50 border-slate-200">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-700 font-sans font-bold tracking-tight">2M</div>
          <div className="text-sm text-slate-600 font-sans text-sm uppercase tracking-[0.05em]">LAST UPDATE</div>
        </Card>
      </div>
    </div>
  );
};
