# 모델 선택 기능 — 디자인 문서

**날짜:** 2026-04-16
**상태:** 승인됨
**범위:** 시놉시스 생성에 사용할 Claude 모델을 사용자가 설정에서 고를 수 있게 한다.

## 배경

현재 `src/app/api/generate/route.ts:33`에 모델 ID가 `'claude-sonnet-4-20250514'`로 하드코딩되어 있다. 이 값은 구버전 Sonnet 4이며, 사용자는 비용/품질 트레이드오프에 맞춰 다른 모델을 선택할 수 없다.

## 목표

사용자가 설정 페이지에서 Opus 4.6 / Sonnet 4.6 / Haiku 4.5 중 하나를 골라 시놉시스 생성에 사용할 수 있게 한다.

## 비목표

- 생성 페이지 인라인 모델 변경 UI (설정 페이지에서만)
- 캐릭터/이벤트 프롬프트용 별도 모델 선택 (현재 해당 API 라우트가 없으므로 범위 밖)
- 모델별 가격/속도 힌트 표시 (이름만 표시)
- 커스텀 모델 ID 입력

## 아키텍처

### 저장 방식: 슬롯 이름 저장 → API에서 실제 ID로 매핑

사용자 설정에는 `'sonnet-4-6'` 같은 추상 슬롯만 저장하고, API 라우트에서 `MODELS` 매핑 테이블을 통해 실제 Anthropic 모델 ID로 변환한다.

**이유:** Haiku 4.5처럼 날짜 suffix가 붙는 모델 ID(`claude-haiku-4-5-20251001`)를 localStorage에 박아두면 Anthropic이 모델 버전을 업데이트했을 때 저장된 사용자 설정이 깨질 수 있다. 슬롯만 저장하면 매핑 테이블만 갱신하면 된다.

## 컴포넌트 변경 사항

### 1. `src/types/index.ts` — 타입 확장

```ts
export type ModelSlot = 'opus-4-6' | 'sonnet-4-6' | 'haiku-4-5';

export interface UserSettings {
  apiKey: string;
  defaultGenre: string;
  defaultTone: string;
  theme: 'light' | 'dark' | 'system';
  promptTemplate: string;
  characterPromptTemplate: string;
  eventPromptTemplate: string;
  model: ModelSlot; // 신규
}
```

### 2. `src/lib/constants.ts` — 모델 상수

```ts
import type { ModelSlot } from '@/types';

export const MODELS: { value: ModelSlot; label: string; apiId: string }[] = [
  { value: 'opus-4-6',   label: 'Claude Opus 4.6',   apiId: 'claude-opus-4-6' },
  { value: 'sonnet-4-6', label: 'Claude Sonnet 4.6', apiId: 'claude-sonnet-4-6' },
  { value: 'haiku-4-5',  label: 'Claude Haiku 4.5',  apiId: 'claude-haiku-4-5-20251001' },
];

export const DEFAULT_MODEL: ModelSlot = 'sonnet-4-6';
```

### 3. `src/stores/settings-store.ts` — 기본값 + merge

- `defaultSettings.model = DEFAULT_MODEL`
- zustand persist config에 `merge` 옵션을 추가해, 기존 사용자가 구버전에서 업그레이드해도 누락된 `model` 필드가 `defaultSettings`에서 채워지도록 한다.

```ts
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'user-settings',
    skipHydration: true,
    merge: (persisted, current) => ({
      ...current,
      settings: { ...current.settings, ...(persisted as { settings?: Partial<UserSettings> })?.settings },
    }),
  }
);
```

### 4. `src/components/settings/settings-form.tsx` — UI

`GeneralTab` 내부, API 키(`ApiKeyInput`) 바로 아래에 모델 선택 `<select>` 추가. 기존 "기본 장르" / "기본 톤" 드롭다운과 동일한 스타일.

```tsx
<div>
  <label htmlFor="model-select" className="...">AI 모델</label>
  <p className="...">시놉시스 생성에 사용할 Claude 모델</p>
  <select
    id="model-select"
    value={settings.model}
    onChange={(e) => updateSettings({ model: e.target.value as ModelSlot })}
    className="..."
  >
    {MODELS.map((m) => (
      <option key={m.value} value={m.value}>{m.label}</option>
    ))}
  </select>
</div>
```

### 5. `src/components/create/generation-panel.tsx` — 전달

- `settings.model`을 스토어에서 구독.
- `/api/generate` POST 바디에 `model` 필드 추가.

### 6. `src/app/api/generate/route.ts` — 매핑 + 사용

- 바디에서 `model` 슬롯 파싱.
- `MODELS` 배열에서 매칭해 `apiId` 추출. 매칭 실패 시 `DEFAULT_MODEL`의 `apiId`로 fallback.
- `client.messages.stream({ model: apiId, ... })`.

## 데이터 흐름

```
[설정 페이지]
  select onChange
    → updateSettings({ model: 'haiku-4-5' })
    → zustand persist → localStorage('user-settings')

[생성 페이지]
  useSettingsStore → settings.model
    → POST /api/generate { input, apiKey, promptTemplate, model }

[API 라우트]
  body.model (슬롯) → MODELS 매핑 → apiId
    → Anthropic SDK messages.stream({ model: apiId, ... })
    → ReadableStream 반환
```

## 에러 처리

- **잘못된/누락된 모델 슬롯:** API 라우트에서 `MODELS`에 매칭되지 않으면 `DEFAULT_MODEL`(`sonnet-4-6`)의 `apiId`로 silent fallback. 이는 (a) 클라이언트 버그, (b) 구버전 localStorage 상태, (c) 직접 API를 호출하는 경우를 모두 커버한다.
- **기타 에러:** 기존 처리 유지 (API 키 누락, 제목 누락, Anthropic SDK 에러).

## 마이그레이션

- 기존 사용자: localStorage의 `user-settings`에 `model` 필드가 없음. persist의 `merge` 옵션이 `defaultSettings`와 병합해 자동으로 `sonnet-4-6`으로 채움. 사용자 개입 불필요.
- 신규 사용자: `defaultSettings`에서 `sonnet-4-6`으로 시작.

## 테스트

프로젝트에 테스트 프레임워크가 없으므로 수동 검증:

1. **각 모델 선택 후 생성** — 네트워크 탭에서 요청 바디의 `model` 슬롯 확인, 응답 스트림 정상.
2. **localStorage 클리어 후 첫 생성** — 기본값 `sonnet-4-6`으로 동작.
3. **구버전 설정 주입** (`model` 필드 없는 `user-settings`를 localStorage에 수동 삽입) — hydrate 후 기본값으로 채워지고 정상 생성.
4. **잘못된 슬롯을 API에 직접 POST** — 500이 아니라 Sonnet으로 fallback 동작.

## 열려 있는 질문

없음.
