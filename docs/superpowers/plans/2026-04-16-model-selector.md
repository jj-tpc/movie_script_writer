# 모델 선택 기능 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자가 설정 페이지에서 Opus 4.6 / Sonnet 4.6 / Haiku 4.5 중 하나를 골라 시놉시스 생성에 사용할 수 있게 한다.

**Architecture:** `UserSettings`에 `model: ModelSlot` 필드를 추가하고 zustand persist의 `merge` 옵션으로 기존 사용자도 자동 migration. 클라이언트는 슬롯 이름(`'sonnet-4-6'` 등)만 저장·전송하고, `/api/generate` 라우트에서 `MODELS` 상수 테이블로 실제 Anthropic 모델 ID로 매핑한다. 매핑 실패 시 Sonnet 4.6으로 silent fallback.

**Tech Stack:** Next.js (App Router), React 19, Zustand + persist, TypeScript, Anthropic SDK (`@anthropic-ai/sdk` v0.89). 테스트 프레임워크 없음 → 수동 브라우저 검증.

**Spec:** `docs/superpowers/specs/2026-04-16-model-selector-design.md`

**Note on TDD:** 프로젝트에 테스트 러너/프레임워크가 없다. 작업은 "변경 → 타입 체크 + 수동 브라우저 검증 → 커밋" 순서로 진행한다. TDD 도입은 이 스펙의 범위 밖.

---

## Task 1: 타입과 상수 추가

`ModelSlot` 타입과 `MODELS`/`DEFAULT_MODEL` 상수를 정의한다. UI와 API가 공유할 단일 소스.

**Files:**
- Modify: `src/types/index.ts` (bottom of file)
- Modify: `src/lib/constants.ts` (top — near other exported arrays)

- [ ] **Step 1: `ModelSlot` 타입 추가 및 `UserSettings` 확장**

`src/types/index.ts`의 `UserSettings` 인터페이스 위에 타입을 추가하고 인터페이스에 `model` 필드를 넣는다.

```ts
// 파일 끝, 또는 UserSettings 위에 추가
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
```

- [ ] **Step 2: `src/lib/constants.ts` import에 `ModelSlot` 추가**

파일 맨 위 import 라인:

```ts
import type { CharacterRole, EventType, ModelSlot } from '@/types';
```

- [ ] **Step 3: `MODELS`와 `DEFAULT_MODEL` 상수 추가**

`GENRES` 선언 위(파일 상단부, import 바로 아래)에 추가:

```ts
export const MODELS: { value: ModelSlot; label: string; apiId: string }[] = [
  { value: 'opus-4-6',   label: 'Claude Opus 4.6',   apiId: 'claude-opus-4-6' },
  { value: 'sonnet-4-6', label: 'Claude Sonnet 4.6', apiId: 'claude-sonnet-4-6' },
  { value: 'haiku-4-5',  label: 'Claude Haiku 4.5',  apiId: 'claude-haiku-4-5-20251001' },
];

export const DEFAULT_MODEL: ModelSlot = 'sonnet-4-6';
```

- [ ] **Step 4: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음. (`UserSettings`에 `model`을 아직 쓰는 코드가 없으므로 타입 에러 발생 안 함. `defaultSettings`에는 필드가 누락되어 에러가 나야 함 → 다음 태스크에서 해결.)

만약 `defaultSettings`에서 `Property 'model' is missing` 에러가 뜨면 **정상**이다. 태스크 2에서 고친다.

- [ ] **Step 5: 커밋**

```bash
git add src/types/index.ts src/lib/constants.ts
git commit -m "Add ModelSlot type and MODELS constant"
```

---

## Task 2: 설정 스토어 기본값 + migration merge

`defaultSettings.model`을 추가하고, 기존 사용자의 localStorage에 `model` 필드가 없어도 자동으로 기본값으로 채워지도록 zustand persist `merge`를 설정한다.

**Files:**
- Modify: `src/stores/settings-store.ts`

- [ ] **Step 1: import에 `DEFAULT_MODEL` 추가**

기존 `import { DEFAULT_PROMPT_TEMPLATE, DEFAULT_CHARACTER_PROMPT_TEMPLATE, DEFAULT_EVENT_PROMPT_TEMPLATE } from '@/lib/constants';`를 다음으로 변경:

