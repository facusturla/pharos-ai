import { createHash, randomBytes } from 'crypto';

import { cookies } from 'next/headers';

import { prisma } from '@/server/lib/db';

const COOKIE_NAME = 'pharos_vid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function createToken() {
  return randomBytes(32).toString('hex');
}

export async function resolveAnonymousVisitor() {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(COOKIE_NAME)?.value;

  if (existingToken) {
    const visitor = await prisma.anonymousVisitor.findUnique({
      where: { tokenHash: hashToken(existingToken) },
      select: { id: true },
    });

    if (visitor) {
      await prisma.anonymousVisitor.update({
        where: { id: visitor.id },
        data: { lastSeenAt: new Date() },
      });
      return visitor;
    }
  }

  const token = createToken();
  const visitor = await prisma.anonymousVisitor.create({
    data: { tokenHash: hashToken(token) },
    select: { id: true },
  });

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return visitor;
}
