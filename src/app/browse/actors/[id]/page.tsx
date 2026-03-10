import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import { ActorProfile } from '@/features/browse/components/ActorProfile';
import { getActor } from '@/features/browse/queries';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const actor = await getActor(id);
  if (!actor) return { title: 'Actor not found' };

  return {
    title: `${actor.name} — Actor Intelligence`,
    description: actor.assessment.slice(0, 160),
    openGraph: {
      title: `${actor.name} — PHAROS Actor Intelligence`,
      description: actor.assessment.slice(0, 160),
      url: `https://www.conflicts.app/browse/actors/${id}`,
    },
    alternates: { canonical: `https://www.conflicts.app/browse/actors/${id}` },
  };
}

export default async function BrowseActorPage({ params }: Props) {
  const { id } = await params;
  const actor = await getActor(id);

  if (!actor) notFound();

  return <ActorProfile actor={actor} />;
}
