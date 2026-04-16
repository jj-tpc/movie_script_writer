'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSynopsesStore } from '@/stores/synopses-store';
import SynopsisCard from './synopsis-card';

type FilterTab = 'all' | 'favorites';
type SortOrder = 'newest' | 'oldest';

export default function SynopsisGallery() {
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [sort, setSort] = useState<SortOrder>('newest');

  const synopses = useSynopsesStore((s) => s.synopses);
  const toggleFavorite = useSynopsesStore((s) => s.toggleFavorite);
  const removeSynopsis = useSynopsesStore((s) => s.removeSynopsis);

  useEffect(() => {
    useSynopsesStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const filtered = useMemo(() => {
    let list = [...synopses];

    if (filter === 'favorites') {
      list = list.filter((s) => s.isFavorite);
    }

    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === 'newest' ? db - da : da - db;
    });

    return list;
  }, [synopses, filter, sort]);

  if (!hydrated) {
    return (
      <div className="[columns:1] sm:[columns:2] lg:[columns:3] [column-gap:1.25rem]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`mb-5 break-inside-avoid animate-pulse rounded-lg
                        border border-[var(--border-subtle)] bg-[var(--bg-sunken)]
                        ${i % 3 === 0 ? 'h-56' : i % 3 === 1 ? 'h-44' : 'h-52'}`}
          />
        ))}
      </div>
    );
  }

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'favorites', label: '즐겨찾기' },
  ];

  const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
    { key: 'newest', label: '최신순' },
    { key: 'oldest', label: '오래된순' },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Filter chips */}
        <div className="flex items-center gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors
                         duration-[var(--duration-fast)]
                         ${
                           filter === tab.key
                             ? 'bg-[var(--color-brand)] text-white font-medium'
                             : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                         }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors
                         duration-[var(--duration-fast)]
                         ${
                           sort === opt.key
                             ? 'text-[var(--text-primary)] font-medium'
                             : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                         }`}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-body mb-2 text-lg text-[var(--text-secondary)]">
            {filter === 'favorites'
              ? '즐겨찾기한 시놉시스가 없습니다'
              : '아직 저장된 시놉시스가 없습니다'}
          </p>
          {filter === 'all' && (
            <Link
              href="/create"
              className="mt-4 inline-flex items-center rounded-lg bg-[var(--color-brand)]
                         px-5 py-2.5 text-sm font-medium text-white transition-colors
                         duration-[var(--duration-normal)]
                         hover:bg-[var(--color-brand-hover)]"
            >
              첫 시놉시스를 만들어보세요
            </Link>
          )}
        </div>
      ) : (
        /* Poster wall — CSS columns masonry.
           Natural height variation from preview text + staggered first-item
           indent in each column creates an organic, asymmetric composition. */
        <div className="[columns:1] sm:[columns:2] lg:[columns:3] [column-gap:1.25rem]">
          {filtered.map((synopsis, i) => (
            <div
              key={synopsis.id}
              className={`mb-5 break-inside-avoid
                          ${i % 4 === 1 ? 'sm:mt-6' : ''}
                          ${i % 4 === 3 ? 'sm:mt-10' : ''}`}
            >
              <SynopsisCard
                synopsis={synopsis}
                onToggleFavorite={() => toggleFavorite(synopsis.id)}
                onDelete={() => removeSynopsis(synopsis.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
