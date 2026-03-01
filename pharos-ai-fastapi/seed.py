"""
Seed the Pharos database with realistic fake data.
Run inside the web container: docker compose exec web python seed.py
"""
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.models.models import (
    Topic, Region, RSSFeed, RSSFeedTopicLink,
    DailyOutlook, DailyOutlookRegionLink,
)

create_db_and_tables()

TOPICS = [
    {
        "slug": "middle-east",
        "name": "Middle East Conflict",
        "description": "Ongoing military operations, diplomatic developments, and humanitarian situation in Gaza, the West Bank, Lebanon, and surrounding region.",
        "priority": "CRITICAL",
        "status": "ACTIVE",
    },
    {
        "slug": "ukraine-russia",
        "name": "Ukraine–Russia War",
        "description": "The full-scale Russian invasion of Ukraine, battlefield developments, NATO support, and peace negotiation efforts.",
        "priority": "CRITICAL",
        "status": "ACTIVE",
    },
    {
        "slug": "china-taiwan",
        "name": "China–Taiwan Tensions",
        "description": "Cross-strait military posturing, US arms sales to Taiwan, PLA exercises, and diplomatic signalling.",
        "priority": "HIGH",
        "status": "ACTIVE",
    },
    {
        "slug": "nato-security",
        "name": "NATO & European Security",
        "description": "Alliance expansion, defence spending pledges, US commitment debates, and eastern flank reinforcement.",
        "priority": "HIGH",
        "status": "ACTIVE",
    },
    {
        "slug": "cyber-warfare",
        "name": "Cyber Warfare & Espionage",
        "description": "State-sponsored cyberattacks, critical infrastructure intrusions, ransomware campaigns, and intelligence operations.",
        "priority": "MEDIUM",
        "status": "ACTIVE",
    },
    {
        "slug": "indo-pacific",
        "name": "Indo-Pacific Dynamics",
        "description": "US-China rivalry, AUKUS, Quad activities, South China Sea disputes, and regional alliance shifts.",
        "priority": "HIGH",
        "status": "ACTIVE",
    },
]

REGIONS = [
    "Gaza Strip", "West Bank", "Israel", "Lebanon", "Iran", "Egypt",
    "Ukraine", "Russia", "Poland", "Baltic States", "Finland",
    "Taiwan", "China", "South China Sea",
    "NATO Alliance", "Europe",
    "Cyberspace", "United States",
    "Indo-Pacific", "Australia", "Japan", "Philippines",
]

RSS_FEEDS = [
    ("Reuters World News", "https://feeds.reuters.com/reuters/worldNews", ["middle-east", "ukraine-russia", "china-taiwan", "nato-security"]),
    ("BBC World News", "https://feeds.bbci.co.uk/news/world/rss.xml", ["middle-east", "ukraine-russia", "nato-security"]),
    ("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml", ["middle-east"]),
    ("The Guardian World", "https://www.theguardian.com/world/rss", ["ukraine-russia", "nato-security", "china-taiwan"]),
    ("Foreign Policy", "https://foreignpolicy.com/feed/", ["china-taiwan", "nato-security", "indo-pacific"]),
    ("Kyiv Independent", "https://kyivindependent.com/feed/", ["ukraine-russia"]),
    ("Taiwan News", "https://www.taiwannews.com.tw/en/rss/index.rss", ["china-taiwan"]),
    ("Bleeping Computer", "https://www.bleepingcomputer.com/feed/", ["cyber-warfare"]),
    ("Krebs on Security", "https://krebsonsecurity.com/feed/", ["cyber-warfare"]),
    ("The Diplomat", "https://thediplomat.com/feed/", ["indo-pacific", "china-taiwan"]),
]

