import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props { label: string; count: number; color: string }

/** Coloured section divider used in the signals feed (BREAKING / HIGH / STANDARD). */
export function SectionHeader({ label, count, color }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '4px 0' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
        {label}
      </span>
      <Badge
        variant="outline"
        style={{ fontSize: 8, padding: '1px 5px', color, borderColor: `${color}60`, background: `${color}20`, borderRadius: 2, flexShrink: 0 }}
      >
        {count}
      </Badge>
      <Separator style={{ flex: 1, background: `${color}30` }} />
    </div>
  );
}
