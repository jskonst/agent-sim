# Feature: Browser-based LLM Settings (API Keys, Model, URL)

## Context

Phaser 3 + TypeScript + Vite game deployed on GitHub Pages.

**Current state:** The `SettingsPanel` (HTML overlay in `src/ui/settingsPanel.ts`) has LLM fields (model, baseUrl, apiKey, maxTokens, temperature). It works, and persists to localStorage. BUT it's only accessible AFTER starting a game — via the ⚙ button in the HUD (`src/ui/hud.ts`). There's no way to configure LLM settings from the main menu screen BEFORE entering a game.

**Goal:** Add a visible "⚙ Настройки LLM" button to the MenuScene so users can configure their API key, model, and provider BEFORE starting a simulation. Also add quick preset buttons for common providers.

## Tasks

### Task 1: Add Settings button to MenuScene

**File:** `src/game/scenes/MenuScene.ts`

Add a "⚙ Настройки LLM" button below the existing "Загрузить конфигурацию" button (which is at y=550). Place the new button at approximately y=620.

The button should open the existing `SettingsPanel`. Since `SettingsPanel` doesn't require a Phaser scene (it creates a DOM overlay), it can be instantiated directly:

```typescript
import { SettingsPanel } from '../../ui/settingsPanel';

// In create():
const settingsBtn = this.add.text(centerX, 620, '⚙ Настройки LLM', {
  fontSize: '18px',
  color: '#ffffff',
  backgroundColor: '#4ecdc4',
  padding: { x: 20, y: 10 }
}).setOrigin(0.5);

settingsBtn.setInteractive()
  .on('pointerdown', () => {
    const panel = new SettingsPanel();
    panel.applySaved();
    panel.show();
  })
  .on('pointerover', () => {
    settingsBtn.setBackgroundColor('#3eb5ac');
  })
  .on('pointerout', () => {
    settingsBtn.setBackgroundColor('#4ecdc4');
  });
```

Make sure to also call `panel.applySaved()` so any saved settings from a previous session are loaded.

### Task 2: Add Provider Preset Buttons to SettingsPanel

**File:** `src/ui/settingsPanel.ts`

In the `render()` method, add quick-preset buttons for common providers. When clicked, they should fill in the Model and Base URL fields automatically. Place these buttons in the LLM section (after the sectionHeader('LLM') line, before the textInput('Model', ...) line).

Add this HTML block:

```typescript
const presetsHtml = `
<div style="display:flex;gap:4px;margin:6px 0 8px;flex-wrap:wrap">
  <button data-preset="openrouter" style="background:#4ecdc4;color:#000;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:11px;font-family:monospace">OpenRouter</button>
  <button data-preset="ollama" style="background:#ecc94b;color:#000;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:11px;font-family:monospace">Ollama</button>
  <button data-preset="zai" style="background:#9b59b6;color:#fff;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:11px;font-family:monospace">z.ai (GLM)</button>
  <button data-preset="openai" style="background:#2ecc71;color:#000;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:11px;font-family:monospace">OpenAI</button>
</div>
`;
```

Insert `${presetsHtml}` right after `${sectionHeader('LLM')}`.

After the overlay is created (after `this.overlay = ...`), attach click handlers:

```typescript
const presets = [
  { key: 'openrouter', model: 'google/gemini-flash-1.5', url: 'https://openrouter.ai/api/v1/chat/completions' },
  { key: 'ollama', model: 'llama3.2', url: 'http://localhost:11434/v1/chat/completions' },
  { key: 'zai', model: 'glm-4.5', url: 'https://api.z.ai/api/paas/v4/chat/completions' },
  { key: 'openai', model: 'gpt-4o-mini', url: 'https://api.openai.com/v1/chat/completions' },
];

presets.forEach(p => {
  const btn = this.overlay.querySelector(`button[data-preset="${p.key}"]`);
  if (btn) {
    btn.addEventListener('click', () => {
      const modelInput = document.getElementById('s_Model') as HTMLInputElement;
      const urlInput = document.getElementById('s_Base_URL') as HTMLInputElement;
      if (modelInput) modelInput.value = p.model;
      if (urlInput) urlInput.value = p.url;
    });
  }
});
```

### Task 3: Show API Key status indicator on MenuScene

**File:** `src/game/scenes/MenuScene.ts`

Below the settings button (or below the title), show whether an API key is configured:

```typescript
import { llmClient } from '../../ai/llmClient';

// In create(), after the settings button:
const hasKey = llmClient.hasApiKey();
const keyStatus = this.add.text(centerX, 670, 
  hasKey ? '🔑 API ключ настроен' : '⚠ API ключ не задан — LLM выключен', 
  {
    fontSize: '14px',
    color: hasKey ? '#48bb78' : '#ecc94b',
  }
).setOrigin(0.5);
```

## Files to Modify

1. `src/game/scenes/MenuScene.ts` — Tasks 1, 3 (add Settings button + API key status)
2. `src/ui/settingsPanel.ts` — Task 2 (add provider preset buttons)

## Constraints

- Do NOT add new npm dependencies
- All UI text in Russian (existing convention)
- The SettingsPanel works without a Phaser scene (it's a pure DOM overlay), so it can be used from MenuScene
- Keep existing code style
- Do NOT change `src/ai/llmClient.ts` — it already has all needed methods

## Verification

1. **TypeScript compiles:**
```bash
npx tsc --noEmit
```

2. **Build succeeds:**
```bash
npm run build
```

3. **Manual check:**
- Open the dev server, on the MENU screen there should be a "⚙ Настройки LLM" button
- Clicking it opens the settings overlay
- The overlay has preset buttons (OpenRouter, Ollama, z.ai, OpenAI) that auto-fill model + URL
- API key status text shows on the menu

4. **After verification, commit and push:**
```bash
git add -A && git commit -m "feat: add LLM settings button to menu, provider presets, API key status" && git push origin main
```