OUTLOOKS = [
    {
        "topic_slug": "middle-east",
        "title": "IDF Advances in Northern Gaza as Diplomatic Pressure Mounts",
        "summary": "Israeli ground forces expanded operations in Jabalia and Beit Lahiya overnight while Qatar-mediated ceasefire talks entered a critical phase. The UN Security Council convened an emergency session after casualty figures surpassed 28,000.",
        "content": """## Situation Overview

Israeli Defense Forces continued their ground offensive in northern Gaza on Friday, with units advancing through Jabalia refugee camp in what military officials described as a targeted operation against remaining Hamas tunnel infrastructure. The IDF confirmed strikes on 47 targets overnight, including what it classified as command centres and weapons storage sites.

## Diplomatic Track

Qatar and Egypt are mediating what sources described as the most substantive ceasefire talks since November. A senior Hamas official confirmed the group had submitted a revised proposal, though Israeli officials characterised it as "still far from acceptable." US Secretary of State Antony Blinken is expected to arrive in Tel Aviv on Sunday for direct consultations.

## Humanitarian Situation

The UN Office for the Coordination of Humanitarian Affairs reported that fewer than 20 trucks of aid entered Gaza on Thursday, well below the 100-truck minimum recommended by relief agencies. WHO warned that the northern hospital system has effectively collapsed, with al-Shifa operating at 12% capacity.

## Regional Escalation Indicators

Hezbollah fired approximately 60 rockets and anti-tank missiles across the Blue Line in a 24-hour period, the highest volume since October. The IDF responded with artillery and airstrikes in south Lebanon. Iran-backed groups in Iraq and Syria launched three drone attacks targeting US positions, all intercepted.

## Assessment

The combination of intensified ground operations and renewed ceasefire momentum creates a volatile dynamic. A deal within the next 72 hours would require both sides to accept significant compromises from previously stated positions. Absent a breakthrough, military operations are expected to continue into Rafah.
""",
        "content_simple": "Israeli forces continued fighting in northern Gaza while peace talks in Qatar reached a critical stage. More than 28,000 people have been killed. The UN said not enough food and medicine was getting into Gaza. Hezbollah fired rockets from Lebanon and Iran-backed groups attacked US bases.",
        "regions": ["Gaza Strip", "Israel", "Lebanon", "Iran"],
        "confidence_score": 0.87,
        "source_count": 14,
        "read_time": "5 min",
        "days_ago": 0,
        "annotations": [
            {"term": "IDF", "type": "Organization", "description": "Israel Defense Forces — the military of the State of Israel."},
            {"term": "Hamas", "type": "Organization", "description": "Palestinian Islamist political and military organization that governs the Gaza Strip."},
            {"term": "Jabalia", "type": "Location", "description": "The largest refugee camp in the Gaza Strip, located in the northern part of the territory."},
            {"term": "Hezbollah", "type": "Organization", "description": "Lebanese Shia Islamist militant group and political party backed by Iran."},
            {"term": "Blue Line", "type": "Location", "description": "The border demarcation between Israel and Lebanon established by the UN in 2000."},
        ],
        "map_config": {
            "configId": "map-middle-east",
            "documentId": "map-middle-east",
            "viewport": {"center": {"lat": 31.5, "lon": 34.8}, "zoom": 8},
            "markers": [
                {"markerId": "m1", "position": {"lat": 31.5497, "lon": 34.5130}, "label": "Gaza City", "type": "location", "note": "Main urban centre of the Gaza Strip"},
                {"markerId": "m2", "position": {"lat": 31.5869, "lon": 34.4975}, "label": "Jabalia Camp", "type": "event", "note": "Active IDF ground operations"},
                {"markerId": "m3", "position": {"lat": 33.0, "lon": 35.5}, "label": "South Lebanon", "type": "event", "note": "Ongoing Hezbollah rocket fire"},
            ],
        },
    },
    {
        "topic_slug": "ukraine-russia",
        "title": "Ukraine Strikes Russian Energy Infrastructure as Winter Offensive Stalls",
        "summary": "Ukrainian long-range drones struck oil refineries in Saratov and Ryazan oblasts, marking the deepest penetration of Russian territory since the war began. On the front line, Russian forces made incremental gains near Avdiivka despite heavy losses.",
        "content": """## Battlefield Update

The front line near Avdiivka in Donetsk Oblast saw some of the heaviest fighting of the past month, with Russian forces deploying an estimated 40,000 troops in a grinding attritional assault. Ukrainian forces reported repelling 22 separate attacks over a 48-hour period, inflicting significant armour losses according to Kyiv's General Staff.

## Long-Range Strike Campaign

Ukraine's drone strike campaign reached a new milestone with coordinated attacks on refineries in Saratov Oblast (700km from the front) and the Ryazan oil refinery complex (1,100km). Both facilities are significant contributors to refined fuel for Russian military logistics. Russia's air defence systems intercepted approximately 60% of the drone swarm.

## Western Support

The US House of Representatives failed for the third consecutive week to advance the $61 billion Ukraine supplemental aid package amid Republican opposition. Germany announced a €1.1 billion military aid package including 10 Leopard tanks and additional Gepard anti-aircraft systems.

## Russian Mobilisation

Russian authorities confirmed an additional mobilisation of 15,000 conscripts from Siberian federal districts. Military bloggers reported logistics bottlenecks in the Zaporizhzhia sector, with fuel shortages delaying armoured column movements.

## Assessment

The deep strike campaign represents a strategic effort to degrade Russian warfighting capacity before spring. Avdiivka remains at risk of encirclement if Russian advances continue at the current pace. Congressional inaction on US aid poses the most significant near-term risk to Ukrainian operational sustainability.
""",
        "content_simple": "Ukraine used drones to attack oil refineries deep inside Russia. Russian troops were attacking Avdiivka city very hard but Ukraine stopped most attacks. The US Congress still hasn't approved more money for Ukraine. Germany sent more tanks.",
        "regions": ["Ukraine", "Russia"],
        "confidence_score": 0.91,
        "source_count": 18,
        "read_time": "6 min",
        "days_ago": 0,
        "annotations": [
            {"term": "Avdiivka", "type": "Location", "description": "A city in Donetsk Oblast that has been a focal point of Russian offensive operations."},
            {"term": "Donetsk Oblast", "type": "Location", "description": "One of Ukraine's eastern oblasts, partially occupied by Russia since 2014."},
            {"term": "Leopard tanks", "type": "Organization", "description": "German-made main battle tanks, supplied to Ukraine by Germany and other NATO allies."},
        ],
        "map_config": {
            "configId": "map-ukraine",
            "documentId": "map-ukraine",
            "viewport": {"center": {"lat": 48.5, "lon": 32.0}, "zoom": 6},
            "markers": [
                {"markerId": "u1", "position": {"lat": 48.1333, "lon": 37.7667}, "label": "Avdiivka", "type": "event", "note": "Heavy Russian assault operations"},
                {"markerId": "u2", "position": {"lat": 50.4501, "lon": 30.5234}, "label": "Kyiv", "type": "location", "note": "Ukrainian capital"},
            ],
        },
    },
    {
        "topic_slug": "china-taiwan",
        "title": "PLA Conducts Largest Exercise in 18 Months Near Taiwan Strait",
        "summary": "China's People's Liberation Army launched a three-day exercise involving carrier strike groups and amphibious assault vessels in the Taiwan Strait, described by analysts as a rehearsal for a blockade scenario. Taiwan raised its alert level to 'reinforced readiness.'",
        "content": """## Exercise Overview

The People's Liberation Army Navy deployed the Shandong carrier strike group alongside amphibious assault ships from the Eastern Theatre Command in what defence analysts described as the most complex exercise targeting Taiwan since the August 2022 drills. The exercise featured simulated blockade formations encircling Taiwan's main island.

## US Response

The USS Theodore Roosevelt carrier strike group entered the South China Sea in a show of force, accompanied by Japanese Maritime Self-Defense Force destroyers. The State Department issued a formal diplomatic protest, while the Pentagon described the exercises as "destabilising and provocative."

## Taiwan's Posture

President William Lai convened an emergency national security meeting and placed armed forces on reinforced readiness — one level below full combat alert. Air and naval assets were deployed along the strait median line. Taiwan's defence ministry reported 91 PLA aircraft sorties over a 48-hour period.

## Congressional Reaction

The Senate moved to fast-track a $500 million arms sale to Taiwan, including additional HIMARS launchers and air defence interceptors. Taiwan's government welcomed the move but privately expressed concern about delivery timelines.

## Assessment

The exercise reflects Beijing's response to President Lai's recent international engagements, particularly his transit through Hawaii. The scale of the exercise suggests institutional rehearsal rather than imminent action, but the blockade scenario is the most concerning contingency for both Taiwan and US planners.
""",
        "content_simple": "China's military held large exercises near Taiwan with ships and planes to practice blocking the island. The US sent its aircraft carrier nearby to show support. Taiwan put its military on higher alert. The US Senate agreed to sell more weapons to Taiwan.",
        "regions": ["Taiwan", "China", "South China Sea"],
        "confidence_score": 0.84,
        "source_count": 11,
        "read_time": "5 min",
        "days_ago": 1,
        "annotations": [
            {"term": "PLA", "type": "Organization", "description": "People's Liberation Army — the military of the People's Republic of China."},
            {"term": "Shandong", "type": "Organization", "description": "China's second aircraft carrier, a conventionally-powered vessel based on a Soviet design."},
            {"term": "HIMARS", "type": "Organization", "description": "High Mobility Artillery Rocket System — a US-made multiple rocket launcher that has been used effectively in Ukraine."},
            {"term": "William Lai", "type": "Person", "description": "Lai Ching-te, Taiwan's president since May 2024, known for his pro-independence stance."},
        ],
        "map_config": {
            "configId": "map-taiwan",
            "documentId": "map-taiwan",
            "viewport": {"center": {"lat": 23.5, "lon": 120.5}, "zoom": 7},
            "markers": [
                {"markerId": "t1", "position": {"lat": 25.0478, "lon": 121.5319}, "label": "Taipei", "type": "location", "note": "Taiwan's capital"},
                {"markerId": "t2", "position": {"lat": 22.0, "lon": 118.5}, "label": "PLA Exercise Zone", "type": "event", "note": "Main PLA naval exercise area"},
            ],
        },
    },
    {
        "topic_slug": "nato-security",
        "title": "NATO Ministers Agree to 3% GDP Defence Spending Target Amid US Pressure",
        "summary": "NATO defence ministers reached a preliminary agreement to raise the alliance-wide spending target to 3% of GDP, up from the existing 2% pledge, following sustained pressure from the US administration. Only 11 of 32 members currently meet the 2% threshold.",
        "content": """## Ministers' Meeting

NATO defence ministers convened in Brussels for an extraordinary two-day session focused on long-term defence spending commitments. The meeting was called at the request of the US Secretary of Defence, who warned European allies that American security guarantees cannot be 'unlimited and unconditional.'

## Spending Target

The preliminary agreement to raise the target to 3% of GDP represents a significant political shift. Germany, France, and Italy — which together account for over 40% of European NATO GDP — expressed reservations about the timeline but did not block consensus. Poland, which already spends 4% of GDP on defence, led the group of eastern members pushing for the higher target.

## Article 5 Debate

US officials declined to explicitly reaffirm Article 5 mutual defence commitments in post-meeting statements, generating alarm among Baltic and Nordic members. Secretary-General Rutte was forced to issue a separate statement reaffirming alliance solidarity.

## Industrial Capacity

Ministers agreed to establish a new NATO Defence Production Fund with an initial capitalisation of €100 billion, aimed at accelerating ammunition production and reducing dependence on non-allied suppliers. The fund is modelled partly on the EU's European Defence Fund.

## Assessment

The 3% target is more aspirational than binding but represents a meaningful political signal. The ambiguity around Article 5 is the more significant near-term concern, as it feeds Russian information operations suggesting NATO cohesion is fracturing.
""",
        "content_simple": "NATO countries agreed to try to spend 3% of their economies on defence, more than the current 2% goal. The US pushed hard for this. Most countries don't even meet the lower target yet. The US also refused to clearly promise to defend other NATO members, which worried smaller countries.",
        "regions": ["NATO Alliance", "Europe", "Baltic States"],
        "confidence_score": 0.89,
        "source_count": 9,
        "read_time": "5 min",
        "days_ago": 1,
        "annotations": [
            {"term": "Article 5", "type": "Topic", "description": "The collective defence clause of the NATO treaty — an attack on one member is considered an attack on all."},
            {"term": "Secretary-General Rutte", "type": "Person", "description": "Mark Rutte, NATO Secretary-General since October 2024, former Prime Minister of the Netherlands."},
            {"term": "GDP", "type": "Topic", "description": "Gross Domestic Product — the total value of goods and services produced by a country, used as a baseline for defence spending calculations."},
        ],
        "map_config": {
            "configId": "map-nato",
            "documentId": "map-nato",
            "viewport": {"center": {"lat": 54.0, "lon": 18.0}, "zoom": 4},
            "markers": [
                {"markerId": "n1", "position": {"lat": 50.8503, "lon": 4.3517}, "label": "Brussels (NATO HQ)", "type": "organization", "note": "NATO Headquarters"},
                {"markerId": "n2", "position": {"lat": 59.4370, "lon": 24.7536}, "label": "Tallinn", "type": "location", "note": "Estonia — most concerned about Article 5 ambiguity"},
            ],
        },
    },
    {
        "topic_slug": "cyber-warfare",
        "title": "Volt Typhoon Compromises US Water and Power Grid Infrastructure",
        "summary": "CISA and the FBI issued a joint advisory confirming that Chinese state-sponsored hackers known as Volt Typhoon had pre-positioned within US critical infrastructure networks — including water treatment facilities and power grid control systems — for potential future disruptive attacks.",
        "content": """## Advisory Details

The Cybersecurity and Infrastructure Security Agency (CISA) and the Federal Bureau of Investigation issued an unprecedented joint advisory confirming that Volt Typhoon, a Chinese state-sponsored threat actor, had achieved persistent access to operational technology networks across multiple US critical infrastructure sectors. The intrusions, some dating back five years, targeted water treatment plants, power generation facilities, and communications infrastructure.

## TTPs

Volt Typhoon is notable for its 'living off the land' techniques — using legitimate system tools and credentials rather than custom malware, making detection significantly harder. The advisory confirmed the use of compromised SOHO routers as staging infrastructure and exploitation of unpatched vulnerabilities in widely-used industrial control system software.

## Scope

At least 23 US states are affected according to preliminary assessments. The FBI Director testified before the Senate Intelligence Committee that the intrusions represent 'the defining cyber threat of our generation' — not aimed at immediate disruption but at achieving the capability to cause catastrophic damage in a Taiwan Strait contingency.

## Industry Response

Several major utilities reported beginning immediate network segmentation exercises and conducting sweeps for the specific indicators of compromise published by CISA. The American Water Works Association held emergency calls with member utilities.

## International Dimensions

The UK's NCSC and Australia's ASD issued companion advisories confirming parallel intrusions in their own critical infrastructure, suggesting a coordinated pre-positioning campaign across Five Eyes nations.

## Assessment

The advisory represents a significant intelligence disclosure, signalling that the US government assessed the threat as serious enough to warrant public attribution. The 'pre-positioning' framing implies a deterrence message to Beijing: the US knows and is watching.
""",
        "content_simple": "US government agencies announced that Chinese hackers had secretly broken into American water and electricity systems and stayed hidden for years. They weren't destroying anything yet — they were getting ready to cause damage if a war started over Taiwan. This happened in at least 23 US states.",
        "regions": ["United States", "Cyberspace"],
        "confidence_score": 0.93,
        "source_count": 7,
        "read_time": "6 min",
        "days_ago": 2,
        "annotations": [
            {"term": "Volt Typhoon", "type": "Organization", "description": "A Chinese state-sponsored cyber threat actor known for targeting critical infrastructure and using 'living off the land' techniques."},
            {"term": "CISA", "type": "Organization", "description": "Cybersecurity and Infrastructure Security Agency — the US federal agency responsible for cyber and physical infrastructure security."},
            {"term": "living off the land", "type": "Topic", "description": "A hacking technique where attackers use legitimate system tools already present on a network rather than custom malware, making detection harder."},
            {"term": "Five Eyes", "type": "Organization", "description": "An intelligence alliance comprising the US, UK, Canada, Australia, and New Zealand."},
            {"term": "SOHO routers", "type": "Topic", "description": "Small Office/Home Office routers — often less securely maintained and used by hackers as relay points."},
        ],
        "map_config": {
            "configId": "map-cyber",
            "documentId": "map-cyber",
            "viewport": {"center": {"lat": 37.0, "lon": -95.0}, "zoom": 4},
            "markers": [
                {"markerId": "c1", "position": {"lat": 38.9072, "lon": -77.0369}, "label": "CISA (Washington DC)", "type": "organization", "note": "Issued joint advisory with FBI"},
            ],
        },
    },
    {
        "topic_slug": "indo-pacific",
        "title": "Philippines Grants US Access to Four New Military Bases Amid South China Sea Tensions",
        "summary": "Manila confirmed the US military will gain access to four additional military bases under the Enhanced Defense Cooperation Agreement, including two sites on Luzon island overlooking the Taiwan Strait. China condemned the agreement as 'provocative encirclement.'",
        "content": """## EDCA Expansion

The Philippines and the United States announced an expansion of the Enhanced Defense Cooperation Agreement to include four new locations, bringing the total to nine. The most strategically significant are two sites in Cagayan province on northern Luzon — approximately 400km from Taiwan — and one in Palawan province bordering the South China Sea.

## Strategic Significance

The Luzon sites give the US military pre-positioned logistics infrastructure within range of the Taiwan Strait, significantly shortening response timelines in any Taiwan contingency. Defence analysts noted the sites could support maritime patrol operations and pre-positioned missile systems.

## Chinese Response

The Chinese Foreign Ministry summoned the Philippine ambassador and issued a formal protest, calling the agreement a destabilising escalation that 'serves the hegemonist interests of the United States.' China's Coast Guard conducted additional patrols near the contested Second Thomas Shoal.

## Philippine Domestic Politics

President Marcos faces significant domestic opposition from pro-China factions and former President Duterte's political allies. However, recent Chinese Coast Guard water cannon attacks on Philippine vessels at Second Thomas Shoal have shifted public opinion significantly toward a closer US alignment.

## AUKUS Dimension

Australia announced it would participate in joint exercises at the Luzon sites, marking the first time AUKUS partners would operate from Philippine territory — a significant symbolic deepening of the aligned coalition.

## Assessment

The base expansion materially improves the US military posture in a Taiwan contingency and demonstrates Manila's strategic pivot. The Chinese response will likely include increased pressure on Philippine maritime claims, testing whether Manila holds firm.
""",
        "content_simple": "The Philippines agreed to let the US military use four more bases, including two very close to Taiwan. This gives the US a better position if a war broke out over Taiwan. China was very angry and sent its coast guard ships to patrol disputed islands. The Philippines is moving closer to the US.",
        "regions": ["Philippines", "South China Sea", "Indo-Pacific"],
        "confidence_score": 0.86,
        "source_count": 12,
        "read_time": "6 min",
        "days_ago": 2,
        "annotations": [
            {"term": "EDCA", "type": "Topic", "description": "Enhanced Defense Cooperation Agreement — a 2014 deal allowing the US military to rotate troops and pre-position equipment in the Philippines."},
            {"term": "Second Thomas Shoal", "type": "Location", "description": "A disputed shoal in the South China Sea where the Philippines has a naval vessel permanently grounded; site of recurring confrontations with China."},
            {"term": "AUKUS", "type": "Organization", "description": "A trilateral security partnership between Australia, the United Kingdom, and the United States, focused on advanced defence capabilities."},
            {"term": "President Marcos", "type": "Person", "description": "Ferdinand Marcos Jr., President of the Philippines since June 2022, who has pursued closer security ties with the US."},
        ],
        "map_config": {
            "configId": "map-indo-pacific",
            "documentId": "map-indo-pacific",
            "viewport": {"center": {"lat": 12.0, "lon": 120.0}, "zoom": 5},
            "markers": [
                {"markerId": "ip1", "position": {"lat": 18.2, "lon": 121.7}, "label": "Luzon (New US Base Sites)", "type": "event", "note": "Two new EDCA sites overlooking Taiwan Strait"},
                {"markerId": "ip2", "position": {"lat": 9.5, "lon": 118.0}, "label": "Palawan", "type": "event", "note": "New EDCA site bordering South China Sea"},
                {"markerId": "ip3", "position": {"lat": 9.7, "lon": 115.8}, "label": "Second Thomas Shoal", "type": "event", "note": "Contested shoal; recent Chinese Coast Guard incursions"},
            ],
        },
    },
]


