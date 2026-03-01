'use client';
import { fmtDate } from '@/lib/format';
import { CONFLICT } from '@/data/iranConflict';
import { ACTORS }   from '@/data/iranActors';
import { EVENTS }   from '@/data/iranEvents';
import { ScrollArea } from '@/components/ui/scroll-area';
import Flag from '@/components/shared/Flag';
import { BriefSection, EconChip, ScenarioCard } from '@/components/brief/BriefSection';

const SOURCES = [
  { name: 'Reuters',                     tier: 1, note: 'Primary wire coverage — Tel Aviv, Tehran, Washington' },
  { name: 'New York Times',              tier: 1, note: 'Investigative sourcing + senior Pentagon readouts' },
  { name: 'Associated Press',            tier: 1, note: 'Casualty figures, diplomatic wires' },
  { name: 'CENTCOM official statements', tier: 1, note: 'US KIA, operational updates' },
  { name: 'IDF Spokesperson',            tier: 1, note: 'Strike confirmations, target lists' },
  { name: 'ISW / CTP',                   tier: 1, note: 'Operational analysis, OSINT corroboration' },
  { name: 'IAEA Director General',       tier: 1, note: 'Nuclear facility sensor contact / safeguards' },
  { name: 'Axios',                        tier: 1, note: 'Leadership decapitation confirmations' },
  { name: 'IRNA (Iranian state media)',  tier: 2, note: 'Used for Iranian-side claims only — treat as propaganda unless corroborated' },
  { name: 'CNBC / Trump interview',      tier: 1, note: 'Presidential statements, Mar-a-Lago readout' },
  { name: 'CSIS',                         tier: 1, note: 'Target analysis, nuclear facility BDA' },
  { name: 'Kpler / MarineTraffic',       tier: 2, note: 'Strait of Hormuz vessel tracking, AIS data' },
  { name: 'Maersk customer advisory',   tier: 1, note: 'Commercial shipping disruption, route closures' },
];

const TIER_C: Record<number, string> = { 1: 'var(--success)', 2: 'var(--warning)' };

