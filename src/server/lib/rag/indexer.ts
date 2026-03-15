import { prisma } from '@/server/lib/db';

import { EMBEDDING_DIMENSIONS,generateEmbeddings } from './embeddings';

type DocumentRow = {
  sourceType: string;
  sourceId: string;
  content: string;
  metadata: Record<string, unknown>;
};

/** Ensure pgvector extension and table exist. */
async function ensureTable() {
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS document_embedding (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      conflict_id   TEXT NOT NULL,
      source_type   TEXT NOT NULL,
      source_id     TEXT NOT NULL,
      content       TEXT NOT NULL,
      metadata      JSONB NOT NULL DEFAULT '{}',
      embedding     vector(${EMBEDDING_DIMENSIONS}),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(conflict_id, source_type, source_id)
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_doc_embedding_conflict ON document_embedding(conflict_id)
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_doc_embedding_vector
    ON document_embedding USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
  `);
}

/** Upsert a batch of documents with their embeddings. */
async function upsertBatch(conflictId: string, rows: DocumentRow[]) {
  if (rows.length === 0) return;

  const texts = rows.map(r => r.content);
  const embeddings = await generateEmbeddings(texts);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const vectorLiteral = `[${embeddings[i].join(',')}]`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO document_embedding (conflict_id, source_type, source_id, content, metadata, embedding)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector)
       ON CONFLICT (conflict_id, source_type, source_id)
       DO UPDATE SET content = $4, metadata = $5::jsonb, embedding = $6::vector, updated_at = now()`,
      conflictId,
      row.sourceType,
      row.sourceId,
      row.content,
      JSON.stringify(row.metadata),
      vectorLiteral,
    );
  }
}

/** Index all IntelEvents for a conflict. */
async function indexEvents(conflictId: string) {
  const events = await prisma.intelEvent.findMany({
    where: { conflictId },
    select: {
      id: true,
      title: true,
      summary: true,
      fullContent: true,
      severity: true,
      type: true,
      location: true,
      timestamp: true,
      tags: true,
    },
  });

  const BATCH_SIZE = 20;
  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    const rows: DocumentRow[] = batch.map(e => ({
      sourceType: 'event',
      sourceId: e.id,
      content: `${e.title}\n${e.summary}\n${e.fullContent}`,
      metadata: {
        title: e.title,
        severity: e.severity,
        type: e.type,
        location: e.location,
        timestamp: e.timestamp.toISOString(),
        tags: e.tags,
      },
    }));
    await upsertBatch(conflictId, rows);
  }

  return events.length;
}

/** Index all XPosts (signals) for a conflict. */
async function indexXPosts(conflictId: string) {
  const posts = await prisma.xPost.findMany({
    where: { conflictId },
    select: {
      id: true,
      handle: true,
      displayName: true,
      content: true,
      pharosNote: true,
      significance: true,
      accountType: true,
      postType: true,
      timestamp: true,
    },
  });

  const BATCH_SIZE = 20;
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const rows: DocumentRow[] = batch.map(p => ({
      sourceType: 'xpost',
      sourceId: p.id,
      content: `@${p.handle} (${p.displayName}): ${p.content}${p.pharosNote ? `\nPharos Note: ${p.pharosNote}` : ''}`,
      metadata: {
        handle: p.handle,
        displayName: p.displayName,
        significance: p.significance,
        accountType: p.accountType,
        postType: p.postType,
        timestamp: p.timestamp.toISOString(),
      },
    }));
    await upsertBatch(conflictId, rows);
  }

  return posts.length;
}

/** Index all day snapshots for a conflict. */
async function indexDaySnapshots(conflictId: string) {
  const snapshots = await prisma.conflictDaySnapshot.findMany({
    where: { conflictId },
    select: {
      id: true,
      day: true,
      dayLabel: true,
      summary: true,
      keyFacts: true,
      economicNarrative: true,
      escalation: true,
    },
  });

  const BATCH_SIZE = 10;
  for (let i = 0; i < snapshots.length; i += BATCH_SIZE) {
    const batch = snapshots.slice(i, i + BATCH_SIZE);
    const rows: DocumentRow[] = batch.map(s => ({
      sourceType: 'snapshot',
      sourceId: s.id,
      content: `Day: ${s.dayLabel}\n${s.summary}\nKey Facts: ${s.keyFacts.join('; ')}${s.economicNarrative ? `\nEconomic: ${s.economicNarrative}` : ''}`,
      metadata: {
        dayLabel: s.dayLabel,
        day: s.day.toISOString().slice(0, 10),
        escalation: s.escalation,
      },
    }));
    await upsertBatch(conflictId, rows);
  }

  return snapshots.length;
}

/** Index all actors for a conflict. */
async function indexActors(conflictId: string) {
  const actors = await prisma.actor.findMany({
    where: { conflictId },
    select: {
      id: true,
      name: true,
      fullName: true,
      assessment: true,
      saying: true,
      doing: true,
      stance: true,
      activityLevel: true,
      type: true,
    },
  });

  const rows: DocumentRow[] = actors.map(a => ({
    sourceType: 'actor',
    sourceId: a.id,
    content: `${a.fullName} (${a.name})\nStance: ${a.stance} | Activity: ${a.activityLevel}\nSaying: ${a.saying}\nDoing: ${a.doing.join('; ')}\nAssessment: ${a.assessment}`,
    metadata: {
      name: a.name,
      fullName: a.fullName,
      stance: a.stance,
      activityLevel: a.activityLevel,
      type: a.type,
    },
  }));

  await upsertBatch(conflictId, rows);
  return actors.length;
}

/** Index all map stories for a conflict. */
async function indexMapStories(conflictId: string) {
  const stories = await prisma.mapStory.findMany({
    where: { conflictId },
    select: {
      id: true,
      title: true,
      tagline: true,
      narrative: true,
      keyFacts: true,
      category: true,
      timestamp: true,
    },
  });

  const rows: DocumentRow[] = stories.map(s => ({
    sourceType: 'story',
    sourceId: s.id,
    content: `${s.title} — ${s.tagline}\n${s.narrative}\nKey Facts: ${s.keyFacts.join('; ')}`,
    metadata: {
      title: s.title,
      category: s.category,
      timestamp: s.timestamp.toISOString(),
    },
  }));

  await upsertBatch(conflictId, rows);
  return stories.length;
}

/**
 * Full index of all conflict documents.
 * Creates the pgvector table if needed, then indexes all entity types.
 */
export async function indexConflict(conflictId: string) {
  await ensureTable();

  const [events, xPosts, snapshots, actors, stories] = await Promise.all([
    indexEvents(conflictId),
    indexXPosts(conflictId),
    indexDaySnapshots(conflictId),
    indexActors(conflictId),
    indexMapStories(conflictId),
  ]);

  return { events, xPosts, snapshots, actors, stories };
}
