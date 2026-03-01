export type ActorType = 'STATE' | 'NON-STATE' | 'ORGANIZATION' | 'INDIVIDUAL';
export type ActivityLevel = 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
export type Stance = 'AGGRESSIVE' | 'OPPOSING' | 'NEUTRAL' | 'SUPPORTING' | 'DEFENSIVE';
export type ActionType = 'MILITARY' | 'DIPLOMATIC' | 'POLITICAL' | 'ECONOMIC' | 'CYBER' | 'INTELLIGENCE';

export interface ActorAction {
  date: string;
  description: string;
  type: ActionType;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceCount: number;
  verified: boolean;
}

export interface Actor {
  id: string;
  name: string;
  fullName: string;
  type: ActorType;
  flag?: string;
  conflictIds: string[];
  activityLevel: ActivityLevel;
  activityScore: number; // 0–100
  stance: Stance;
  saying: string;
  doing: string[];
  recentActions: ActorAction[];
  keyFigures: string[];
  assessment: string;
}

export const ACTORS: Actor[] = [
  {
    id: 'idf',
    name: 'Israel',
    fullName: 'State of Israel / IDF',
    type: 'STATE',
    flag: '🇮🇱',
    conflictIds: ['middle-east', 'cyber'],
    activityLevel: 'HIGH',
    activityScore: 85,
    stance: 'AGGRESSIVE',
    saying: '"Israel is exercising its inherent right to self-defense against terrorist organizations. Our operations are precise, targeted, and fully compliant with international law."',
    doing: [
      'Conducting airstrikes on Gaza military infrastructure',
      'Ground forces positioned at northern and southern Gaza border',
      'Naval blockade of Gaza coastline maintained',
      'Iron Dome batteries repositioned to northern border',
      'Cyber operations unit on elevated alert',
    ],
    recentActions: [
      { date: '2026-03-01', description: 'Precision airstrikes on Hamas command positions in N. Gaza', type: 'MILITARY', significance: 'HIGH', sourceCount: 4, verified: true },
      { date: '2026-02-28', description: 'IDF announces expanded operational zone in southern Gaza', type: 'MILITARY', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-02-27', description: 'Emergency cabinet convened on security situation', type: 'POLITICAL', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-26', description: 'Air Force conducts reconnaissance over southern Lebanon', type: 'MILITARY', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-25', description: 'Cyber Command confirms successful disruption of Hamas comms', type: 'CYBER', significance: 'HIGH', sourceCount: 1, verified: false },
    ],
    keyFigures: ['Prime Minister', 'Defense Minister', 'IDF Chief of Staff'],
    assessment: 'Israel remains in active military operation mode with high operational tempo across all domains. Escalation risk from northern front (Hezbollah) remains the primary wildcard. Political consensus on current military objectives appears solid domestically.',
  },
  {
    id: 'iran',
    name: 'Iran',
    fullName: 'Islamic Republic of Iran',
    type: 'STATE',
    flag: '🇮🇷',
    conflictIds: ['middle-east', 'cyber'],
    activityLevel: 'HIGH',
    activityScore: 72,
    stance: 'OPPOSING',
    saying: '"The Islamic Republic stands in full solidarity with the Palestinian people and the resistance. Our response to any direct threat to Iranian territory or proxies will be swift and decisive. We do not seek war but are fully prepared."',
    doing: [
      'Air defense units repositioned to northwestern Iran',
      'IRGC Navy conducted exercises in Persian Gulf and Strait of Hormuz',
      'Ballistic missile test conducted in Zagros region (Feb 28)',
      'Diplomatic envoys dispatched to Syria, Iraq, and Qatar',
      'Cyber operations against Israeli and Western targets intensified',
    ],
    recentActions: [
      { date: '2026-02-28', description: 'Test-fired 3x Shahab-3 MRBMs in Zagros mountain range', type: 'MILITARY', significance: 'HIGH', sourceCount: 4, verified: true },
      { date: '2026-02-27', description: 'IRGC Navy conducted strait closure exercises', type: 'MILITARY', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-02-26', description: 'Foreign Minister met with Syrian and Iraqi counterparts in Tehran', type: 'DIPLOMATIC', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-25', description: 'Cyberattack on Israeli water utility attributed to PHOSPHORUS group', type: 'CYBER', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-02-24', description: 'Supreme Leader signals support for "axis of resistance" escalation', type: 'POLITICAL', significance: 'HIGH', sourceCount: 3, verified: true },
    ],
    keyFigures: ['Supreme Leader Khamenei', 'President Raisi', 'IRGC Commander'],
    assessment: 'Iran is operating in a high-tension posture — conducting provocative military demonstrations while maintaining deniability through proxy networks. Direct Iranian military action against Israel remains possible but is constrained by awareness of US escalation thresholds. Cyber and proxy operations are the preferred vector.',
  },
  {
    id: 'hamas',
    name: 'Hamas',
    fullName: 'Hamas / Al-Qassam Brigades',
    type: 'NON-STATE',
    flag: '🇵🇸',
    conflictIds: ['middle-east'],
    activityLevel: 'HIGH',
    activityScore: 68,
    stance: 'AGGRESSIVE',
    saying: '"The resistance will continue until the occupation ends. We will respond to every massacre with escalation. The Palestinian people have no choice but to resist."',
    doing: [
      'Rocket and mortar fire from Gaza into southern Israel',
      'Anti-tank guided missile attacks on IDF vehicles',
      'Tunnel network operations for troop movement',
      'Information warfare operations targeting international media',
    ],
    recentActions: [
      { date: '2026-03-01', description: 'Fired 47 rockets toward Ashkelon and Sderot; 38 intercepted', type: 'MILITARY', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-02-28', description: 'ATGM strike on IDF armored vehicle near Rafah junction', type: 'MILITARY', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-27', description: 'Military spokesperson issued video statement on tunnel operations', type: 'POLITICAL', significance: 'LOW', sourceCount: 2, verified: true },
    ],
    keyFigures: ['Politburo Leadership', 'Al-Qassam Brigades Commander'],
    assessment: 'Hamas military wing maintains operational capacity despite sustained Israeli airstrikes. Rocket production and tunnel logistics appear partially functional. Leadership remains dispersed across Gaza and Qatar. Ceasefire negotiations are ongoing but no agreement imminent.',
  },
  {
    id: 'hezbollah',
    name: 'Hezbollah',
    fullName: 'Hezbollah / Islamic Resistance',
    type: 'NON-STATE',
    flag: '🇱🇧',
    conflictIds: ['middle-east'],
    activityLevel: 'ELEVATED',
    activityScore: 58,
    stance: 'OPPOSING',
    saying: '"The Islamic Resistance is monitoring the situation with the highest alert. Any escalation in Gaza will be met with a response from all fronts simultaneously."',
    doing: [
      'Daily drone and anti-tank fire exchanges on northern Israel border',
      'Forward positions elevated to combat readiness',
      'Long-range missile units placed on standby',
      'Coordination meetings with IRGC leadership in Beirut and Tehran',
    ],
    recentActions: [
      { date: '2026-03-01', description: 'Anti-tank fire on IDF positions in Metula (northern Israel)', type: 'MILITARY', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-28', description: 'Drone surveillance over northern Israeli communities intercepted', type: 'INTELLIGENCE', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-27', description: 'Secretary-General issued threat statement regarding Gaza operations', type: 'POLITICAL', significance: 'HIGH', sourceCount: 3, verified: true },
    ],
    keyFigures: ['Secretary-General', 'Military Commander'],
    assessment: 'Hezbollah is exercising strategic restraint while signaling maximum capability. The organization is likely calculating that full escalation carries unacceptable risk to its Lebanese power base. Daily low-level engagements serve as signaling without triggering all-out war.',
  },
  {
    id: 'us',
    name: 'United States',
    fullName: 'United States of America',
    type: 'STATE',
    flag: '🇺🇸',
    conflictIds: ['middle-east', 'ukraine', 'china-taiwan', 'nato-europe', 'cyber'],
    activityLevel: 'HIGH',
    activityScore: 79,
    stance: 'SUPPORTING',
    saying: '"The United States is committed to Israel\'s security while calling for the protection of civilian lives. We are actively engaged diplomatically to prevent regional escalation. Our support for Ukraine is unwavering."',
    doing: [
      'USS Gerald R. Ford CSG repositioned to Eastern Mediterranean',
      '2nd carrier strike group placed on 96-hour standby',
      'Additional Patriot batteries deployed to Poland',
      'Accelerating weapons transfers to Israel and Ukraine',
      'CISA issued elevated cyber alert for US critical infrastructure',
    ],
    recentActions: [
      { date: '2026-03-01', description: 'USS Gerald R. Ford repositioned from Red Sea to Eastern Med', type: 'MILITARY', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-03-01', description: 'State Dept. Level 4 travel advisory issued for Lebanon and Syria', type: 'POLITICAL', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-28', description: 'Secretary of State held emergency calls with EU, Israeli, Egyptian counterparts', type: 'DIPLOMATIC', significance: 'HIGH', sourceCount: 2, verified: true },
      { date: '2026-02-27', description: 'Emergency weapons transfer to Israel approved — $500M package', type: 'MILITARY', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-02-26', description: 'Additional Patriot missile battery deployed to Poland (NATO commitment)', type: 'MILITARY', significance: 'MEDIUM', sourceCount: 2, verified: true },
    ],
    keyFigures: ['President', 'Secretary of State', 'Secretary of Defense', 'NSA Director'],
    assessment: 'The US is managing a complex multi-front posture: supporting Israel militarily and diplomatically while attempting to prevent regional spillover; reinforcing NATO\'s eastern flank; maintaining Taiwan deterrence. Resource and political attention is stretched across all theatres simultaneously.',
  },
  {
    id: 'russia',
    name: 'Russia',
    fullName: 'Russian Federation',
    type: 'STATE',
    flag: '🇷🇺',
    conflictIds: ['ukraine', 'nato-europe', 'cyber'],
    activityLevel: 'HIGH',
    activityScore: 77,
    stance: 'AGGRESSIVE',
    saying: '"Russia is conducting a special military operation to protect Russian-speaking populations and denazify Ukraine. NATO\'s aggressive expansion is the root cause of instability in Europe."',
    doing: [
      '15,000+ troops repositioned near Kharkiv oblast',
      'S-400 air defense systems moved forward toward Ukrainian border',
      'Intensified glide bomb strikes on Ukrainian energy infrastructure',
      'State-sponsored cyberattacks on European energy grids',
      'Information warfare operations targeting Western public opinion',
    ],
    recentActions: [
      { date: '2026-03-01', description: '15,000 troops of 20th CAA repositioned near Kharkiv', type: 'MILITARY', significance: 'HIGH', sourceCount: 4, verified: true },
      { date: '2026-02-28', description: 'Coordinated cyberattack on European energy infrastructure (APT)', type: 'CYBER', significance: 'HIGH', sourceCount: 4, verified: true },
      { date: '2026-02-27', description: 'Glide bomb strikes on Ukrainian power generation — Kharkiv city', type: 'MILITARY', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-02-26', description: 'Foreign Minister held talks with Iranian counterpart in Moscow', type: 'DIPLOMATIC', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-25', description: 'Wagner Group remnants reportedly deployed to support Belarusian operations', type: 'MILITARY', significance: 'MEDIUM', sourceCount: 1, verified: false },
    ],
    keyFigures: ['President Putin', 'Defense Minister', 'Chief of General Staff'],
    assessment: 'Russia is entering a new phase of offensive posturing, using the Middle East crisis as a strategic distraction window. The Kharkiv buildup is the most significant conventional military escalation since early 2024. Cyber operations against European targets are intensifying as a cost-imposition strategy.',
  },
  {
    id: 'nato',
    name: 'NATO',
    fullName: 'North Atlantic Treaty Organization',
    type: 'ORGANIZATION',
    flag: '🏳️',
    conflictIds: ['ukraine', 'nato-europe'],
    activityLevel: 'ELEVATED',
    activityScore: 62,
    stance: 'DEFENSIVE',
    saying: '"NATO stands ready to defend every inch of Allied territory. The alliance is united in its support for Ukraine and vigilant against any threat to Allied security. Article 5 remains absolute."',
    doing: [
      'Article 4 consultations activated following Russian buildup',
      'VJTF placed on 24-hour standby',
      'Additional air policing missions over Baltic airspace authorized',
      'Pre-positioned equipment stocks in eastern Europe replenished',
      'Emergency cybersecurity coordination with member states',
    ],
    recentActions: [
      { date: '2026-03-01', description: 'Article 4 consultations activated at Poland\'s request', type: 'POLITICAL', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-03-01', description: 'VJTF placed on 24-hour readiness standby', type: 'MILITARY', significance: 'HIGH', sourceCount: 2, verified: true },
      { date: '2026-02-28', description: 'Cyber Defence Centre (CCDCOE) emergency coordination activated', type: 'CYBER', significance: 'HIGH', sourceCount: 2, verified: true },
      { date: '2026-02-27', description: 'Secretary-General issued statement on Russian military posture', type: 'POLITICAL', significance: 'MEDIUM', sourceCount: 2, verified: true },
    ],
    keyFigures: ['Secretary-General', 'Supreme Allied Commander Europe (SACEUR)'],
    assessment: 'NATO is responding with calibrated resolve — activating deterrence measures without crossing into escalatory actions. Internal cohesion remains strong on Ukraine support, with Article 5 commitments universally reaffirmed. The key test will be if Russia initiates direct action against a member state.',
  },
  {
    id: 'china',
    name: 'China',
    fullName: 'People\'s Republic of China / PLA',
    type: 'STATE',
    flag: '🇨🇳',
    conflictIds: ['china-taiwan', 'cyber'],
    activityLevel: 'MODERATE',
    activityScore: 44,
    stance: 'OPPOSING',
    saying: '"China\'s military activities in the Taiwan Strait are routine exercises within China\'s sovereign territory. Taiwan is an inalienable part of China. Foreign interference will not be tolerated."',
    doing: [
      'Regular PLAAF median line crossings in Taiwan Strait',
      'PLA Navy exercises in South China Sea and Philippine Sea',
      'Diplomatic pressure on Taiwan\'s international partners',
      'Economic coercion targeting Taiwan trade relationships',
    ],
    recentActions: [
      { date: '2026-03-01', description: 'PLAAF assets crossed Taiwan Strait median line — 6x J-16, 2x Y-9', type: 'MILITARY', significance: 'HIGH', sourceCount: 3, verified: true },
      { date: '2026-02-28', description: 'PLA Navy carrier group transit through Bashi Channel', type: 'MILITARY', significance: 'MEDIUM', sourceCount: 2, verified: true },
      { date: '2026-02-27', description: 'China warned Philippines against "provocative actions" in South China Sea', type: 'DIPLOMATIC', significance: 'MEDIUM', sourceCount: 2, verified: true },
    ],
    keyFigures: ['President Xi Jinping', 'CMC Chairman', 'Eastern Theater Commander'],
    assessment: 'China is maintaining measured pressure on Taiwan without triggering a full crisis — opportunistically monitoring Western attention stretched by the Middle East situation. Any significant reduction in US Pacific posture would likely see increased PLA activity.',
  },
];

export const ACTIVITY_STYLE: Record<ActivityLevel, { color: string; bg: string }> = {
  HIGH:     { color: '#dc2626', bg: '#fef2f2' },
  ELEVATED: { color: '#ea580c', bg: '#fff7ed' },
  MODERATE: { color: '#d97706', bg: '#fffbeb' },
  LOW:      { color: '#64748b', bg: '#f8fafc' },
};

export const STANCE_STYLE: Record<Stance, { color: string; bg: string }> = {
  AGGRESSIVE: { color: '#dc2626', bg: '#fef2f2' },
  OPPOSING:   { color: '#ea580c', bg: '#fff7ed' },
  NEUTRAL:    { color: '#64748b', bg: '#f8fafc' },
  SUPPORTING: { color: '#16a34a', bg: '#f0fdf4' },
  DEFENSIVE:  { color: '#2563eb', bg: '#eff6ff' },
};