```ts
import {
  DEFAULT_PROMPT_TEMPLATE,
  DEFAULT_CHARACTER_PROMPT_TEMPLATE,
  DEFAULT_EVENT_PROMPT_TEMPLATE,
  DEFAULT_MODEL,
} from '@/lib/constants';
```

- [ ] **Step 2: `defaultSettings`에 `model` 추가**

`defaultSettings` 객체(약 19–27줄)를 다음으로 변경:

```ts
const defaultSettings: UserSettings = {
  apiKey: '',
  defaultGenre: '',
  defaultTone: '',
  theme: 'system',
  promptTemplate: DEFAULT_PROMPT_TEMPLATE,
  characterPromptTemplate: DEFAULT_CHARACTER_PROMPT_TEMPLATE,
  eventPromptTemplate: DEFAULT_EVENT_PROMPT_TEMPLATE,
  model: DEFAULT_MODEL,
};
```

- [ ] **Step 3: persist config에 `merge` 추가**

파일 하단의 persist 옵션(약 66–69줄):

```ts
{
  name: 'user-settings',
  skipHydration: true,
}
```

다음으로 변경:

```ts
{
  name: 'user-settings',
  skipHydration: true,
  merge: (persisted, current) => {
    const p = persisted as { settings?: Partial<UserSettings> } | undefined;
    return {
      ...current,
      settings: { ...current.settings, ...(p?.settings ?? {}) },
    };
  },
}
```

**왜 이 merge가 필요한가:** zustand의 기본 merge는 최상위 키만 교체한다. 저장된 state가 `{ settings: { apiKey: 'x', ... /* model 없음 */ } }`이면 기본 동작에서는 `current.settings`가 통째로 교체되어 `model`이 undefined가 된다. 커스텀 merge에서 `settings` 내부도 얕은 병합하여 누락 필드가 `defaultSettings`에서 채워지게 한다.

- [ ] **Step 4: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/stores/settings-store.ts
git commit -m "Default model to Sonnet 4.6 and merge-migrate old settings"
```

---

## Task 3: 설정 페이지에 모델 선택 UI 추가

`GeneralTab`의 API 키 아래에 모델 선택 드롭다운을 추가한다. 스타일은 기존 "기본 장르" / "기본 톤" 셀렉트와 동일하게.

**Files:**
- Modify: `src/components/settings/settings-form.tsx`

- [ ] **Step 1: import에 `MODELS` 및 `ModelSlot` 추가**

현재 import:
```ts
import { GENRES, TONES } from '@/lib/constants';
```
→
```ts
import { GENRES, TONES, MODELS } from '@/lib/constants';
import type { ModelSlot } from '@/types';
```

- [ ] **Step 2: `GeneralTab`에 모델 선택 블록 추가**

`<ApiKeyInput />` 바로 아래, `{/* Theme selector */}` 블록 위(약 53–55줄 사이)에 다음 `<div>`를 추가:

```tsx
{/* Model selector */}
<div>
  <label
    htmlFor="model-select"
    className="text-display mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
  >
    AI 모델
  </label>
  <p className="mb-3 text-xs text-[var(--text-tertiary)]">
    시놉시스 생성에 사용할 Claude 모델
  </p>
  <select
    id="model-select"
    value={settings.model}
    onChange={(e) => updateSettings({ model: e.target.value as ModelSlot })}
    className="w-full max-w-xs rounded-lg border border-[var(--border-default)]
               bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)]
               transition-colors duration-[var(--duration-fast)]
               focus:border-[var(--color-brand)] focus:outline-none focus:ring-1
               focus:ring-[var(--color-brand)]"
  >
    {MODELS.map((m) => (
      <option key={m.value} value={m.value}>
        {m.label}
      </option>
    ))}
  </select>
</div>
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: 개발 서버에서 UI 수동 검증**

Run: `npm run dev`

브라우저에서 `http://localhost:3000/settings`로 이동. "일반" 탭에서:
- API 키 아래에 "AI 모델" 라벨과 드롭다운이 나타나는지
- 드롭다운에 세 옵션("Claude Opus 4.6", "Claude Sonnet 4.6", "Claude Haiku 4.5")이 있는지
- 기본 선택이 "Claude Sonnet 4.6"인지
- Haiku로 바꾸고 페이지 새로고침 → Haiku로 유지되는지
- DevTools → Application → Local Storage → `user-settings` → `state.settings.model === 'haiku-4-5'`인지

