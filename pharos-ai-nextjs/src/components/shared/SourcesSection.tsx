'use client';
import React from 'react';

interface Source { id: string; url: string; title: string; }
interface SourcesSectionProps { sources: Source[]; }

const SourcesSection: React.FC<SourcesSectionProps> = ({ sources }) => (
  <div className="bg-slate-50 border border-slate-300 rounded-lg p-6 mt-8">
    <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wide font-sans font-bold tracking-tight">Sources</h3>
    <div className="space-y-2">
      {sources.map((source) => (
        <div key={source.id} className="flex gap-3">
          <span className="text-slate-600 font-mono text-sm min-w-[2rem]">[{source.id}]:</span>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 hover:underline text-sm font-serif leading-relaxed">
            {source.title}
          </a>
        </div>
      ))}
    </div>
  </div>
);

export default SourcesSection;
