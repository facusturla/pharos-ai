'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
import { ACTORS } from '@/data/iranActors';
import { ActorList } from '@/components/actors/ActorList';
import { ActorDossier } from '@/components/actors/ActorDossier';
import { EmptyState } from '@/components/shared/EmptyState';

function ActorsInner() {
  const searchParams = useSearchParams();
  const initActor    = searchParams.get('actor');

  const [selId, setSelId] = useState<string | null>(initActor);
  const [tab,   setTab]   = useState<'intel' | 'signals'>('intel');

  useEffect(() => { if (initActor) setSelId(initActor); }, [initActor]);

  const selected = ACTORS.find(a => a.id === selId) ?? null;

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden">
      <ActorList
        selectedId={selId}
        onSelect={id => { setSelId(id); if (id) setTab('intel'); }}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {selected
          ? <ActorDossier actor={selected} tab={tab} onTabChange={setTab} />
          : <EmptyState icon={Users} message="Select an actor" />
        }
      </div>
    </div>
  );
}

export default function ActorsPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center"><span className="label">Loading…</span></div>}>
      <ActorsInner />
    </Suspense>
  );
}
