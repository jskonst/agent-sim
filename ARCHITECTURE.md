# ARCHITECTURE.md — Agent Sim

## 1. Сеттинг: Офисный этаж (Option B)

**Обоснование:**
- Удобство тайловой карты: прямоугольные комнаты, коридоры, двери
- Естественные зоны с разными активностями (open space → работа, кухня → еда, переговорки →meetings)
- 10-20 агентов合理но распределены по этажу
- Наблюдение интересно: агенты работают, обедают, болтают у кофемашины

**Локации:**
```
┌─────────────────────────────────────────┐
│  reception │  open_space_1 │  open_space_2 │
│            │               │              │
├────────────┼───────────────┼──────────────┤
│  meeting_1 │   corridor    │  meeting_2   │
├────────────┼───────────────┼──────────────┤
│  kitchen   │   corridor    │  office_cow  │
├────────────┼───────────────┼──────────────┤
│  wc_m      │   corridor    │  wc_f        │
└─────────────────────────────────────────┘
```

**Зоны и их описание для LLM:**
- `reception`: "Ресепшен у входа. Охранник сидит здесь. Гости ждут."
- `open_space_1/2`: "Рабочие столы. Тут работают сотрудники."
- `meeting_1/2`: "Переговорки для совещаний."
- `kitchen`: "Кухня. Кофемашина, микроволновка. Место для отдыха."
- `corridor`: "Коридор. Люди ходят из комнаты в комнату."
- `office_cow`: "Кабинет руководителя. Рабочий стол, стул."
- `wc_m/wc_f`: "Туалеты."

---

## 2. Технический стек

### Frontend
- **Движок:** Phaser.js 3
- **Сборка:** Vite + TypeScript
- **Карта:** Tiled (JSON) или программная генерация
- **Рендеринг:** Canvas/WebGL через Phaser

### Backend (опционально)
- **Язык:** Go
- **Причина:** Один бинарник, embed статики, familiar (b5-game опыт)
- **Роль:** 
  - API для LLM-запросов (проксирует OpenRouter)
  - Запуск симуляции (tick loop)
  - WebSocket для real-time обновлений

### Хранение
- **IndexedDB:** Состояния агентов, логи, настройки
- **Память агента:** Последние 10 significant events (in-memory + IndexedDB)

### LLM
- **Провайдер:** OpenRouter API
- **Модель:** GPT-4o-mini (дёшево, быстро)
- **Кеш:** MD5 от prompt → response (повторяющиеся ситуации)

---

## 3. Структура проекта

```
agent-sim/
├── ARCHITECTURE.md
├── TASK_ARCHITECTURE.md
├── package.json
├── tsconfig.json
├── vite.config.ts
│
├── src/
│   ├── main.ts                  # Entry point
│   ├── game/
│   │   ├── config.ts            # Phaser config
│   │   ├── scenes/
│   │   │   ├── Boot.ts
│   │   │   ├── GameWorld.ts     # Main game scene
│   │   │   └── UI.ts            # UI overlay scene
│   │   ├── entities/
│   │   │   ├── Agent.ts         # Agent sprite + state
│   │   │   ├── Player.ts        # Player character
│   │   │   └── objects/         # Interactive objects
│   │   ├── systems/
│   │   │   ├── TickSystem.ts    # Simulation tick
│   │   │   ├── MovementSystem.ts
│   │   │   ├── InteractionSystem.ts
│   │   │   └── ScheduleSystem.ts
│   │   └── maps/
│   │       └── office.ts        # Map definition
│   │
│   ├── ai/
│   │   ├── llmClient.ts         # OpenRouter API calls
│   │   ├── prompts.ts           # System prompts
│   │   ├── cache.ts             # Response cache
│   │   └── triggers.ts          # LLM trigger conditions
│   │
│   ├── data/
│   │   ├── agents.ts            # Agent definitions
│   │   ├── schedules.ts         # Default schedules
│   │   └── relationships.ts     # Initial relationships
│   │
│   └── ui/
│       ├── hud.ts               # Top HUD (time, location)
│       ├── agentPanel.ts        # Selected agent panel
│       ├── eventLog.ts          # Event feed
│       └── stats.ts             # Statistics panel
│
├── public/
│   ├── assets/
│   │   ├── tiles/
│   │   └── sprites/
│   └── maps/
│       └── office.json          # Tiled map
│
└── server/                      # Go backend (optional)
    ├── main.go
    ├── handlers/
    └── embed.go
```

---

## 4. Схема данных (типы)

### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  role: string;                    // "developer", "manager", "hr"
  
  // Характеристики (1-10)
  stats: {
    charisma: number;
    industriousness: number;
    sociability: number;
    emotionalStability: number;
  };
  
  // Текущее состояние
  state: {
    location: string;              // Zone ID
    activity: string;              // "working", "resting", "chatting"
    mood: number;                  // 0-100
    energy: number;                // 0-100
    x: number;                     // Tile coords
    y: number;
  };
  
  // Память (последние события)
  memory: Event[];
  
  // Расписание
  schedule: ScheduleEntry[];
  
  // Отношения
  relationships: Map<string, number>;  // agentID → disposition (-100..100)
  
  // Долгосрочные цели
  goals: string[];
}
```

### ScheduleEntry
```typescript
interface ScheduleEntry {
  startHour: number;               // 0-23
  endHour: number;
  activity: string;
  preferredLocations: string[];    // Zone IDs
  requiredEnergy?: number;         // Минимум энергии для активности
}
```

### Event
```typescript
interface Event {
  id: string;
  timestamp: number;              // Tick number
  type: 'movement' | 'interaction' | 'decision' | 'llm';
  agents: string[];               // Participating agent IDs
  location: string;
  description: string;            // Для LLM-контекста
  data?: any;                     // Доп. данные (диалог, решение)
}
```

### LLMResponse
```typescript
interface LLMResponse {
  action: string;                 // "work", "talk", "rest", "eat"
  dialogue?: {
    text: string;
    emotion: string;              // "neutral", "happy", "angry"
  };
  moodChange: number;             // -10..+10
  relationshipChanges: Map<string, number>;  // agentID → delta
  thoughts?: string;              // Внутренний монолог
}
```

---

## 5. Архитектура тик-системы

### Константы
```typescript
const TICK_DURATION_MS = 1000;      // 1 сек реального времени
const GAME_MINUTES_PER_TICK = 5;    // 5 минут игрового времени
const TICKS_PER_DAY = 288;          // 24 * 60 / 5
const DAY_START_HOUR = 9;           // Рабочий день 9:00
const DAY_END_HOUR = 18;            // до 18:00
```

### Tick Loop
```
┌─────────────────────────────────────────────┐
│              MAIN TICK LOOP                  │
├─────────────────────────────────────────────┤
│ 1. Update game time                         │
│    └─ currentTick++ → gameTime = DAY_START + tick * GAME_MINUTES_PER_TICK │
│                                             │
│ 2. Update agent positions                   │
│    └─ For each agent: move toward target    │
│                                             │
│ 3. Check interactions                       │
│    └─ If two agents in same zone → trigger  │
│                                             │
│ 4. Check schedules                          │
│    └─ If schedule says change activity →    │
│       update target location/activity       │
│                                             │
│ 5. Update states                            │
│    └─ energy -= 0.1 (passive drain)         │
│    └─ mood += location_mood_bonus           │
│                                             │
│ 6. Check LLM triggers                       │
│    └─ If event matches trigger → queue LLM  │
│                                             │
│ 7. Emit updates (WebSocket or polling)      │
└─────────────────────────────────────────────┘
```

### Movement System
- Агенты перемещаются по тайлам
- A* pathfinding (Phaser или простой BFS)
- Скорость: 1 tile per 2 ticks (10 game minutes)
- При достижении цели → смена activity

---

## 6. LLM-интеграция

### Триггеры для LLM-запросов

| Триггер | Условие | Что генерируется |
|---------|---------|-------------------|
| Встреча | 2+ агента в одной зоне | Диалог + изменение отношений |
| Смена активности | Расписание требует смену | Решение: куда идти, чем заняться |
| Конец дня | Tick = END_HOUR | Рефлексия: что запомнить |
| Кризис | energy < 20% или mood < 20% | Решение: что делать |
| Скука | activity > 30 тиков без变化 | Выбор новой активности |

### System Prompt для агента
```
Ты — {name}, {role} в офисе.
Характер: {charisma}/10 харизма, {industriousness}/10 трудолюбие
Текущее место: {location}
Настроение: {mood}/100, Энергия: {energy}/100

Последние события:
{last_5_events}

Отношения с коллегами:
{relationships_summary}

Ответь JSON:
{
  "action": "work|talk|rest|eat",
  "dialogue": { "text": "...", "emotion": "..." },
  "moodChange": -5..+5,
  "relationshipChanges": { "agent_id": -10..+10 },
  "thoughts": "Внутренний монолог"
}
```

### Кеширование
```typescript
// MD5 от контекста → ответ
const cacheKey = md5(JSON.stringify({
  agentId,
  location,
  activity,
  lastEvents: events.slice(-3),
  hour: gameTime.hour
}));

