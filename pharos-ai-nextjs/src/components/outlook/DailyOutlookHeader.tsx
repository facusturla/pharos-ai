'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, User, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const DailyOutlookHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-slate-900 text-white border-b-4 border-red-600">
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center justify-between py-2 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-bold font-sans text-sm uppercase tracking-[0.05em]">LIVE INTELLIGENCE</span>
            </div>
            <div className="text-slate-300 text-sm">
              {new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white"><User className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white"><Settings className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <svg viewBox="0 0 1024 1024" className="w-full h-full">
                  <rect fill="#dd4545" height="1024" width="1024" x="0" y="0" />
                  <path d="M 199,270 L 201,427 L 455,370 L 465,384 L 426,396 L 450,454 L 419,689 L 379,694 L 371,732 L 201,747 L 812,745 L 640,732 L 632,694 L 593,689 L 562,458 L 586,398 L 547,389 L 561,371 L 811,427 L 811,268 L 560,323 L 509,265 L 452,323 Z" fill="white" stroke="none" />
                  <path d="M 394,713 L 611,709 L 617,728 L 400,732 Z" fill="#dd4545" stroke="none" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-sans font-bold tracking-tight">PHAROS</h1>
                <div className="text-xs text-slate-400 font-sans text-sm uppercase tracking-[0.05em]">INTELLIGENCE</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/dashboard/outlook">
                <Button variant="ghost" className="px-6 py-2 font-sans text-sm uppercase tracking-[0.05em] text-slate-300 hover:text-white hover:bg-slate-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  BACK TO DASHBOARD
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search daily outlooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
