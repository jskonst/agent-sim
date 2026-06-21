# ARCHITECTURE.md — Agent Sim

## 1. Сеттинг: Небольшой городок

**Обоснование:**
- Больше свободы для творчества (3 сценария: средневековье, современный, фантастика)
- Естественные локации с разными активностями
- 10-15 агентов合理но распределены по городку
- Конфигурации можно сохранять/загружать

**3 сценария:**

### Сценарий 1: Средневековый городок
**Локации (10):**
- `town_hall` — Ратуша (управление, совет старейшин)
- `tavern` — Таверна (еда, отдых, слухи)
- `market` — Рынок (торговля, новости)
- `blacksmith` — Кузница (ремонт, инструменты)
- `temple` — Храм (исцеление, молитвы)
- `farm` — Ферма (урожай, работа)
- `house_1` — Дом селянина (жильё)
- `house_2` — Дом ремесленника (жильё)
- `fountain` — Фонтан (сборы, встречи)
- `castle_gate` — Ворота замка (охрана, вход/выход)

**Агенты (10):**
1. `mayor` — Мэр (официальное лицо, в ратуше)
2. `merchant` — Торговец (на рынке, в таверне)
3. `blacksmith` — Кузнец (в кузнице)
4. `priest` — Жрец (в храме)
5. `farmer` — Фермер (на ферме)
6. `guard` — Охранник (у ворот, патрулирует)
7. `bard` — Бард (в таверне, фонтан)
8. `stranger` — Странник (где угодно)
9. `peasant` — Селянин (ферма, дом)
10. `apprentice` — Ученик (с ментором)

### Сценарий 2: Современный пригород
**Локации (10):**
- `city_hall` — Мэрия (администрация)
- `supermarket` — Супермаркет (продукты)
- `cafe` — Кафе (еда, встречи)
- `auto_repair` — Автосервис (ремонт)
- `park` — Парк (отдых, прогулки)
- `school` — Школа (обучение)
- `house_1` — Дом семьи (жильё)
- `house_2` — Квартира (жильё)
- `bus_stop` — Автобусная остановка (транспорт)
- `community_center` — Общественный центр (мероприятия)

**Агенты (10):**
1. `mayor` — Мэр (в мэрии)
2. `cashier` — Кассир (в супермаркете)
3. `chef` — Повар (в кафе)
4. `mechanic` — Механик (в автосервисе)
5. `teacher` — Учитель (в школе)
6. `student` — Школьник (школа, дом)
7. `senior` — Пенсионер (парк, дом)
8. `entrepreneur` — Предприниматель (кафе, общественный центр)
9. `taxi_driver` — Таксист (где угодно)
10. `athlete` — Спортсмен (парк, спортзал)

### Сценарий 3: Фантастическая станция
**Локации (10):**
- `command_center` — Командный центр (управление)
- `medbay` — Медбей (исцеление)
- `bar` — Бар (отдых, встречи)
- `cargo_dock` — Грузовой док (торговля)
- `research_lab` — Исследования (наука)
- `living_quarters_1` — Жилой модуль (жильё)
- `living_quarters_2` — Жилой модуль (жильё)
- `corridors` — Коридоры (перемещение)
- `hangar` — Ангар (корабли)
- `security_station` — Служба безопасности (охрана)

**Агенты (10):**
1. `commander` — Командир (в командном центре)
2. `doctor` — Врач (в медбее)
3. `bartender` — Бармен (в баре)
4. `cargo_worker` — Грузчик (в доке)
5. `scientist` — Учёный (в лаборатории)
6. `engineer` — Инженер (в ангаре, жилых модулях)
7. `diplomat` — Дипломат (в командном центре, жилых модулях)
8. `passenger` — Пассажир (где угодно)
9. `security_officer` — Офицер безопасности (на посту, патрулирует)
10. `ai_system` — AI-системы (везде, виртуальный агент)

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
- **Конфигурации:** JSON-файлы (скачать/загрузить)
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
├── MIMO_TASK_PHASE0.md
├── MIMO_TASK_PHASE1.md
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
│   │   │   ├── MenuScene.ts     # Scenario selection menu
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
│   │   ├── maps/
│   │   │   ├── medieval.ts      # Medieval town map
│   │   │   ├── modern.ts        # Modern suburb map
│   │   │   └── scifi.ts         # Sci-fi station map
│   │   └── config/
│   │       └── scenarios.ts     # Scenario definitions
│   │
│   ├── ai/
│   │   ├── llmClient.ts         # OpenRouter API calls
│   │   ├── prompts.ts           # System prompts
│   │   ├── cache.ts             # Response cache
│   │   └── triggers.ts          # LLM trigger conditions
│   │
│   ├── data/
│   │   ├── medieval_agents.ts   # Medieval scenario agents
│   │   ├── modern_agents.ts     # Modern scenario agents
│   │   ├── scifi_agents.ts      # Sci-fi scenario agents
│   │   └── schedules.ts         # Default schedules
│   │
│   └── ui/
│       ├── hud.ts               # Top HUD (time, location)
│       ├── agentPanel.ts        # Selected agent panel
│       ├── eventLog.ts          # Event feed
│       ├── stats.ts             # Statistics panel
│       └── scenarioMenu.ts      # Scenario selection UI
│
├── public/
│   ├── assets/
│   │   ├── tiles/
│   │   └── sprites/
│   └── configs/                 # User configs
│
└── server/                      # Go backend (optional)
    ├── main.go
    ├── handlers/
    └── embed.go
