import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, KeyEvent, SynopsisInput } from '@/types';

interface SynopsisState extends SynopsisInput {
  // Generation state
  isGenerating: boolean;
  generatedContent: string;
  generationError: string;

  // Field setters
  setTitle: (title: string) => void;
  setTone: (tone: string) => void;
  setGenre: (genre: string) => void;
  setSubject: (subject: string) => void;
  setTargetAudience: (targetAudience: string) => void;
  setAdditionalNotes: (additionalNotes: string) => void;

  // Character CRUD
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;

  // Event CRUD
  addEvent: (event: KeyEvent) => void;
  updateEvent: (id: string, updates: Partial<KeyEvent>) => void;
  removeEvent: (id: string) => void;
  reorderEvents: (events: KeyEvent[]) => void;

  // Generation actions
  setGenerating: (isGenerating: boolean) => void;
  setGeneratedContent: (content: string) => void;
  setGenerationError: (error: string) => void;

  // Reset
  resetForm: () => void;
}

const initialFormState: SynopsisInput & {
  isGenerating: boolean;
  generatedContent: string;
  generationError: string;
} = {
  title: '',
  tone: '',
  genre: '',
  subject: '',
  targetAudience: '',
  characters: [],
  keyEvents: [],
  additionalNotes: '',
  isGenerating: false,
  generatedContent: '',
  generationError: '',
};

export const useSynopsisStore = create<SynopsisState>()(
  persist(
    (set) => ({
      ...initialFormState,

      // Field setters
      setTitle: (title) => set({ title }),
      setTone: (tone) => set({ tone }),
      setGenre: (genre) => set({ genre }),
      setSubject: (subject) => set({ subject }),
      setTargetAudience: (targetAudience) => set({ targetAudience }),
      setAdditionalNotes: (additionalNotes) => set({ additionalNotes }),

      // Character CRUD
      addCharacter: (character) =>
        set((state) => ({
          characters: [...state.characters, character],
        })),
      updateCharacter: (id, updates) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        })),

      // Event CRUD
      addEvent: (event) =>
        set((state) => ({
          keyEvents: [...state.keyEvents, event],
        })),
      updateEvent: (id, updates) =>
        set((state) => ({
          keyEvents: state.keyEvents.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      removeEvent: (id) =>
        set((state) => ({
          keyEvents: state.keyEvents.filter((e) => e.id !== id),
        })),
      reorderEvents: (events) => set({ keyEvents: events }),

      // Generation actions
      setGenerating: (isGenerating) => set({ isGenerating }),
      setGeneratedContent: (generatedContent) => set({ generatedContent }),
      setGenerationError: (generationError) => set({ generationError }),

      // Reset
      resetForm: () => set(initialFormState),
    }),
    {
      name: 'synopsis-draft',
      skipHydration: true,
    }
  )
);
