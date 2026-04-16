'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSynopsesStore } from '@/stores/synopses-store';
import SynopsisDetail from '@/components/synopses/synopsis-detail';
import PremiereBanner from '@/components/synopses/premiere-banner';

export default function SynopsisDetailPage() {
  const [hydrated, setHydrated] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const justPremiered = searchParams.get('new') === '1';

  const synopsis = useSynopsesStore((s) => s.getSynopsisById(id));
  const toggleFavorite = useSynopsesStore((s) => s.toggleFavorite);
  const removeSynopsis = useSynopsesStore((s) => s.removeSynopsis);

  useEffect(() => {
    useSynopsesStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const handleDelete = () => {
    removeSynopsis(id);
    router.push('/synopses');
  };

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--bg-sunken)]" />
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-[var(--bg-sunken)]" />
      </div>
    );
  }

  if (!synopsis) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-body mb-4 text-lg text-[var(--text-secondary)]">
          시놉시스를 찾을 수 없습니다
        </p>
        <Link
          href="/synopses"
          className="inline-flex items-center rounded-lg bg-[var(--color-brand)] px-5 py-2.5
                     text-sm font-medium text-white transition-colors
                     duration-[var(--duration-normal)]
                     hover:bg-[var(--color-brand-hover)]"
        >
          보관함으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        {justPremiered && <PremiereBanner />}
      </div>
      <SynopsisDetail
        synopsis={synopsis}
        onToggleFavorite={() => toggleFavorite(id)}
        onDelete={handleDelete}
      />
    </div>
  );
}