def run():
    with Session(engine) as session:
        print("Seeding regions...")
        region_map = {}
        for name in REGIONS:
            existing = session.exec(select(Region).where(Region.name == name)).first()
            if not existing:
                r = Region(name=name)
                session.add(r)
                session.flush()
                region_map[name] = r
            else:
                region_map[name] = existing
        session.commit()
        print(f"  {len(REGIONS)} regions done")

        print("Seeding topics...")
        for t in TOPICS:
            existing = session.get(Topic, t["slug"])
            if not existing:
                topic = Topic(**t)
                session.add(topic)
        session.commit()
        print(f"  {len(TOPICS)} topics done")

        print("Seeding RSS feeds...")
        for name, url, topic_slugs in RSS_FEEDS:
            existing = session.exec(select(RSSFeed).where(RSSFeed.url == url)).first()
            if not existing:
                feed = RSSFeed(name=name, url=url, is_active=True)
                session.add(feed)
                session.flush()
                for slug in topic_slugs:
                    session.add(RSSFeedTopicLink(rssfeed_id=feed.id, topic_slug=slug))
        session.commit()
        print(f"  {len(RSS_FEEDS)} feeds done")

        print("Seeding daily outlooks...")
        today = date.today()
        count = 0
        for o in OUTLOOKS:
            target_date = today - timedelta(days=o["days_ago"])
            existing = session.exec(
                select(DailyOutlook).where(
                    DailyOutlook.topic_slug == o["topic_slug"],
                    DailyOutlook.date == target_date,
                )
            ).first()
            if existing:
                continue

            outlook = DailyOutlook(
                id=str(uuid.uuid4()),
                topic_slug=o["topic_slug"],
                slug=f"{o['topic_slug']}-{target_date}",
                title=o["title"],
                summary=o["summary"],
                content=o["content"],
                content_simple=o["content_simple"],
                date=target_date,
                read_time=o["read_time"],
                confidence_score=o["confidence_score"],
                source_count=o["source_count"],
                word_count=len(o["content"].split()),
                annotations=o.get("annotations", []),
                map_config=o.get("map_config", {}),
                deep_research_sources=[],
                enhancements_generated=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(outlook)
            session.flush()

            for region_name in o["regions"]:
                region = region_map.get(region_name)
                if region:
                    session.add(DailyOutlookRegionLink(
                        daily_outlook_id=outlook.id,
                        region_id=region.id,
                    ))
            count += 1

        # Also seed yesterday's outlooks for topics that have them
        YESTERDAY_OUTLOOKS = ["middle-east", "ukraine-russia", "nato-security"]
        for slug in YESTERDAY_OUTLOOKS:
            target_date = today - timedelta(days=1)
            existing = session.exec(
                select(DailyOutlook).where(
                    DailyOutlook.topic_slug == slug,
                    DailyOutlook.date == target_date,
                )
            ).first()
            if not existing:
                original = next((o for o in OUTLOOKS if o["topic_slug"] == slug), None)
                if original:
                    outlook = DailyOutlook(
                        id=str(uuid.uuid4()),
                        topic_slug=slug,
                        slug=f"{slug}-{target_date}",
                        title=original["title"] + " (Prior Day)",
                        summary=original["summary"],
                        content=original["content"],
                        content_simple=original["content_simple"],
                        date=target_date,
                        read_time=original["read_time"],
                        confidence_score=original["confidence_score"] - 0.05,
                        source_count=original["source_count"],
                        word_count=len(original["content"].split()),
                        annotations=original.get("annotations", []),
                        map_config=original.get("map_config", {}),
                        deep_research_sources=[],
                        enhancements_generated=True,
                        created_at=datetime.now(timezone.utc),
                        updated_at=datetime.now(timezone.utc),
                    )
                    session.add(outlook)
                    session.flush()
                    for region_name in original["regions"]:
                        region = region_map.get(region_name)
                        if region:
                            session.add(DailyOutlookRegionLink(
                                daily_outlook_id=outlook.id,
                                region_id=region.id,
                            ))
                    count += 1

        session.commit()
        print(f"  {count} outlooks seeded")
        print("\n✅ Seed complete.")
        print(f"   Topics: {len(TOPICS)}")
        print(f"   Regions: {len(REGIONS)}")
        print(f"   RSS Feeds: {len(RSS_FEEDS)}")
        print(f"   Outlooks: {count}")


if __name__ == "__main__":
    run()
