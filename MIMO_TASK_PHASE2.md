# Фаза 2: LLM-интеграция для агентов

## Контекст

Agent Sim — 2D офис с 15 агентами. Агенты двигаются по расписанию, есть UI (панель, лог, статистика).
Теперь нужно, чтобы агенты "думали" и "общались" через LLM.

## Директория

Работаем в /home/jskonst/projects/agent-sim/

## Архитектура

- **LLM-клиент:** OpenRouter API (GPT-4o-mini) через fetch
- **Триггеры:** встреча агентов, смена активности, кризис, конец дня
- **Кеш:** MD5 от контекста → ответ (TTL 5 мин игрового времени)
- **Fallback:** если нет API ключа или ошибка — агенты делают рандомное действие
- **Лимиты:** макс 10 запросов/мин, при превышении — fallback

## Что создать

### 1. src/ai/llmClient.ts — LLM-клиент

```typescript
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface LLMConfig {
  apiKey?: string;           // Берется из localStorage или .env
  model: string;             // 'openai/gpt-4o-mini'
  maxTokens: number;         // 200
  temperature: number;       // 0.8
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  action: string;                           // "work" | "talk" | "rest" | "eat" | "socialize"
  dialogue?: { text: string; emotion: string };
  moodChange: number;                       // -10..+10
  relationshipChanges: Record<string, number>;  // agentId → delta
  thoughts: string;                         // Внутренний монолог для отображения
}

class LLMClient {
  private config: LLMConfig;

  constructor() {
    // Пытаться загрузить apiKey из localStorage
    // Если нет — вернуть fallback
  }

  async generate(prompt: LLMMessage[]): Promise<LLMResponse | null> {
    // Если нет apiKey — вернуть null (использовать fallback)
    // POST к OpenRouter
    // Распарсить JSON из ответа (с try/catch на случай если LLM вернёт не JSON)
    // Вернуть LLMResponse
  }

  setApiKey(key: string): void {
    // Сохранить в localStorage
  }

  hasApiKey(): boolean {
    return !!this.config.apiKey;
  }
}

export const llmClient = new LLMClient();
```

### 2. src/ai/prompts.ts — System prompts

```typescript
export function buildSystemPrompt(agent: AgentProfile, state: AgentState): string {
  return `Ты — ${agent.name}, ${agent.role} в офисе.

ТВОЙ ХАРАКТЕР:
- Харизма: ${agent.stats.charisma}/10
- Трудолюбие: ${agent.stats.industriousness}/10
- Общительность: ${agent.stats.sociability}/10
- Эмоциональная стабильность: ${agent.stats.emotionalStability}/10

ТЕКУЩЕЕ СОСТОЯНИЕ:
- Локация: ${state.location}
- Активность: ${state.activity}
- Настроение: ${state.mood}/100
- Энергия: ${state.energy}/100

ТВОИ ЦЕЛИ: ${agent.goals.join(', ')}

ПОСЛЕДНИЕ СОБЫТИЯ:
${state.memory.slice(-5).map(e => `- ${e.description}`).join('\n')}

ОТНОШЕНИЯ С КОЛЛЕГАМИ:
${Object.entries(state.relationships || {})
  .map(([id, val]) => `- ${id}: ${val} (${val > 10 ? 'друг' : val < -10 ? 'неприязнь' : 'нейтрально'})`)
  .join('\n')}

ОТВЕТЬ ТОЛЬКО JSON:
{
  "action": "work|talk|rest|eat|socialize",
  "dialogue": { "text": "что говоришь (1 фраза)", "emotion": "neutral|happy|sad|angry" },
  "moodChange": -5..+5,
  "relationshipChanges": { "agent_id": -10..+10 },
  "thoughts": "мысль (1 фраза)"
}

ВАЖНО:
- Отвечай ТОЛЬКО JSON, без пояснений
- Действие должно соответствовать локации (в kitchen — eat/rest, в open_space — work, в corridor — move/socialize)
- Если энергия < 20 — выбери rest или eat
- Диалог — 1 короткая фраза на русском
- Мысли — 1 фраза, отражает внутреннее состояние`;
}

export function buildInteractionPrompt(agent: AgentProfile, otherAgent: AgentProfile, context: string): LLMMessage[] {
  const system = buildSystemPrompt(agent, agentState);
  const user = `Ты встретил ${otherAgent.name} (${otherAgent.role}) в ${context}. 
Что ты делаешь/говоришь? Учти ваши отношения и свой характер.`;
  
  return [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];
}
```

### 3. src/ai/cache.ts — Кеш LLM-ответов

```typescript
export class LLMCache {
  private cache: Map<string, { response: LLMResponse; timestamp: number }> = new Map();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 минут реального времени

  getKey(agentId: string, hour: number, location: string, activity: string): string {
    return md5(`${agentId}:${hour}:${location}:${activity}`);
  }

  get(key: string): LLMResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  set(key: string, response: LLMResponse): void {
    this.cache.set(key, { response, timestamp: Date.now() });
    // Очистка старых записей при превышении 200
    if (this.cache.size > 200) {
      const oldest = [...this.cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) this.cache.delete(oldest[0]);
    }
  }
}

export const llmCache = new LLMCache();
```