```

---

## 4. Схема данных (типы)

### ScenarioConfig
```typescript
interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  scenario: 'medieval' | 'modern' | 'scifi';

  map: {
    width: number;
    height: number;
    tileSize: number;
    tiles: TileType[][];
  };

  locations: LocationConfig[];
  agents: AgentProfile[];
  time: {
    startHour: number;
    tickRate: number;  // minutes per tick
  };
}

interface TileType {
  walkable: boolean;
  locationId?: string;
  type: 'floor' | 'wall' | 'door' | 'special';
}

interface LocationConfig {
  id: string;
  name: string;
  description: string;
  x: number;           // tile coordinates
  y: number;
  width: number;
  height: number;
}
```

### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  role: string;        // "mayor", "merchant", etc.

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
Ты — {name}, {role} в городе.
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

### Меню выбора сценария
```
┌──────────────────────────────────────────────┐
│        Agent Sim - Выберите сценарий        │
├──────────────────────────────────────────────┤
│                                              │
│  🏰 Средневековый городок                    │
│  Рынок, таверна, кузница, храм...            │
│                                              │
│  🏢 Современный пригород                     │
│  Мэрия, супермаркет, кафе, парк...           │
│                                              │
│  🚀 Фантастическая станция                   │
│  Командный центр, медбей, ангар...           │
│                                              │
│  📁 Загрузить конфигурацию                   │
│  ⬇️ Скачать конфигурацию                      │
│                                              │
│  [Старт]                                     │
└──────────────────────────────────────────────┘
```

### Основной экран
```
┌──────────────────────────────────────────────────────┐
│ 🕐 14:30  │  📍 Market  │  👤 3 agents nearby       │
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
│ 👤 Alice (Merchant)            │
├─────────────────────────────────┤
│ Настроение: ████████░░ 80%      │
│ Энергия:   ██████░░░░ 60%      │
│                                 │
│ 📍 Market                       │
│ 💼 working                      │
│                                 │
│ 💭 "Нужно продать те специи..." │
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

### Фаза 0: Каркас (готово)
- [x] Инициализация Vite + Phaser + TypeScript
- [x] Базовая сцена с камерой
- [x] Простая карта (тайлы пола/стен)
- [x] Игрок-спрайт с WASD движением
- [x] Базовый HUD (время, локация)

### Фаза 1: Агенты и сценарии (2-3 дня) — ТЕКУЩАЯ
- [ ] Меню выбора сценария
- [ ] 3 сценария (средневековье, современный, фантастика)
- [ ] 10 агентов для каждого сценария
- [ ] Тайловые карты для каждого сценария
- [ ] Класс Agent с состоянием
- [ ] A* pathfinding
- [ ] Расписания (work/eat/rest)
- [ ] Автономное движение агентов
- [ ] Система сохранения/загрузки конфигураций (JSON)

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
- [ ] Уточнённые расписания для каждого сценария
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
- 10-15 агентов (не 100)
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
- ~10 агентов × 10 запросов/день × $0.0003/запрос = $0.03/день
- При активных диалогах: ~$0.10/день
- Максимум: $0.30/день

---

## 10. Решения по дизайну

| Вопрос | Решение | Обоснование |
|--------|---------|-------------|
| Go или Python? | **Go** | Один бинарник, embed статики, знакомо (b5-game) |
| Tiled или генерация? | **Tiled** | Визуальный редактор, JSON-формат, легко редактировать |
| Какой LLM? | **GPT-4o-mini** | Дёшево, быстро, достаточно для ролей |
| WebSocket или polling? | **WebSocket** | Real-time, меньше latency |
| IndexedDB или localStorage? | **IndexedDB** | Больше места, async API, структурированные данные |
| 3 сценария или 1? | **3 сценария** | Больше свободы, эксперименты с сеттингами |
| JSON конфигурации? | **Да** | Простой формат, скачать/загрузить, редактировать |