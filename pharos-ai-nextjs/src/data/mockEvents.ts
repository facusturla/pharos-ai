export type Severity = 'CRITICAL' | 'HIGH' | 'STANDARD';
export type EventType = 'MILITARY' | 'DIPLOMATIC' | 'POLITICAL' | 'HUMANITARIAN' | 'INTELLIGENCE' | 'CYBER';

export interface EventSource {
  name: string;
  url: string;
  tier: 1 | 2 | 3;
  reliability: number;
}

export interface ActorResponse {
  actorId: string;
  actorName: string;
  statement: string;
  stance: 'SUPPORTING' | 'OPPOSING' | 'NEUTRAL' | 'UNKNOWN';
  timestamp: string;
  type: 'OFFICIAL' | 'DIPLOMATIC' | 'MILITARY' | 'MEDIA';
}

export interface IntelEvent {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  timestamp: string;
  conflictId: string;
  severity: Severity;
  verified: boolean;
  type: EventType;
  location: string;
  sources: EventSource[];
  actorResponses: ActorResponse[];
  tags: string[];
}

export const EVENTS: IntelEvent[] = [
  {
    id: 'evt-001',
    title: 'IDF confirms targeted precision strikes in northern Gaza Strip',
    summary: 'Israeli Defense Forces have confirmed a series of precision airstrikes targeting Hamas military infrastructure in northern Gaza, citing imminent threat intelligence.',
    fullContent: `Israeli Defense Forces have confirmed a series of precision airstrikes on Hamas military infrastructure across northern Gaza Strip. The operation, described by IDF spokesperson as a "targeted counter-terrorism response," focused on weapons storage facilities and command positions near Beit Lahiya.

According to IDF statements, the strikes were preceded by advance warnings to civilian populations in the affected zones. However, Gaza health ministry officials report civilian casualties, with figures disputed by both sides.

US Secretary of State has urged both parties to exercise maximum restraint, while the EU has called for an immediate cessation of hostilities pending investigation into civilian impact.

Regional implications are significant: Egyptian and Qatari mediators have offered emergency ceasefire talks, Iran has issued a statement of solidarity with Gaza, and Hezbollah's military wing has raised its alert level in southern Lebanon.`,
    timestamp: '2026-03-01T15:58:00Z',
    conflictId: 'middle-east',
    severity: 'CRITICAL',
    verified: true,
    type: 'MILITARY',
    location: 'Northern Gaza Strip',
    sources: [
      { name: 'IDF Official Statement', url: 'https://idf.il', tier: 1, reliability: 98 },
      { name: 'Reuters', url: 'https://reuters.com', tier: 1, reliability: 95 },
      { name: 'Al Jazeera', url: 'https://aljazeera.com', tier: 2, reliability: 82 },
      { name: 'Times of Israel', url: 'https://timesofisrael.com', tier: 2, reliability: 79 },
    ],
    actorResponses: [
      { actorId: 'us', actorName: 'United States', statement: 'The United States urges all parties to exercise maximum restraint and take steps to protect civilian lives.', stance: 'NEUTRAL', timestamp: '2026-03-01T16:15:00Z', type: 'OFFICIAL' },
      { actorId: 'iran', actorName: 'Iran', statement: 'The Islamic Republic condemns the Zionist aggression and stands in full solidarity with the Palestinian resistance.', stance: 'OPPOSING', timestamp: '2026-03-01T16:30:00Z', type: 'OFFICIAL' },
      { actorId: 'eu', actorName: 'European Union', statement: 'The EU calls for an immediate halt to military operations and urges compliance with international humanitarian law.', stance: 'OPPOSING', timestamp: '2026-03-01T16:45:00Z', type: 'DIPLOMATIC' },
      { actorId: 'egypt', actorName: 'Egypt', statement: 'Egypt has activated emergency diplomatic channels and offers to facilitate immediate ceasefire negotiations.', stance: 'NEUTRAL', timestamp: '2026-03-01T17:00:00Z', type: 'DIPLOMATIC' },
    ],
    tags: ['Gaza', 'Airstrikes', 'IDF', 'Hamas', 'Civilians'],
  },
  {
    id: 'evt-002',
    title: 'EU foreign ministers convene emergency session on Middle East escalation',
    summary: 'European Union foreign ministers have scheduled an emergency session after intensified military activity in Gaza, with several member states calling for sanctions review.',
    fullContent: `The European Union Council has convened an extraordinary session of foreign ministers to address the rapidly deteriorating situation in the Middle East. The session, called at the request of France, Germany, and Belgium, will focus on the EU's unified response to escalating military operations in Gaza.

Key agenda items include reviewing the EU's current diplomatic engagement framework, potential humanitarian aid package expansion, and discussion of targeted measures against actors found to be in violation of international humanitarian law.

Several member states — notably Ireland, Spain, and Belgium — have called for a suspension of EU-Israel trade agreements pending independent investigation. Germany and France have pushed for a more measured approach, emphasizing continued diplomatic engagement.

The session is expected to produce a unified statement calling for a ceasefire, with specifics on enforcement mechanisms remaining contested.`,
    timestamp: '2026-03-01T15:45:00Z',
    conflictId: 'middle-east',
    severity: 'HIGH',
    verified: true,
    type: 'DIPLOMATIC',
    location: 'Brussels, Belgium',
    sources: [
      { name: 'EU Council Press Office', url: 'https://consilium.europa.eu', tier: 1, reliability: 97 },
      { name: 'Politico Europe', url: 'https://politico.eu', tier: 2, reliability: 88 },
      { name: 'France 24', url: 'https://france24.com', tier: 2, reliability: 84 },
    ],
    actorResponses: [
      { actorId: 'us', actorName: 'United States', statement: 'The United States welcomes EU diplomatic engagement and will coordinate closely with European partners.', stance: 'SUPPORTING', timestamp: '2026-03-01T16:00:00Z', type: 'OFFICIAL' },
      { actorId: 'idf', actorName: 'Israel', statement: 'Israel is a democracy exercising its right to self-defense in accordance with international law.', stance: 'OPPOSING', timestamp: '2026-03-01T16:10:00Z', type: 'OFFICIAL' },
    ],
    tags: ['EU', 'Diplomacy', 'Emergency Session', 'Sanctions'],
  },
  {
    id: 'evt-003',
    title: 'US State Department elevates travel warnings for Lebanon and Syria',
    summary: 'The US State Department has elevated travel warnings for Lebanon and Syria to Level 4 (Do Not Travel) citing increased risk of armed conflict and kidnapping.',
    fullContent: `The United States State Department has issued Level 4 "Do Not Travel" advisories for Lebanon and Syria, citing significantly elevated risk of armed conflict, terrorist activity, and civil unrest in the context of broader regional tensions.

US citizens currently in Lebanon have been urged to depart immediately via available commercial routes or contact the US Embassy in Beirut for assistance. The Embassy has also activated its emergency warden system.

The decision follows intelligence assessments indicating a heightened probability of Hezbollah military activity in southern Lebanon in response to Israeli operations in Gaza. Three previous warnings this week have been upgraded.

US military assets in the region — including the USS Gerald R. Ford carrier strike group — have been repositioned to the Eastern Mediterranean.`,
    timestamp: '2026-03-01T14:00:00Z',
    conflictId: 'middle-east',
    severity: 'STANDARD',
    verified: true,
    type: 'POLITICAL',
    location: 'Washington D.C. / Beirut',
    sources: [
      { name: 'US State Department', url: 'https://state.gov', tier: 1, reliability: 99 },
      { name: 'AP News', url: 'https://apnews.com', tier: 1, reliability: 94 },
    ],
    actorResponses: [],
    tags: ['Travel Warning', 'Lebanon', 'Syria', 'US Embassy'],
  },
  {
    id: 'evt-004',
    title: 'Russian forces report significant military buildup near Kharkiv',
    summary: 'Ukrainian intelligence confirms Russian 20th Combined Arms Army repositioning of approximately 15,000 troops toward Kharkiv oblast, with armored column movements detected.',
    fullContent: `Ukrainian military intelligence (HUR) has confirmed the repositioning of significant Russian military assets in proximity to Kharkiv oblast. Satellite imagery reviewed by Western defense analysts indicates armored column movements consistent with a forward staging operation.

The 20th Combined Arms Army, based in Voronezh, has reportedly moved elements of at least two armored brigades to positions within 40km of the Ukrainian border. Air defense systems, including S-400 units, have also been repositioned.

NATO officials have characterized the buildup as "deeply concerning" and have convened emergency consultations under Article 4. The alliance has placed its Very High Readiness Joint Task Force (VJTF) on elevated alert.

Ukrainian President Zelensky has stated the buildup represents "preparations for a major offensive" and has formally requested accelerated delivery of promised Western air defense systems.`,
    timestamp: '2026-03-01T13:00:00Z',
    conflictId: 'ukraine',
    severity: 'HIGH',
    verified: true,
    type: 'MILITARY',
    location: 'Kharkiv Oblast, Ukraine',
    sources: [
      { name: 'Ukrainian HUR', url: 'https://gur.gov.ua', tier: 1, reliability: 88 },
      { name: 'Reuters', url: 'https://reuters.com', tier: 1, reliability: 95 },
      { name: 'ISW (Institute for the Study of War)', url: 'https://understandingwar.org', tier: 2, reliability: 91 },
      { name: 'The Kyiv Independent', url: 'https://kyivindependent.com', tier: 2, reliability: 83 },
    ],
    actorResponses: [
      { actorId: 'nato', actorName: 'NATO', statement: 'NATO is closely monitoring the situation and has activated Article 4 consultations. The alliance stands ready to defend every inch of Allied territory.', stance: 'OPPOSING', timestamp: '2026-03-01T14:00:00Z', type: 'OFFICIAL' },
      { actorId: 'russia', actorName: 'Russia', statement: 'Russian military activities within sovereign Russian territory are routine and defensive in nature.', stance: 'NEUTRAL', timestamp: '2026-03-01T14:30:00Z', type: 'OFFICIAL' },
      { actorId: 'us', actorName: 'United States', statement: 'The United States takes this buildup extremely seriously and will consult with allies on appropriate response options.', stance: 'OPPOSING', timestamp: '2026-03-01T15:00:00Z', type: 'OFFICIAL' },
    ],
    tags: ['Kharkiv', 'Troop Buildup', 'Russia', 'NATO', 'Article 4'],
  },
  {
    id: 'evt-005',
    title: 'NATO activates Article 4 consultations following Russian buildup',
    summary: 'NATO has formally invoked Article 4 consultations at Poland\'s request, placing alliance forces on heightened alert following intelligence on Russian military repositioning.',
    fullContent: `NATO Secretary-General has confirmed the activation of Article 4 consultations following a formal request by Poland and the Baltic states. The consultations, held in Brussels, focused on Russian military movements near the Ukrainian border and their implications for alliance security.

Following the consultations, NATO has placed its Very High Readiness Joint Task Force (VJTF) on 24-hour standby. Additional NATO air policing missions over Baltic airspace have been authorized, and the alliance's eastern flank has been reinforced with pre-positioned equipment.

The US has indicated it will accelerate the deployment of additional Patriot missile defense batteries to Poland. Germany has announced it will extend its enhanced Forward Presence battalion group deployment in Lithuania.

This marks the sixth Article 4 consultation since Russia's full-scale invasion of Ukraine in 2022.`,
    timestamp: '2026-03-01T11:30:00Z',
    conflictId: 'nato-europe',
    severity: 'CRITICAL',
    verified: true,
    type: 'MILITARY',
    location: 'Brussels, Belgium',
    sources: [
      { name: 'NATO HQ Press', url: 'https://nato.int', tier: 1, reliability: 99 },
      { name: 'Reuters', url: 'https://reuters.com', tier: 1, reliability: 95 },
      { name: 'Defense News', url: 'https://defensenews.com', tier: 2, reliability: 87 },
    ],
    actorResponses: [
      { actorId: 'russia', actorName: 'Russia', statement: 'NATO\'s militaristic posture represents a provocation and confirms the alliance\'s aggressive expansionist agenda.', stance: 'OPPOSING', timestamp: '2026-03-01T12:00:00Z', type: 'OFFICIAL' },
      { actorId: 'us', actorName: 'United States', statement: 'The United States fully supports NATO Article 4 consultations and will reinforce alliance commitments.', stance: 'SUPPORTING', timestamp: '2026-03-01T12:30:00Z', type: 'OFFICIAL' },
    ],
    tags: ['NATO', 'Article 4', 'Poland', 'Baltic', 'VJTF'],
  },
  {
    id: 'evt-006',
    title: 'APT group targets European energy infrastructure in coordinated cyberattack',
    summary: 'A state-sponsored advanced persistent threat group has launched coordinated cyberattacks on energy grid operators in Germany, France, and the Netherlands.',
    fullContent: `Cybersecurity agencies across Germany (BSI), France (ANSSI), and the Netherlands (NCSC) have jointly issued an emergency advisory following a coordinated cyberattack on critical energy infrastructure. The attacks, attributed by Western intelligence to a known Russian APT group, targeted industrial control systems (ICS) at three major electricity grid operators.

The attacks employed a sophisticated combination of spear-phishing, zero-day exploits in SCADA systems, and ransomware deployment. While emergency protocols prevented widespread grid disruption, two substations in northern Germany experienced brief outages affecting approximately 40,000 customers.

EU Agency for Cybersecurity (ENISA) has convened emergency coordination calls. The incident represents the most significant cyberattack on European energy infrastructure since the 2022 attack on Ukrainian power grid operators.

Attribution assessment: High confidence Russian SVR (foreign intelligence) or GRU-affiliated unit, consistent with TTPs of previously identified SANDSTORM threat actor.`,
    timestamp: '2026-03-01T09:15:00Z',
    conflictId: 'cyber',
    severity: 'CRITICAL',
    verified: true,
    type: 'CYBER',
    location: 'Germany / France / Netherlands',
    sources: [
      { name: 'BSI (German Federal Cybersecurity)', url: 'https://bsi.bund.de', tier: 1, reliability: 97 },
      { name: 'ANSSI France', url: 'https://ssi.gouv.fr', tier: 1, reliability: 97 },
      { name: 'Mandiant Threat Intelligence', url: 'https://mandiant.com', tier: 2, reliability: 92 },
      { name: 'CyberScoop', url: 'https://cyberscoop.com', tier: 2, reliability: 81 },
    ],
    actorResponses: [
      { actorId: 'eu', actorName: 'European Union', statement: 'ENISA has activated its emergency coordination protocol. The EU considers attacks on critical infrastructure a matter of collective security.', stance: 'OPPOSING', timestamp: '2026-03-01T10:00:00Z', type: 'OFFICIAL' },
      { actorId: 'russia', actorName: 'Russia', statement: 'Russia categorically denies any involvement in cyberattacks against civilian infrastructure.', stance: 'NEUTRAL', timestamp: '2026-03-01T11:00:00Z', type: 'OFFICIAL' },
      { actorId: 'nato', actorName: 'NATO', statement: 'NATO Cooperative Cyber Defence Centre has been activated. A cyberattack on one member\'s critical infrastructure may constitute grounds for collective defense.', stance: 'OPPOSING', timestamp: '2026-03-01T11:30:00Z', type: 'OFFICIAL' },
    ],
    tags: ['Cyberattack', 'Energy Grid', 'Russia', 'APT', 'SCADA', 'Germany'],
  },
  {
    id: 'evt-007',
    title: 'Iran conducts ballistic missile test in Zagros region',
    summary: 'IRGC Aerospace Force test-fired three medium-range ballistic missiles in the Zagros mountain region, in what Iran describes as a "defensive capability demonstration".',
    fullContent: `The Islamic Revolutionary Guard Corps (IRGC) Aerospace Force conducted a test launch of three Shahab-3 variant medium-range ballistic missiles from a facility in the Zagros mountain range in western Iran. The missiles, with an estimated range of 1,300–2,000km, were described by Iranian state media as a "defensive capability demonstration."

US Space Command confirmed the launches via satellite tracking. Israeli Air Force raised its alert level immediately following the launches. The US 5th Fleet in Bahrain issued a readiness advisory.

Iranian Foreign Minister characterized the test as "routine and lawful," while Israeli Defense Minister called it "a direct provocation" and "an escalatory action in the current context."

The test coincides with heightened regional tensions following military operations in Gaza and comes six months after Iran's direct drone and missile attack on Israeli territory.`,
    timestamp: '2026-02-28T18:00:00Z',
    conflictId: 'middle-east',
    severity: 'HIGH',
    verified: true,
    type: 'MILITARY',
    location: 'Zagros Mountains, Iran',
    sources: [
      { name: 'US Space Command', url: 'https://spacecom.mil', tier: 1, reliability: 99 },
      { name: 'Reuters', url: 'https://reuters.com', tier: 1, reliability: 95 },
      { name: 'IRNA (Iranian State Media)', url: 'https://irna.ir', tier: 3, reliability: 45 },
      { name: 'Jane\'s Defence', url: 'https://janes.com', tier: 2, reliability: 93 },
    ],
    actorResponses: [
      { actorId: 'idf', actorName: 'Israel', statement: 'Israel views this missile test as a direct provocation and reserves the right to respond to any threat to its security.', stance: 'OPPOSING', timestamp: '2026-02-28T19:00:00Z', type: 'OFFICIAL' },
      { actorId: 'us', actorName: 'United States', statement: 'The United States condemns these missile tests which violate the spirit of UN Security Council Resolution 2231.', stance: 'OPPOSING', timestamp: '2026-02-28T19:30:00Z', type: 'OFFICIAL' },
    ],
    tags: ['Iran', 'Missile Test', 'IRGC', 'Ballistic', 'Shahab-3'],
  },
  {
    id: 'evt-008',
    title: 'PLA conducts aerial patrol along Taiwan Strait median line',
    summary: 'People\'s Liberation Army Air Force assets crossed the Taiwan Strait median line during a scheduled patrol, prompting Taiwan Air Defense Command scramble response.',
    fullContent: `People's Liberation Army Air Force (PLAAF) conducted a patrol crossing of the Taiwan Strait median line, with six J-16 and two Y-9 aircraft identified by Taiwan's Air Defense Command. The incursion lasted approximately 45 minutes before PLA assets returned to Chinese airspace.

Taiwan scrambled F-16V and Mirage 2000 fighter jets in response, activating air defense missile systems. No shots were fired and no hostile actions taken.

The Ministry of National Defense in Taipei described the action as "deliberate and provocative." China's Eastern Theater Command issued a statement characterizing the patrol as "lawful activities in China's airspace," rejecting the concept of a median line.

The US Indo-Pacific Command stated it was "closely monitoring" the situation. Japan's Air Self-Defense Force also tracked the activity. This marks the 12th such crossing in 2026.`,
    timestamp: '2026-03-01T06:30:00Z',
    conflictId: 'china-taiwan',
    severity: 'HIGH',
    verified: true,
    type: 'MILITARY',
    location: 'Taiwan Strait',
    sources: [
      { name: 'Taiwan MND', url: 'https://mnd.gov.tw', tier: 1, reliability: 92 },
      { name: 'Reuters', url: 'https://reuters.com', tier: 1, reliability: 95 },
      { name: 'The Diplomat', url: 'https://thediplomat.com', tier: 2, reliability: 87 },
    ],
    actorResponses: [
      { actorId: 'us', actorName: 'United States', statement: 'INDOPACOM is closely monitoring PLA activity in the Taiwan Strait. The US commitment to Taiwan\'s self-defense is ironclad.', stance: 'OPPOSING', timestamp: '2026-03-01T07:00:00Z', type: 'OFFICIAL' },
      { actorId: 'japan', actorName: 'Japan', statement: 'Japan closely monitored the PLA patrol and is coordinating with allied partners. Any unilateral change to the status quo is unacceptable.', stance: 'OPPOSING', timestamp: '2026-03-01T07:30:00Z', type: 'OFFICIAL' },
    ],
    tags: ['Taiwan', 'PLA', 'Median Line', 'PLAAF', 'Air Defense'],
  },
  {
    id: 'evt-009',
    title: 'Israeli water treatment facility cyberattack confirmed — CERT-IL',
    summary: 'Israeli National Cyber Directorate confirms a successful cyberattack on a water treatment facility in the Negev region, attributed to an Iran-linked threat actor.',
    fullContent: `Israel's National Cyber Directorate (INCD) has confirmed a successful cyberattack against the Be\'er Sheva water treatment facility, operated by Mekorot, Israel's national water utility. The attacker, attributed with high confidence to an Iran-linked advanced persistent threat group (tentatively PHOSPHORUS/APT35), attempted to alter chlorine dosing levels in the water treatment process.

Automated safety systems detected the anomalous commands before any actual change to water quality was achieved. Emergency manual protocols were activated and all affected systems have been isolated.

INCD characterized the attack as "a deliberate attempt to cause mass civilian harm" and stated it represents "an act of cyber warfare against critical civilian infrastructure." Law enforcement and military intelligence are coordinating the response.

This is the third confirmed cyberattack on Israeli water infrastructure in the past 18 months.`,
    timestamp: '2026-02-28T14:00:00Z',
    conflictId: 'cyber',
    severity: 'HIGH',
    verified: true,
    type: 'CYBER',
    location: 'Be\'er Sheva, Israel',
    sources: [
      { name: 'Israeli INCD (National Cyber Directorate)', url: 'https://gov.il', tier: 1, reliability: 97 },
      { name: 'Haaretz', url: 'https://haaretz.com', tier: 2, reliability: 85 },
      { name: 'ClearSky Cyber Security', url: 'https://clearskysec.com', tier: 2, reliability: 90 },
    ],
    actorResponses: [
      { actorId: 'iran', actorName: 'Iran', statement: 'Iran denies any involvement in cyberattacks on civilian infrastructure.', stance: 'NEUTRAL', timestamp: '2026-02-28T15:30:00Z', type: 'OFFICIAL' },
    ],
    tags: ['Israel', 'Cyberattack', 'Water Infrastructure', 'Iran', 'PHOSPHORUS'],
  },
  {
    id: 'evt-010',
    title: 'Zelensky formally requests accelerated F-16 delivery from Netherlands',
    summary: 'Ukrainian President Zelensky has formally submitted an accelerated delivery request to Dutch counterpart following confirmed Russian buildup near Kharkiv.',
    fullContent: `Ukrainian President Volodymyr Zelensky has formally requested the Netherlands to accelerate the delivery timeline of the pledged F-16 Fighting Falcon aircraft. The request, submitted via diplomatic channels, cites the confirmed Russian military buildup near Kharkiv as justification for urgent air power reinforcement.

The Netherlands has pledged 24 F-16s to Ukraine. The current delivery schedule has 12 delivered, with remaining aircraft in training and maintenance preparation phases. Zelensky's request asks for the remaining 12 to be delivered within six weeks rather than the originally planned four months.

Dutch Defence Minister indicated willingness to explore accelerated options but noted logistical and training constraints. Belgium, which has pledged 30 F-16s for future delivery, is also being consulted.

The US has authorized the transfer of F-16s to Ukraine by NATO allies and is facilitating expedited maintenance support.`,
    timestamp: '2026-03-01T10:00:00Z',
    conflictId: 'ukraine',
    severity: 'STANDARD',
    verified: true,
    type: 'DIPLOMATIC',
    location: 'Kyiv / The Hague',
    sources: [
      { name: 'Office of the President of Ukraine', url: 'https://president.gov.ua', tier: 1, reliability: 88 },
      { name: 'Reuters', url: 'https://reuters.com', tier: 1, reliability: 95 },
      { name: 'Defense News', url: 'https://defensenews.com', tier: 2, reliability: 87 },
    ],
    actorResponses: [
      { actorId: 'nato', actorName: 'Netherlands / NATO', statement: 'The Netherlands is reviewing the accelerated delivery request. All support to Ukraine remains a top priority.', stance: 'SUPPORTING', timestamp: '2026-03-01T11:00:00Z', type: 'OFFICIAL' },
      { actorId: 'russia', actorName: 'Russia', statement: 'The supply of F-16 aircraft to Ukraine constitutes direct NATO involvement in the conflict and will be met with appropriate response.', stance: 'OPPOSING', timestamp: '2026-03-01T11:30:00Z', type: 'OFFICIAL' },
    ],
    tags: ['Ukraine', 'F-16', 'Netherlands', 'Military Aid', 'Air Power'],
  },
];

export const SEV_STYLE: Record<Severity, { color: string; bg: string; border: string }> = {
  CRITICAL: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  HIGH:     { color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
  STANDARD: { color: '#64748b', bg: '#f8fafc', border: '#cbd5e1' },
};

export const TYPE_LABEL: Record<EventType, string> = {
  MILITARY:     'MILITARY',
  DIPLOMATIC:   'DIPLOMATIC',
  POLITICAL:    'POLITICAL',
  HUMANITARIAN: 'HUMANITARIAN',
  INTELLIGENCE: 'INTELLIGENCE',
  CYBER:        'CYBER',
};
