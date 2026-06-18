# Добавить UI для настройки LLM URL в HUD

## Контекст

Agent Sim. LLM-клиент поддерживает смену baseUrl через `llmClient.setBaseUrl(url)`.
URL сохраняется в localStorage. Но UI для его смены нет — только через консоль.

## Задача

Добавить в HUD кнопку для настройки URL LLM (рядом с кнопкой API-ключа).

## Файлы

### src/ai/llmClient.ts
Уже есть setBaseUrl() и getBaseUrl() — добавить метод getBaseUrl():
```typescript
getBaseUrl(): string {
  return this.config.baseUrl;
}
```

### src/ui/hud.ts
Добавить рядом с кнопкой API-ключа вторую кнопку:
- Текст: по умолчанию "[OpenRouter]" или название текущего URL (обрезанное)
- По клику: prompt('Enter LLM API base URL:')
- Сохранить через llmClient.setBaseUrl(url)
- Обновить текст кнопки

Расположение:
- Строка 1: "[Set OpenRouter API Key]" (уже есть)
- Строка 2: "[URL: openrouter.ai]" (новая — показывает только хост, без протокола и путей)
- После ввода нового URL: кнопка показывает хост нового URL

## Проверка

```bash
npx tsc --noEmit
```