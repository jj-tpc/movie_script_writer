import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Synopsis } from '@/types';

interface SynopsesState {
  synopses: Synopsis[];
  addSynopsis: (synopsis: Synopsis) => void;
  removeSynopsis: (id: string) => void;
  updateSynopsis: (id: string, updates: Partial<Synopsis>) => void;
  toggleFavorite: (id: string) => void;
  getSynopsisById: (id: string) => Synopsis | undefined;
}

export const useSynopsesStore = create<SynopsesState>()(
  persist(
    (set, get) => ({
      synopses: [],

      addSynopsis: (synopsis) =>
        set((state) => ({
          synopses: [synopsis, ...state.synopses],
        })),

      removeSynopsis: (id) =>
        set((state) => ({
          synopses: state.synopses.filter((s) => s.id !== id),
        })),

      updateSynopsis: (id, updates) =>
        set((state) => ({
          synopses: state.synopses.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          synopses: state.synopses.map((s) =>
            s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
          ),
        })),

      getSynopsisById: (id) => get().synopses.find((s) => s.id === id),
    }),
    {
      name: 'synopses-library',
      skipHydration: true,
    }
  )
);
