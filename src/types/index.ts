export type CharacterRole = '주인공' | '조연' | '악역' | '멘토' | '조력자' | '기타';

export type EventType = '발단' | '전개' | '위기' | '절정' | '결말';

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  description: string;
  motivation: string;
}

export interface KeyEvent {
  id: string;
  title: string;
  description: string;
  sequence: number;
  type: EventType;
}

export interface SynopsisInput {
  title: string;
  tone: string;
  genre: string;
  subject: string;
  targetAudience: string;
  characters: Character[];
  keyEvents: KeyEvent[];
  additionalNotes: string;
}

export interface Synopsis {
  id: string;
  input: SynopsisInput;
  content: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type ModelSlot = 'opus-4-6' | 'sonnet-4-6' | 'haiku-4-5';

export interface UserSettings {
  apiKey: string;
  defaultGenre: string;
  defaultTone: string;
  theme: 'light' | 'dark' | 'system';
  promptTemplate: string;
  characterPromptTemplate: string;
  eventPromptTemplate: string;
  model: ModelSlot;
}
