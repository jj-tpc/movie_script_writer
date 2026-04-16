import type { SynopsisInput } from '@/types';
import { GENRES, TONES, AUDIENCES } from '@/lib/constants';

function findLabel(list: readonly { value: string; label: string }[], value: string): string {
  return list.find((item) => item.value === value)?.label ?? value;
}

function formatCharacters(input: SynopsisInput): string {
  if (input.characters.length === 0) return '(없음)';
  return input.characters
    .map((c, i) => `${i + 1}. ${c.name} (${c.role})\n   설명: ${c.description}\n   동기: ${c.motivation}`)
    .join('\n\n');
}

function formatEvents(input: SynopsisInput): string {
  if (input.keyEvents.length === 0) return '(없음)';
  return [...input.keyEvents]
    .sort((a, b) => a.sequence - b.sequence)
    .map((e) => `${e.sequence}. [${e.type}] ${e.title}\n   ${e.description}`)
    .join('\n\n');
}

export function buildPrompt(input: SynopsisInput, template: string): string {
  const genreLabel = findLabel(GENRES, input.genre);
  const toneLabel = findLabel(TONES, input.tone);
  const audienceLabel = findLabel(AUDIENCES, input.targetAudience);

  let prompt = template
    .replace(/\{\{title\}\}/g, input.title || '(미정)')
    .replace(/\{\{genre\}\}/g, genreLabel)
    .replace(/\{\{tone\}\}/g, toneLabel || '(미정)')
    .replace(/\{\{subject\}\}/g, input.subject || '(미정)')
    .replace(/\{\{targetAudience\}\}/g, audienceLabel || '(미정)')
    .replace(/\{\{characters\}\}/g, formatCharacters(input))
    .replace(/\{\{keyEvents\}\}/g, formatEvents(input));

  // Handle conditional additionalNotes block
  if (input.additionalNotes.trim()) {
    prompt = prompt
      .replace(/\{\{#additionalNotes\}\}/g, '')
      .replace(/\{\{\/additionalNotes\}\}/g, '')
      .replace(/\{\{additionalNotes\}\}/g, input.additionalNotes);
  } else {
    prompt = prompt.replace(/\{\{#additionalNotes\}\}[\s\S]*?\{\{\/additionalNotes\}\}/g, '');
  }

  return prompt;
}
