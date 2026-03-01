import { Separator } from '@/components/ui/separator';

/** Labelled horizontal rule used throughout the dashboard (section headers). */
export function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span className="label" style={{ fontSize: 8, flexShrink: 0 }}>{label}</span>
      <Separator style={{ flex: 1, background: 'var(--bd-s)' }} />
    </div>
  );
}
