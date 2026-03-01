'use client';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Annotation { term: string; type: string; description: string; }
interface Source { id: string; url: string; title: string; }
interface AnnotatedTextProps { text: string; annotations: Annotation[]; sources?: Source[]; }

const getTypeColors = (type: string) => {
  switch (type.toLowerCase()) {
    case 'location': return { decoration: 'decoration-blue-500', background: 'bg-blue-50' };
    case 'person': return { decoration: 'decoration-green-500', background: 'bg-green-50' };
    case 'organization': return { decoration: 'decoration-purple-500', background: 'bg-purple-50' };
    case 'date': return { decoration: 'decoration-orange-500', background: 'bg-orange-50' };
    case 'newschannel': return { decoration: 'decoration-red-500', background: 'bg-red-50' };
    case 'event': return { decoration: 'decoration-indigo-500', background: 'bg-indigo-50' };
    case 'topic': return { decoration: 'decoration-yellow-500', background: 'bg-yellow-50' };
    default: return { decoration: 'decoration-slate-500', background: 'bg-slate-50' };
  }
};

const AnnotatedText: React.FC<AnnotatedTextProps> = ({ text, annotations, sources = [] }) => {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  const processText = (inputText: string) => {
    let normalizedText = inputText
      .replace(/\n(?!\n)/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .split('\n\n')
      .filter((p) => p.trim())
      .join('\n\n');

    type Element = { type: 'annotation' | 'footnote'; term: string; annotation?: Annotation; sources?: Source[]; start: number; end: number };
    const elements: Element[] = [];

    const footnoteRegex = /\(([^)]*\[[^\]]+\]\[\d+\][^)]*)\)|(\[\d+\](?:\[\d+\])*)/g;
    let fnMatch;
    while ((fnMatch = footnoteRegex.exec(normalizedText)) !== null) {
      const fullMatch = fnMatch[0];
      const citationsText = fnMatch[1] || fnMatch[2];
      const citationRegex = /\[(\d+)\]/g;
      let cm;
      const citations: Source[] = [];
      while ((cm = citationRegex.exec(citationsText || fullMatch)) !== null) {
        const src = sourceMap.get(cm[1]);
        if (src) citations.push(src);
      }
      if (citations.length > 0) elements.push({ type: 'footnote', term: fullMatch, sources: citations, start: fnMatch.index, end: fnMatch.index + fullMatch.length });
    }

    annotations.forEach((annotation) => {
      const escaped = annotation.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      let m;
      while ((m = regex.exec(normalizedText)) !== null) {
        const overlaps = elements.some((e) => m!.index < e.end && m!.index + m![0].length > e.start);
        if (!overlaps) elements.push({ type: 'annotation', term: m[0], annotation, start: m.index, end: m.index + m[0].length });
      }
    });

    const filtered: Element[] = [];
    const sorted = [...elements].sort((a, b) => a.start - b.start);
    for (let i = 0; i < sorted.length; i++) {
      let keep = true;
      for (let j = 0; j < sorted.length; j++) {
        if (i === j) continue;
        const overlaps = sorted[i].start < sorted[j].end && sorted[i].end > sorted[j].start;
        if (overlaps) {
          const ci = sorted[i].end - sorted[i].start;
          const cj = sorted[j].end - sorted[j].start;
          if (cj > ci || (cj === ci && j < i)) { keep = false; break; }
        }
      }
      if (keep) filtered.push(sorted[i]);
    }

    filtered.sort((a, b) => b.start - a.start);
    let processedText = normalizedText;
    filtered.forEach((el, idx) => {
      processedText = processedText.slice(0, el.start) + `__ELEMENT_${idx}__` + processedText.slice(el.end);
    });

    return processedText.split('\n\n').map((paragraph, pi) => {
      if (!paragraph.trim()) return null;
      const parts = paragraph.split(/__ELEMENT_(\d+)__/);
      const result: React.ReactNode[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          if (parts[i]) result.push(parts[i]);
        } else {
          const elIdx = parseInt(parts[i]);
          const el = filtered[elIdx];
          if (el?.type === 'footnote' && el.sources?.length) {
            result.push(
              <span key={`fn-${elIdx}`} className="inline-flex gap-0.5">
                {el.sources.map((src, idx2) => (
                  <TooltipProvider key={`cit-${src.id}-${idx2}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <sup className="text-blue-600 hover:text-blue-800 cursor-help font-medium">[{src.id}]</sup>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-3 border shadow-md bg-white">
                        <p className="text-sm font-medium text-slate-900">{src.title}</p>
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">{src.url}</a>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </span>
            );
          } else if (el?.type === 'annotation' && el.annotation) {
            const colors = getTypeColors(el.annotation.type);
            result.push(
              <TooltipProvider key={`ann-${elIdx}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`cursor-help underline decoration-1 decoration-dotted hover:decoration-2 transition-all duration-200 px-1 py-0.5 rounded ${colors.decoration} ${colors.background}`}>
                      {el.term}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 border shadow-md bg-white">
                    <div className="space-y-2">
                      <span className="px-2 py-1 text-xs font-bold rounded uppercase tracking-wide bg-slate-100 text-slate-700">{el.annotation.type}</span>
                      <p className="text-sm font-medium text-slate-900">{el.annotation.term}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{el.annotation.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
        }
      }
      return <p key={pi} className="text-slate-800 leading-relaxed">{result}</p>;
    }).filter(Boolean);
  };

  return <div className="space-y-6">{processText(text)}</div>;
};

export default AnnotatedText;
