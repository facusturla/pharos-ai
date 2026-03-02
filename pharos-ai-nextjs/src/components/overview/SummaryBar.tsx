import { CONFLICT } from '@/data/iranConflict';
import { EVENTS }   from '@/data/iranEvents';
import { fmtDate }  from '@/lib/format';

function computeDay(): number {
  const start = new Date(CONFLICT.startDate).getTime();
  const latest = EVENTS.reduce((max, e) => {
    const t = new Date(e.timestamp).getTime();
    return t > max ? t : max;
  }, start);
  return Math.floor((latest - start) / 86_400_000) + 1;
}

export function SummaryBar() {
  const day = computeDay();
  const latestDate = [...EVENTS]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp;
  const endDateStr = latestDate ? fmtDate(latestDate) : fmtDate(CONFLICT.startDate);

  const chips: { label: string; danger: boolean }[] = [
    { label: 'KHAMENEI KILLED',                                    danger: true  },
    { label: 'HORMUZ CLOSED',                                      danger: true  },
    { label: `${CONFLICT.casualties.us.kia} US KIA`,               danger: true  },
    { label: `${CONFLICT.casualties.iran.killed} IR DEAD`,         danger: true  },
    { label: `${CONFLICT.casualties.israel.civilians} IL DEAD`,    danger: true  },
    { label: `DAY ${day}`,                                          danger: false },
  ];

  return (
    <div
      className="flex items-center gap-1.5 px-4 shrink-0 overflow-x-auto h-9 bg-[var(--bg-app)] border-b border-[var(--bd)]"
    >
      <span className="label shrink-0 text-[8px] text-[var(--t4)]">KEY FACTS</span>
      <div className="shrink-0 w-px h-3.5 bg-[var(--bd)]" />
      {chips.map(chip => (
        <div
          key={chip.label}
          className={`flex items-center shrink-0 px-2 py-0.5 border ${chip.danger ? 'bg-[var(--danger-dim)] border-[var(--danger-bd)]' : 'bg-[var(--bg-2)] border-[var(--bd)]'}`}
        >
          <span className={`mono text-[9px] font-bold tracking-[0.06em] ${chip.danger ? 'text-[var(--danger)]' : 'text-[var(--t2)]'}`}>
            {chip.label}
          </span>
        </div>
      ))}
      <div className="ml-auto shrink-0">
        <span className="mono text-[9px] text-[var(--t4)]">
          {fmtDate(CONFLICT.startDate)} – {endDateStr} · OPERATIONS {CONFLICT.status}
        </span>
      </div>
    </div>
  );
}