// TTL = 5 минут игрового времени
```

### Лимиты
- Максимум 10 LLM-запросов в минуту (rate limit)
- При превышении → агенты используют fallback (рандомное действие)
- Бюджет: ~$0.50/день при 15 агентах

---

## 7. UI/UX

### Основной экран
```
┌──────────────────────────────────────────────────────┐
│ 🕐 14:30  │  📍 Open Space 1  │  👤 5 agents nearby │
├──────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────┐    ┌─────────┐                        │
│   │ Agent A │    │ Agent B │    ← Спрайты агентов   │
│   └─────────┘    └─────────┘                        │
│        ↕ movement ↕                                  │
│   ════════════════════════════  ← Тайлы пола         │
│                                                      │
│   ┌────────────────────────────────────────────────┐ │
│   │ EVENT LOG                                      │ │
│   │ 14:25 - Alice начала работать                  │ │
│   │ 14:20 - Bob и Charlie поговорили              │ │
│   │ 14:15 - День начался                           │ │
│   └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Панель агента (по клику)
```
┌─────────────────────────────────┐
│ 👤 Alice (Developer)            │
├─────────────────────────────────┤
│ Настроение: ████████░░ 80%      │
│ Энергия:   ██████░░░░ 60%      │
│                                 │
│ 📍 Open Space 1                 │
│ 💼 working                      │
│                                 │
│ 💭 "Надо доделать API..."       │
│                                 │
│ 🤝 Отношения:                   │
│   Bob: +15 (друг)               │
│   Charlie: -5 (нейтрально)      │
│   Diana: +30 (лучший друг)      │
└─────────────────────────────────┘
```

### Управление игроком
- WASD/стрелки — перемещение по миру
- Клик по агенту — выбрать/отследить
- Tab — переключение между агентами
- Esc — сброс выбора, камера следует за игроком

### Камера
- По умолчанию: следует за игроком
- Режим наблюдения: следует за выбранным агентом
- Зум: колесо мыши (min 0.5, max 2)

---

## 8. Пофазный план реализации

### Фаза 0: Каркас (1-2 дня)
- [ ] Инициализация Vite + Phaser + TypeScript
- [ ] Базовая сцена с камерой
- [ ] Простая карта (тайлы пола/стен)
- [ ] Игрок-спрайт с WASD движением
- [ ] Базовый HUD (время, локация)

### Фаза 1: Агенты (2-3 дня)
- [ ] Класс Agent с состоянием
- [ ] Тайловая карта (Tiled или генерация)
- [ ] A* pathfinding
- [ ] Расписания (work/eat/rest)
- [ ] Автономное движение агентов

### Фаза 2: LLM-агенты (3-4 дня)
- [ ] OpenRouter API клиент
- [ ] System prompts для ролей
- [ ] Триггеры (встреча, смена активности)
- [ ] Кеширование ответов
- [ ] Интеграция с Agent.state

### Фаза 3: UI (2-3 дня)
- [ ] Панель агента (по клику)
- [ ] Лог событий
- [ ] Режим наблюдения (камера за агентом)
- [ ] Статистика (среднее настроение, кол-во взаимодействий)

### Фаза 4: Контент (2-3 дня)
- [ ] 15 агентов с характеристиками
- [ ] 5 расписаний (разные роли)
- [ ] Начальные отношения
- [ ] Сбалансировка LLM-триггеров

### Фаза 5: Игрок-наблюдатель (1-2 дня)
- [ ] Выбор агента (Tab/клик)
- [ ] Камера следует за агентом
- [ ] Отображение мыслей/статуса в реальном времени
- [ ] (Опционально) Вмешательство: изменить расписание агента

### Фаза 6: Анализ (1-2 дня)
- [ ] Граф отношений (визуализация)
- [ ] Дневники агентов (что произошло за день)
- [ ] Экспорт логов

---

## 9. Ограничения и оптимизации

### Ограничения
- 10-20 агентов (не 100)
- LLM-запросы только по триггерам (не каждый тик)
- Дёшево: GPT-4o-mini, кеш, rate limiting
- Один разработчик в свободное время
- Браузерное SPA, без сервера (Go опционален)

### Оптимизации
- **Кеш LLM:** MD5(prompt) → response, TTL 5 мин
- **Batch updates:** Отправка обновлений через WebSocket раз в 5 тиков
- **Lazy loading:** Загрузка спрайтов только видимых зон
- **Оффлайн:** IndexedDB для состояний, можно закрыть вкладку

### Бюджет LLM
- ~15 агентов × 10 запросов/день × $0.0003/запрос = $0.045/день
- При активных диалогах: ~$0.15/день
- Максимум: $0.50/день

---

## 10. Решения по дизайну

| Вопрос | Решение | Обоснование |
|--------|---------|-------------|
| Go или Python? | **Go** | Один бинарник, embed статики, знакомо (b5-game) |
| Tiled или генерация? | **Tiled** | Визуальный редактор, JSON-формат, легко редактировать |
| Какой LLM? | **GPT-4o-mini** | Дёшево, быстро, достаточно для ролей |
| WebSocket или polling? | **WebSocket** | Real-time, меньше latency |
| IndexedDB или localStorage? | **IndexedDB** | Больше места, async API, структурированные данные |
