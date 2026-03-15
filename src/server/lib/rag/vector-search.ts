import { prisma } from '@/server/lib/db';

import { generateEmbedding } from './embeddings';

export type DocumentMatch = {
  id: string;
  sourceType: string;
  sourceId: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

/**
 * Search for the most relevant documents using pgvector cosine similarity.
 * Requires the `vector` extension and `document_embedding` table to exist.
 */
export async function searchDocuments(
  conflictId: string,
  query: string,
  topK = 8,
): Promise<DocumentMatch[]> {
  const queryEmbedding = await generateEmbedding(query);
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  const results = await prisma.$queryRawUnsafe<DocumentMatch[]>(
    `SELECT
       id,
       source_type AS "sourceType",
       source_id   AS "sourceId",
       content,
       metadata,
       1 - (embedding <=> $1::vector) AS similarity
     FROM document_embedding
     WHERE conflict_id = $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    vectorLiteral,
    conflictId,
    topK,
  );

  return results;
}
