import type { ThreatLevel, ConflictStatus } from '@/types/domain';
export type { ThreatLevel, ConflictStatus };

export const CONFLICT = {
  id:            'iran-2026',
  name:          'US–Israel Strikes on Iran',
  codename:      { us: 'Operation Epic Fury', il: 'Operation Roaring Lion' },
  status:        'ONGOING' as const,
  threatLevel:   'CRITICAL' as const,
  startDate:     '2026-02-28T04:30:00Z',  // first strikes, Tehran
  region:        'Iran / Persian Gulf / Middle East',
  escalation:    94,

  summary: `On February 28, 2026, the United States and Israel launched a coordinated joint strike on Iran — the most ambitious Western military operation against the Islamic Republic since its founding. Codenamed Operation Epic Fury by the Pentagon and Operation Roaring Lion by the IDF, the campaign targeted Iranian nuclear facilities, ballistic missile infrastructure, air defense networks, and regime leadership. Supreme Leader Ali Khamenei was killed when his compound in Tehran was struck. 48 Iranian leaders have been killed. Iran responded with Operation True Promise 4 — at least 9 waves of retaliatory strikes against US bases in 6 Gulf nations and Israeli civilian areas, killing 3 US service members in Kuwait and 10 Israeli civilians. On Day 3, Hezbollah entered the war from Lebanon, an Iranian drone struck RAF Akrotiri in Cyprus (first attack on NATO territory), and Saudi Aramco shut its Ras Tanura refinery. Iran's death toll stands at 555 across 131 cities. Trump says the operation could take "four weeks or less." Operations are ongoing.`,

  keyFacts: [
    'Khamenei confirmed killed — IRNA state media confirmation 14:30 UTC Feb 28',
    'B-2 Spirit bombers struck fortified nuclear and missile sites from Diego Garcia',
    'Strait of Hormuz closure — 200+ vessels anchored, half-dozen shipping companies halted',
    'IRGC launched Operation True Promise 4 — at least 9 waves targeting 27+ US/Israeli sites',
    'Iran struck US bases in 6 Gulf nations: Al Udeid (Qatar), Ali Al Salem (Kuwait), Al Dhafra (UAE), NSA Bahrain, Prince Sultan AB (Saudi), Erbil (Iraq)',
    '3 US service members KIA in Kuwait (Army sustainment unit), 5 seriously wounded',
    '10 killed in Israel — 9 in Beit Shemesh synagogue strike, 1 elsewhere; 40+ injured',
    '9 Iranian warships destroyed and sunk — naval HQ "largely destroyed" (Trump/CENTCOM)',
    '48 Iranian leaders killed (per Trump); IDF struck "dozens" of IRGC command centers in Tehran',
    'Iran hit civilian targets across Gulf — Dubai Fairmont, Bahrain Crowne Plaza, airports, AWS data center',
    '1,500+ flights cancelled; Dubai, Kuwait, Bahrain, Erbil airports suspended',
    'Oil: Brent +14% (~$78), WTI +12% (~$72); OPEC+ increase: 206K bbl/day',
    'Iran forms interim leadership council: Pezeshkian, Mohseni-Ejei, Arafi',
    'Starmer/Macron/Merz joint statement: "Iran pursuing scorched earth strategy"',
    'Houthis resumed Red Sea attacks; first rockets from Lebanon (late March 1)',
    'Day 3: Hezbollah enters war — IDF launches offensive, 31 killed in Lebanon',
    'Day 3: Iranian drone strikes RAF Akrotiri (UK Cyprus) — first strike on NATO territory',
    'Day 3: Saudi Ras Tanura refinery (550K bbl/day) shut after drone strike',
    'Day 3: Several US warplanes crashed in Kuwait — all crew survived',
    'Day 3: Larijani rejects negotiations — "We will not negotiate with the US"',
    'Day 3: Iran death toll rises to 555 across 131 cities (Red Crescent)',
    'Day 3: IAEA Grossi warns mass evacuations may be necessary if reactors hit',
    'Day 3: Trump tells Daily Mail operation could take "four weeks or less"',
  ],

  objectives: {
    us:  'Destroy Iranian nuclear & missile capability, prevent nuclear breakout, topple regime',
    il:  'Remove existential threats — nuclear/missile programs, eliminate Axis of Resistance leadership',
  },

  commanders: {
    us: ['President Donald Trump', 'SecDef Pete Hegseth', 'CENTCOM CG Dan Caine', 'Adm. Brad Cooper'],
    il: ['PM Benjamin Netanyahu', 'DefMin Israel Katz', 'IDF Chief Eyal Zamir', 'IAF Chief Tomer Bar'],
    ir: ['President Masoud Pezeshkian (interim council)', 'Chief Justice Mohseni-Ejei (interim council)', 'Ayatollah Arafi (interim council)', 'FM Abbas Araghchi'],
  },

  casualties: {
    us:       { kia: 3,   wounded: 5,    civilians: 0 },
    israel:   { kia: 0,   wounded: 0,    civilians: 10, injured: 40 },  // 9 in Beit Shemesh, 1 elsewhere
    iran:     { killed: 555, injured: 'unknown' },  // IRCS figures as of Day 3; 165 students at Minab school; 131 cities affected
    regional: 'UAE 2 killed, multiple injured; Kuwait 3 US KIA; Bahrain/Qatar civilian impacts',
  },
};

