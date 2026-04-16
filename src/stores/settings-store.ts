import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_PROMPT_TEMPLATE,
  DEFAULT_CHARACTER_PROMPT_TEMPLATE,
  DEFAULT_EVENT_PROMPT_TEMPLATE,
} from '@/lib/constants';
import type { UserSettings } from '@/types';

interface SettingsState {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
  resetPromptTemplate: () => void;
  resetCharacterPromptTemplate: () => void;
  resetEventPromptTemplate: () => void;
}

const defaultSettings: UserSettings = {
  apiKey: '',
  defaultGenre: '',
  defaultTone: '',
  theme: 'system',
  promptTemplate: DEFAULT_PROMPT_TEMPLATE,
  characterPromptTemplate: DEFAULT_CHARACTER_PROMPT_TEMPLATE,
  eventPromptTemplate: DEFAULT_EVENT_PROMPT_TEMPLATE,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: { ...defaultSettings },

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () =>
        set({ settings: { ...defaultSettings } }),

      resetPromptTemplate: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            promptTemplate: DEFAULT_PROMPT_TEMPLATE,
          },
        })),

      resetCharacterPromptTemplate: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            characterPromptTemplate: DEFAULT_CHARACTER_PROMPT_TEMPLATE,
          },
        })),

      resetEventPromptTemplate: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            eventPromptTemplate: DEFAULT_EVENT_PROMPT_TEMPLATE,
          },
        })),
    }),
    {
      name: 'user-settings',
      skipHydration: true,
    }
  )
);
