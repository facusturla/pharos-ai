'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, User, Settings, Globe, Clock, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [alertCount] = useState(3);
  const pathname = usePathname();

  const navItems = [
    { label: 'SITUATION', href: '/dashboard', icon: Globe },
    { label: 'TIMELINE', href: '/dashboard/timeline', icon: Clock },
    { label: 'INTELLIGENCE', href: '/dashboard/outlook', icon: TrendingUp },
  ];

  return (
    <header className="bg-slate-900 text-white border-b-4 border-red-600">
      <div className="max-w-full mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-bold font-sans text-sm uppercase tracking-[0.05em]">LIVE INTELLIGENCE</span>
            </div>
            <div className="text-slate-300 text-sm">
              {new Date().toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white relative">
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
                  {alertCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <svg viewBox="0 0 1024 1024" className="w-full h-full">
                  <rect fill="#dd4545" height="1024" width="1024" x="0" y="0" />
                  <path d="M 199,270 L 201,427 L 455,370 L 465,384 L 426,396 L 450,454 L 419,689 L 379,694 L 371,732 L 201,747 L 812,745 L 640,732 L 632,694 L 593,689 L 562,458 L 586,398 L 547,389 L 561,371 L 811,427 L 811,268 L 560,323 L 509,265 L 452,323 Z" fill="white" stroke="none" />
                  <path d="M 394,713 L 611,709 L 617,728 L 400,732 Z" fill="#dd4545" stroke="none" />
                  <path d="M 568,633 L 572,692 L 486,689 Z" fill="#dd4545" stroke="none" />
                  <path d="M 551,517 L 562,599 L 441,684 L 449,581 Z" fill="#dd4545" stroke="none" />
                  <path d="M 542,451 L 531,506 L 457,555 L 466,454 Z" fill="#dd4545" stroke="none" />
                  <path d="M 444,413 L 567,419 L 463,433 Z" fill="#dd4545" stroke="none" />
                  <path d="M 473,346 L 536,343 L 527,387 L 489,391 Z" fill="#dd4545" stroke="none" />
                  <path d="M 478,317 L 508,301 L 534,321 Z" fill="#dd4545" stroke="none" />
                  <path d="M 796,292 L 789,407 L 556,351 Z" fill="#dd4545" stroke="none" />
                  <path d="M 216,292 L 456,351 L 222,407 Z" fill="#dd4545" stroke="none" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-sans font-bold tracking-tight">PHAROS</h1>
                <div className="text-xs text-slate-400 font-sans text-sm uppercase tracking-[0.05em]">INTELLIGENCE</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Button
                    variant="ghost"
                    className={`px-4 py-2 font-sans text-sm uppercase tracking-[0.05em] text-sm ${
                      pathname === href
                        ? 'text-white bg-slate-700 border-b-2 border-red-500'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search intelligence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