기대: 모두 OK.

- [ ] **Step 5: 커밋**

```bash
git add src/components/settings/settings-form.tsx
git commit -m "Add model selector to general settings tab"
```

---

## Task 4: 생성 패널에서 모델 슬롯 전달

`generation-panel.tsx`가 `settings.model`을 구독하고 `/api/generate` POST 바디에 포함시킨다.

**Files:**
- Modify: `src/components/create/generation-panel.tsx`

- [ ] **Step 1: `settings.model` 구독 추가**

현재(약 48–49줄):
```ts
const apiKey = useSettingsStore((s) => s.settings.apiKey);
const promptTemplate = useSettingsStore((s) => s.settings.promptTemplate);
```
→
```ts
const apiKey = useSettingsStore((s) => s.settings.apiKey);
const promptTemplate = useSettingsStore((s) => s.settings.promptTemplate);
const model = useSettingsStore((s) => s.settings.model);
```

- [ ] **Step 2: POST 바디에 `model` 추가**

현재(약 81–94줄)의 `body: JSON.stringify({ ... })` 부분:
```ts
body: JSON.stringify({
  input: {
    title,
    tone,
    genre,
    subject,
    targetAudience,
    characters,
    keyEvents,
    additionalNotes,
  },
  apiKey,
  promptTemplate,
}),
```
→
```ts
body: JSON.stringify({
  input: {
    title,
    tone,
    genre,
    subject,
    targetAudience,
    characters,
    keyEvents,
    additionalNotes,
  },
  apiKey,
  promptTemplate,
  model,
}),
```

- [ ] **Step 3: `handleGenerate`의 `useCallback` 의존성 배열에 `model` 추가**

현재(약 125–129줄):
```ts
}, [
  canGenerate, title, tone, genre, subject, targetAudience,
  characters, keyEvents, additionalNotes, apiKey, promptTemplate,
  setGenerating, setGeneratedContent, setGenerationError,
]);
```
→
```ts
}, [
  canGenerate, title, tone, genre, subject, targetAudience,
  characters, keyEvents, additionalNotes, apiKey, promptTemplate, model,
  setGenerating, setGeneratedContent, setGenerationError,
]);
```

- [ ] **Step 4: 타입 체크 + lint**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

