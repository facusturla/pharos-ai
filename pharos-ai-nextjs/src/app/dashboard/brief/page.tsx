'use client';
import { fmtDate } from '@/lib/format';
import { CONFLICT } from '@/data/iranConflict';
import { ACTORS }   from '@/data/iranActors';
import { EVENTS }   from '@/data/iranEvents';
import { ScrollArea } from '@/components/ui/scroll-area';
import Flag from '@/components/shared/Flag';
import { BriefSection, EconChip, ScenarioCard } from '@/components/brief/BriefSection';

const SOURCES = [
  { name: 'Reuters',                     tier: 1, note: 'Primary wire coverage — Tel Aviv, Tehran, Washington, Muscat' },
  { name: 'New York Times',              tier: 1, note: 'Investigative sourcing + senior Pentagon readouts' },
  { name: 'Associated Press',            tier: 1, note: 'Casualty figures, diplomatic wires, Pakistan protests' },
  { name: 'CENTCOM official statements', tier: 1, note: 'US KIA, strike footage, fact-checks, friendly fire disclosure' },
  { name: 'IDF Spokesperson',            tier: 1, note: 'Strike confirmations, target lists, Northern Front operations' },
  { name: 'NBC News / Richard Engel',    tier: 1, note: 'On-ground reporting, verified footage, Trump interviews' },
  { name: 'The Guardian',                tier: 1, note: 'Live blog, RAF Akrotiri, IAEA, UK govt statements' },
  { name: 'IAEA Director General',       tier: 1, note: 'Nuclear facility safeguards, radiation monitoring, reactor warnings' },
  { name: 'Bloomberg / Javier Blas',     tier: 1, note: 'Energy markets, Ras Tanura shutdown, OPEC+ analysis' },
  { name: 'Al Jazeera',                  tier: 1, note: 'Gulf civilian damage, Iran leadership council, Larijani rejection' },
  { name: 'UK gov.uk / MoD',            tier: 1, note: 'E3 joint statement, RAF Akrotiri response, base authorization' },
  { name: 'IRNA / PressTV (Iran state)', tier: 2, note: 'Iranian claims — treat as propaganda unless corroborated by tier 1' },
  { name: 'Times of Israel',             tier: 2, note: 'Israeli domestic coverage, Beit Shemesh details, northern sirens' },
  { name: 'Kpler / MarineTraffic',       tier: 2, note: 'Strait of Hormuz vessel tracking, tanker strikes' },
  { name: 'Cirium (aviation)',            tier: 2, note: 'Flight cancellation tracking — 6,000+ across 3 days' },
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
            <span className="mono text-[10px] text-[var(--t3)]">DATE: 2026-03-02</span>
            <span className="mono text-[10px] text-[var(--t3)]">AS OF: 12:00 UTC</span>
            <span className="mono text-[10px] text-[var(--t3)]">DAY 3 OF OPERATIONS</span>
          </div>
        </div>

        <BriefSection number="1" title="EXECUTIVE SUMMARY">
          <p className="leading-[1.8] text-[var(--t1)] mb-3">{CONFLICT.summary}</p>
          <p className="leading-[1.8] text-[var(--t2)] mb-3">
            As of 12:00 UTC on March 2, 2026 — Day 3 of operations — the conflict has expanded dramatically. Hezbollah has entered the war, firing rockets and drones at Israel from Lebanon. The IDF has launched an offensive campaign against Hezbollah across southern Lebanon, the Bekaa Valley, and Beirut&apos;s Dahieh suburb. An Iranian drone struck RAF Akrotiri in Cyprus — the first direct attack on European NATO territory. Iran&apos;s death toll has risen to 555 across 131 cities. Ali Larijani has publicly rejected negotiations with the United States.
          </p>
          <p className="leading-[1.8] text-[var(--t2)]">
            The economic dimension continues to escalate. Saudi Aramco shut its Ras Tanura refinery (550K bbl/day) after a drone strike. Combined with the Hormuz closure and Houthi Red Sea attacks, this represents the most severe energy supply disruption since 1973. Brent crude has surged ~14% to ~$79/barrel. OPEC+ announced a modest 206K bbl/day increase — a fraction of the disruption. More than 6,000 flights have been cancelled across 3 days.
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
            <EconChip label="Brent Crude"     val="~$79/bbl"  sub="+14% ↑" color="var(--danger)" />
            <EconChip label="WTI"             val="~$73/bbl"  sub="+12% ↑" color="var(--danger)" />
            <EconChip label="Ras Tanura"      val="OFFLINE"   sub="550K bbl/day" color="var(--danger)" />
            <EconChip label="Hormuz Transit"  val="ZERO"      sub="vessels" color="var(--danger)" />
            <EconChip label="Flights"         val="6,000+"    sub="cancelled"  color="var(--warning)" />
          </div>
          <p className="leading-[1.8] text-[var(--t2)]">
            <strong className="text-[var(--warning)]">Economic risk threshold:</strong> OPEC+ has offered only 206K bbl/day increase — a fraction of the ~14M bbl/day that transits Hormuz daily. If Hormuz closure persists beyond 3 weeks, Bloomberg Economics estimates a global GDP shock of 0.8–1.4%. Trump has said the operation could take &quot;four weeks or less.&quot;
          </p>
        </BriefSection>

        <BriefSection number="5" title="OUTLOOK — THREE SCENARIOS">
          <div className="flex flex-col gap-[10px]">
            <ScenarioCard label="BEST CASE"  subtitle="Ceasefire within 2 weeks; Hezbollah stands down"  color="var(--success)" prob="10%"
              body="Iran's transitional government negotiates through Oman backchannel. Hezbollah agrees to ceasefire following IDF offensive. Hormuz reopens within 2 weeks. Oil retraces to ~$70–75/bbl. Requires Larijani faction to be overruled by Pezeshkian. Currently unlikely given Larijani's public rejection of talks." />
            <ScenarioCard label="BASE CASE"  subtitle="4-week air campaign; limited ground operations"   color="var(--warning)" prob="50%"
              body="Trump's '4 weeks or less' timeline plays out. US/Israel complete systematic destruction of nuclear, missile, naval, and command infrastructure. Hezbollah front remains at threshold level (rockets, not precision missiles). Hormuz closure persists 3–4 weeks. Oil stays elevated at $80–100/bbl. No ground invasion of Iran." />
            <ScenarioCard label="WORST CASE" subtitle="Full regional war — ground invasions, NATO drawn in" color="var(--danger)" prob="40%"
              body="NOW PARTIALLY REALIZED: Hezbollah has opened a northern front. IDF chief says 'all options on the table' including ground invasion of Lebanon. RAF Akrotiri struck — NATO territory under attack. If Hezbollah deploys its ~2,000 long-range precision missiles, Israeli air defenses would be overwhelmed. Ground incursion into Lebanon becomes necessary. Iran's 4M-volunteer mobilization suggests protracted resistance. Oil could spike above $120/bbl. Conflict extends months, not weeks." />
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