### 4. src/ai/triggers.ts — Триггеры

```typescript
export class LLMTriggerSystem {
  private lastTriggerTime: Map<string, number> = new Map();  // agentId → last tick
  private readonly MIN_TICKS_BETWEEN_TRIGGERS = 10;  // минимум 10 тиков между запросами для одного агента
  
  // Проверить, нужно ли сделать LLM-запрос для агента
  shouldTrigger(agent: Agent, otherAgents: Agent[], tick: number): TriggerType | null {
    const lastTick = this.lastTriggerTime.get(agent.state.id) || 0;
    if (tick - lastTick < this.MIN_TICKS_BETWEEN_TRIGGERS) return null;
    
    // 1. Встреча — другой агент в той же зоне
    const othersHere = otherAgents.filter(a => 
      a.state.location === agent.state.location && a.state.id !== agent.state.id
    );
    if (othersHere.length > 0 && Math.random() < 0.3) {
      this.lastTriggerTime.set(agent.state.id, tick);
      return { type: 'meeting', data: { otherAgent: othersHere[0] } };
    }
    
    // 2. Смена активности
    if (agent.getActivityChange()) {
      this.lastTriggerTime.set(agent.state.id, tick);
      return { type: 'activity_change', data: { activity: agent.state.activity } };
    }
    
    // 3. Кризис — энергия < 20 или настроение < 20
    if (agent.state.energy < 20 || agent.state.mood < 20) {
      this.lastTriggerTime.set(agent.state.id, tick);
      return { type: 'crisis', data: { energy: agent.state.energy, mood: agent.state.mood } };
    }
    
    // 4. Конец дня (18:00)
    if (agent.state.hour === 18 && agent.state.minute === 0) {
      this.lastTriggerTime.set(agent.state.id, tick);
      return { type: 'end_of_day', data: {} };
    }
    
    return null;
  }
}
```

### 5. src/ai/rateLimiter.ts — Rate limiter

```typescript
export class RateLimiter {
  private calls: number[] = [];
  private readonly MAX_CALLS = 10;
  private readonly WINDOW_MS = 60000;

  canCall(): boolean {
    const now = Date.now();
    this.calls = this.calls.filter(t => now - t < this.WINDOW_MS);
    return this.calls.length < this.MAX_CALLS;
  }

  recordCall(): void {
    this.calls.push(Date.now());
  }
}

export const rateLimiter = new RateLimiter();
```

### 6. Обновить Agent.ts

Добавить в Agent:
- `state.memory: Event[]` — последние 10 событий
- `state.mood: number` (0-100) — уже есть как state.mood
- `state.energy: number` (0-100) — уже есть
- `state.relationships: Record<string, number>` — отношения к другим агентам
- `state.thoughts: string` — текущая мысль (для отображения в панели)
- `state.hour: number` — текущий час

В Agent.update() после обработки расписания:
1. Проверить триггеры через LLMTriggerSystem
2. Если триггер сработал и rateLimiter позволяет:
   - Построить промпт
   - Проверить кеш
   - Если нет в кеше — вызвать LLM
   - Если LLM вернул null (нет ключа/ошибка) — использовать fallback (рандом)
3. Применить результат: изменить mood, energy, relationships
4. Сохранить событие в memory
5. Обновить thoughts

### 7. API key UI

Добавить в HUD или отдельную панель ввод API ключа.
В src/ui/hud.ts добавить:

```typescript
// Внизу HUD, если ключ не задан:
this.apiKeyInput = scene.add.text(16, 140, '[Set OpenRouter API Key]', {
  fontSize: '12px', color: '#ecc94b'
}).setScrollFactor(0).setDepth(100).setInteractive();

this.apiKeyInput.on('pointerdown', () => {
  const key = prompt('Enter OpenRouter API key:');
  if (key) llmClient.setApiKey(key);
});
```

### 8. Fallback-поведение (без LLM)

Если LLM недоступен, агент:
- При встрече: рандомно выбрать "поговорить" (30%) или "пройти мимо" (70%)
- При смене активности: следовать расписанию (как сейчас)
- При кризисе: идти в kitchen есть или отдыхать
- Mood/energy меняется по базовым формулам (как сейчас)

## Проверка

- `npx tsc --noEmit` — без ошибок
- Если API ключа нет — агенты работают в fallback-режиме (не ломаются)
- Если API ключ есть — агенты делают LLM-запросы по триггерам
- Кеш не даёт делать повторные запросы
- Rate limiter не даёт превысить 10 запросов/мин

## Важно

- LLM-запросы ТОЛЬКО по триггерам, не каждый тик
- API ключ в localStorage, не в коде
- Падение LLM (ошибка, таймаут) не ломает симуляцию — fallback
- md5 хеш для кеша — использовать простую функцию (не тащить библиотеку)