Run: `npm run lint` (존재한다면)
Expected: 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/components/create/generation-panel.tsx
git commit -m "Pass selected model slot to generate API"
```

---

## Task 5: API 라우트에서 모델 슬롯 → apiId 매핑

`/api/generate`가 `model` 슬롯을 받아 `MODELS`에서 실제 `apiId`로 매핑하고 Anthropic SDK에 전달. 매칭 실패 시 `DEFAULT_MODEL`의 apiId로 silent fallback.

**Files:**
- Modify: `src/app/api/generate/route.ts`

- [ ] **Step 1: import에 `MODELS`, `DEFAULT_MODEL` 추가**

현재(약 4줄):
```ts
import { DEFAULT_PROMPT_TEMPLATE } from '@/lib/constants';
```
→
```ts
import { DEFAULT_PROMPT_TEMPLATE, MODELS, DEFAULT_MODEL } from '@/lib/constants';
```

`ModelSlot` 타입도 필요하면 import — 이 라우트에서는 검증 후 `apiId`만 쓰므로 `string`으로 받아도 충분. 추가 import 불필요.

- [ ] **Step 2: 바디 파싱에 `model` 추가**

현재(약 10–14줄):
```ts
const { input, apiKey, promptTemplate } = body as {
  input: SynopsisInput;
  apiKey?: string;
  promptTemplate?: string;
};
```
→
```ts
const { input, apiKey, promptTemplate, model } = body as {
  input: SynopsisInput;
  apiKey?: string;
  promptTemplate?: string;
  model?: string;
};
```

- [ ] **Step 3: 슬롯 → apiId 매핑 로직 추가**

`const prompt = buildPrompt(input, template);`(약 30줄) 바로 뒤에 삽입:

```ts
const fallbackApiId = MODELS.find((m) => m.value === DEFAULT_MODEL)!.apiId;
const resolvedApiId = MODELS.find((m) => m.value === model)?.apiId ?? fallbackApiId;
```

- [ ] **Step 4: `messages.stream`의 `model`을 `resolvedApiId`로 교체**

현재(약 32–36줄):
```ts
const stream = client.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  messages: [{ role: 'user', content: prompt }],
});
```
→
```ts
const stream = client.messages.stream({
  model: resolvedApiId,
  max_tokens: 4096,
  messages: [{ role: 'user', content: prompt }],
});
```

- [ ] **Step 5: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 6: 커밋**

```bash
git add src/app/api/generate/route.ts
git commit -m "Resolve model slot to Anthropic API ID in generate route"
```

---

## Task 6: End-to-End 수동 검증

구현 완료 후 브라우저에서 골든 패스와 엣지 케이스를 확인한다.

**Files:** 없음 (검증만)

- [ ] **Step 1: 개발 서버 기동**

Run: `npm run dev`
기대: http://localhost:3000 에서 앱이 정상 부팅.

- [ ] **Step 2: 기본값(Sonnet 4.6)으로 생성**

1. (신규 사용자 시뮬레이션) DevTools → Application → Local Storage → `user-settings` 삭제 → 새로고침.
2. 설정 페이지 → API 키 입력.
3. "AI 모델"이 "Claude Sonnet 4.6"로 선택되어 있는지 확인.
4. 생성 페이지에서 최소 입력(제목/장르/캐릭터1명) 후 시놉시스 생성.
5. DevTools → Network → `/api/generate` 요청 페이로드의 `model === "sonnet-4-6"` 확인.
6. 응답이 정상 스트리밍되고 결과가 렌더링되는지 확인.

기대: 모두 OK.

- [ ] **Step 3: 각 모델로 생성 테스트**

설정에서 "Claude Opus 4.6"로 변경 → 생성 → Network에서 `model === "opus-4-6"` 확인, 응답 정상.
설정에서 "Claude Haiku 4.5"로 변경 → 생성 → `model === "haiku-4-5"` 확인, 응답 정상.

기대: 각 모델별로 응답 속도/스타일이 다르지만 모두 성공.

- [ ] **Step 4: 구버전 migration 검증**

1. DevTools → Local Storage → `user-settings`를 다음으로 직접 교체 (model 필드 제거한 상태):

```json
{
  "state": {
    "settings": {
      "apiKey": "sk-ant-...본인키...",
      "defaultGenre": "",
      "defaultTone": "",
      "theme": "system",
      "promptTemplate": "...기본값 그대로...",
      "characterPromptTemplate": "...기본값 그대로...",
      "eventPromptTemplate": "...기본값 그대로..."
    }
  },
  "version": 0
}
```

2. 페이지 새로고침 후 설정 페이지 방문.
3. "AI 모델"이 "Claude Sonnet 4.6"로 자동 설정되어 있는지 확인.
4. 생성도 정상 동작하는지 확인.

기대: migration 성공.

- [ ] **Step 5: 잘못된 슬롯 fallback 검증**

DevTools Console에서:
```js
fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: { title: 'T', genre: 'drama', tone: '', subject: '', targetAudience: '', characters: [{ id: '1', name: 'A', role: '주인공', description: 'x', motivation: 'x' }], keyEvents: [], additionalNotes: '' },
    apiKey: '<본인 키>',
    model: 'bogus-slot-xyz',
  }),
}).then(r => r.text()).then(console.log);
```

기대: 500 에러가 아니라 Sonnet으로 정상 스트리밍 응답.

- [ ] **Step 6: 회귀 체크**

기존 기능이 안 깨졌는지:
- 테마 토글 정상
- 기본 장르/톤 저장 정상
- 프롬프트 에디터 탭 정상
- 데이터 내보내기/가져오기 정상
- 시놉시스 저장 후 상세 페이지 이동 정상

기대: 모두 정상.

- [ ] **Step 7: 완료 커밋(필요 시)**

구현 중 작은 수정이 생겼다면 커밋. 아니면 생략.

---

## Self-Review 체크리스트 결과

- **Spec coverage:** 모든 spec 섹션(타입/상수/스토어/UI/전달/API 라우트/에러 처리/마이그레이션/테스트)이 태스크로 매핑됨. ✓
- **Placeholder scan:** TBD/TODO 없음. 모든 코드 블록이 완전함. ✓
- **Type consistency:** `ModelSlot`, `MODELS`, `DEFAULT_MODEL`, `settings.model` 네이밍이 모든 태스크에서 일관됨. ✓
- **Ambiguity:** 없음. ✓