export default function BriefPage() {
  const recentEvents = [...EVENTS]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
  void recentEvents; // available if needed by future sections

  const majorActors = ACTORS.filter(a => ['us', 'idf', 'iran', 'irgc', 'houthis'].includes(a.id));

  return (
    <ScrollArea className="flex-1 bg-[var(--bg-1)]">
      <div className="max-w-[720px] mx-auto px-6 pt-8 pb-[60px]">

        {/* Classification header */}
        <div className="text-center mb-8 pb-5 border-b-2 border-[var(--bd)]">
          <div className="mb-2">
            <span className="mono text-[9px] font-bold tracking-[0.16em] text-[var(--t4)] uppercase">
              UNCLASSIFIED // PHAROS ANALYTICAL
            </span>
          </div>
          <h1 className="mono text-[22px] font-bold text-[var(--t1)] tracking-[0.04em] mb-[6px]">
            DAILY INTELLIGENCE BRIEF
          </h1>
          <h2 className="mono text-[15px] font-bold text-[var(--danger)] tracking-[0.08em] mb-2.5">
            OPERATION EPIC FURY / ROARING LION
          </h2>
          <div className="flex justify-center gap-5">
            <span className="mono text-[10px] text-[var(--t3)]">DATE: 2026-03-01</span>
            <span className="mono text-[10px] text-[var(--t3)]">AS OF: 14:00 UTC</span>
            <span className="mono text-[10px] text-[var(--t3)]">DAY 2 OF OPERATIONS</span>
          </div>
        </div>

        <BriefSection number="1" title="EXECUTIVE SUMMARY">
          <p className="leading-[1.8] text-[var(--t1)] mb-3">{CONFLICT.summary}</p>
          <p className="leading-[1.8] text-[var(--t2)] mb-3">
            As of 14:00 UTC on March 1, 2026 — Day 2 of operations — the United States and Israel continue to conduct active strikes against Iranian nuclear, missile, and military infrastructure. Iran's transitional government has vowed continued retaliation but appears to be operating on pre-delegated retaliatory protocols rather than coherent centralized command.
          </p>
          <p className="leading-[1.8] text-[var(--t2)]">
            The economic dimension of the conflict has escalated sharply. IRGC closure of the Strait of Hormuz combined with Houthi resumption of Red Sea attacks has effectively closed both major maritime chokepoints simultaneously — the most severe supply disruption since 1973. Brent crude is trading at $143/barrel (+35%).
          </p>
        </BriefSection>

        <BriefSection number="2" title="KEY DEVELOPMENTS — LAST 24 HOURS">
          <div className="flex flex-col gap-[6px]">
            {CONFLICT.keyFacts.map((fact, i) => (
              <div key={i} className="flex gap-3 px-3 py-2 bg-[var(--bg-2)] border border-[var(--bd)] [border-left:3px_solid_var(--danger)]">
                <span className="mono text-[10px] font-bold text-[var(--danger)] shrink-0 pt-[1px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[12.5px] text-[var(--t1)] leading-normal">{fact}</p>
              </div>
            ))}
          </div>
        </BriefSection>

        <BriefSection number="3" title="SITUATION BY ACTOR">
          <div className="flex flex-col gap-3">
            {majorActors.map(actor => (
              <div key={actor.id} className="px-4 py-3 bg-[var(--bg-2)] border border-[var(--bd)]">
                <div className="flex items-center gap-2 mb-2">
                  {actor.countryCode && <Flag code={actor.countryCode} size={18} />}
                  <span className="text-[13px] font-bold text-[var(--t1)]">{actor.fullName}</span>
                  <span className="text-[8px] font-bold px-[6px] py-[2px] bg-[var(--danger-dim)] text-[var(--danger)] ml-auto">
                    {actor.activityLevel}
                  </span>
                  <span className="text-[8px] font-bold px-[6px] py-[2px] bg-[var(--bg-3)] text-[var(--t2)]">
                    {actor.stance}
                  </span>
                </div>
                <p className="text-[12.5px] text-[var(--t2)] leading-relaxed">{actor.assessment}</p>
              </div>
            ))}
          </div>
        </BriefSection>

        <BriefSection number="4" title="ECONOMIC IMPACT">
          <p className="leading-[1.8] text-[var(--t2)] mb-3">
            The simultaneous closure of the Strait of Hormuz and Bab el-Mandeb Strait represents an unprecedented dual-chokepoint disruption. The Strait of Hormuz carries approximately 20% of global seaborne oil and 30% of global LNG — roughly 14 million barrels per day. Both are effectively closed.
          </p>
          <div className="flex gap-[10px] mb-3 flex-wrap">
            <EconChip label="Brent Crude"     val="$143/bbl" sub="+35% ↑" color="var(--danger)" />
            <EconChip label="WTI"             val="$138/bbl" sub="+33% ↑" color="var(--danger)" />
            <EconChip label="LNG Asia"        val="+29%"     sub="spot"    color="var(--warning)" />
            <EconChip label="Hormuz Transit"  val="ZERO"     sub="vessels" color="var(--danger)" />
          </div>
          <p className="leading-[1.8] text-[var(--t2)]">
            <strong className="text-[var(--warning)]">Economic risk threshold:</strong> If Hormuz closure exceeds 2 weeks, Bloomberg Economics estimates a global GDP shock of 0.8–1.4%. Oil at $180–200/bbl is analytically plausible under 3-week+ closure.
          </p>
        </BriefSection>

        <BriefSection number="5" title="OUTLOOK — THREE SCENARIOS">
          <div className="flex flex-col gap-[10px]">
            <ScenarioCard label="BEST CASE"  subtitle="Ceasefire within 72 hours"           color="var(--success)" prob="15%"
              body="Iran's transitional government signals willingness for back-channel ceasefire negotiations via Oman. US and Israel agree to pause strikes contingent on IRGC stand-down and nominal Hormuz reopening. Oil prices partially retrace to $110–120/bbl." />
            <ScenarioCard label="BASE CASE"  subtitle="5–7 day operation; limited ceasefire" color="var(--warning)" prob="55%"
              body="US and Israel complete nuclear and missile infrastructure destruction over 5–7 days. Iran's retaliatory capability is significantly degraded but Hormuz closure persists 10–14 days. Oil spikes to $155–165/bbl before beginning to retrace once Hormuz reopening is signaled." />
            <ScenarioCard label="WORST CASE" subtitle="Wider regional war — Hezbollah front opens" color="var(--danger)" prob="30%"
              body="Hezbollah opens a sustained northern front against Israel. Israel is forced to conduct a ground incursion into southern Lebanon. Hormuz closure extends beyond 3 weeks. Oil surpasses $180/bbl. Iran's nuclear program is destroyed but at the cost of a 6-month regional war." />
          </div>
        </BriefSection>

        <BriefSection number="6" title="SOURCES">
          <div className="flex flex-col gap-1">
            {SOURCES.map((src, i) => (
              <div key={i} className="flex items-center gap-[10px] px-[10px] py-[6px] border border-[var(--bd)]">
                <span
                  className="text-[8px] font-bold px-[5px] py-[1px] shrink-0"
                  style={{ background: TIER_C[src.tier] + '22', color: TIER_C[src.tier] }}
                >
                  T{src.tier}
                </span>
                <span className="text-[11px] font-semibold text-[var(--t1)] min-w-[180px]">{src.name}</span>
                <span className="text-[10px] text-[var(--t3)] flex-1">{src.note}</span>
              </div>
            ))}
          </div>
        </BriefSection>

        <div className="mt-10 pt-4 border-t border-[var(--bd)] text-center">
          <span className="label text-[8px] text-[var(--t4)]">
            UNCLASSIFIED // PHAROS ANALYTICAL // OPERATION EPIC FURY // {fmtDate(CONFLICT.startDate)}
          </span>
        </div>
      </div>
    </ScrollArea>
  );
}
