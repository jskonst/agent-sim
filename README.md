# Agent Sim

2D-симуляция офиса с AI-агентами. Наблюдай, как 15 сотрудников живут своей жизнью: работают, обедают, общаются, отдыхают. Построен на Phaser 3.

## Запуск

```bash
git clone https://github.com/jskonst/agent-sim
cd agent-sim
npm install
npm run dev
# Открыть http://localhost:3000
```

## Управление

| Клавиша | Действие |
|---------|----------|
| WASD / Стрелки | Перемещение по офису |
| Колёсико мыши | Зум (0.5×–2×) |
| Клик по агенту | Показать информацию |
| Tab | Переключение между агентами (режим наблюдения) |
| Esc | Выйти из режима наблюдения |

## Интерфейс

- **Левая панель:** HUD — время, текущая локация, кол-во агентов
- **Клик/Tab:** Панель агента — имя, роль, настроение, энергия, активность
- **Слева внизу:** Лог событий (кто куда пошёл, что делает)
- **Справа внизу:** Статистика офиса (среднее настроение, энергия, занятость)

## Проект — структура

```
agent-sim/
├── src/
│   ├── main.ts                  # Точка входа
│   ├── game/
│   │   ├── config.ts            # Phaser config
│   │   ├── scenes/
│   │   │   ├── BootScene.ts     # Загрузка
│   │   │   └── GameScene.ts     # Основная сцена (353 строк)
│   │   ├── entities/
│   │   │   └── Agent.ts         # Агент: состояние, движение, highlight (230 строк)
│   │   └── systems/
│   │       ├── MovementSystem.ts  # A* pathfinding (169 строк)
│   │       └── ScheduleSystem.ts  # Расписания агентов
│   ├── data/
│   │   ├── agents.ts            # 15 профилей агентов (291 строка)
│   │   └── schedules.ts         # Шаблоны расписаний
│   └── ui/
│       ├── hud.ts               # HUD (время, локация, кол-во)
│       ├── agentPanel.ts        # Панель информации об агенте
│       ├── eventLog.ts          # Лог событий
│       └── statsPanel.ts        # Статистика офиса
├── ARCHITECTURE.md              # Архитектура проекта
└── MIMO_TASK_*.md              # Задания для MiMo Code
```

## Как добавить нового агента

Открой `src/data/agents.ts` и добавь объект в массив `AGENTS`:

```typescript
{
  id: 'new_agent',
  name: 'Имя',
  role: 'developer',              // developer | manager | hr | designer | qa | intern | devops
  avatar: 'cyan',                 // green | blue | red | purple | orange | yellow | pink | cyan
  stats: {
    charisma: 7,
    industriousness: 8,
    sociability: 5,
    emotionalStability: 6,
  },
  schedule: SCHEDULES.developer,  // Из src/data/schedules.ts
  relationships: {
    sarah: 10,                    // начальное отношение к другим агентам
    bob: -5,
  },
  goals: ['Стать лучшим разработчиком'],
}
```

**Цвета аватаров:**
- `green` `blue` `red` `purple` `orange` `yellow` `pink` `cyan`
- Каждому цвету соответствует hex-код в `COLORS` объекте внутри `agents.ts`

## Расписания

Шаблоны в `src/data/schedules.ts`:

| Шаблон | Кому подходит |
|--------|--------------|
| `developer` | Разработчики, QA |
| `manager` | Менеджеры, SCRUM |
| `hr` | HR, рекрутеры |
| `devops` | DevOps, админы |
| `intern` | Стажёры (ходит за ментором) |

Расписание — массив `{ startHour, endHour, activity, preferredZones }`. Можно гибко настраивать.

## Память агентов

В текущей версии у агентов **нет долгосрочной памяти**. Они помнят только:
- Текущую зону и активность
- Предыдущую зону (для логирования перемещений)

Полноценная память (последние 10 событий, отношения, диалоги) появится после подключения LLM.

## Технологии

- **Phaser 3** — 2D движок
- **Vite + TypeScript** — сборка
- **A*** — pathfinding (собственная реализация, без библиотек)
- **OpenRouter + Gemini Flash Lite** — LLM (дёшево, ~$0.01/день)

## Разработка

```bash
# Сборка
npm run build

# Проверка типов
npx tsc --noEmit

# Production preview
npm run preview
```

## Лицензия

MIT