# Фаза 1: Агенты, сценарии и конфигурации

## Контекст

Agent Sim — 2D городок с AI-агентами. Phaser 3 каркас готов:
- WASD игрок, камера, зум
- HUD (время, локация, кол-во агентов)
- Коллизии стен

**Новое:** 3 сценария (средневековье, современный, фантастика) с 10 агентами каждый.

Архитектура: /home/jskonst/projects/agent-sim/ARCHITECTURE.md

## Задача

Добавить меню выбора сценария, 3 карты, 30 агентов (10 на сценарий) с расписаниями и систему сохранения/загрузки конфигураций.

## Директория

Работаем в /home/jskonst/projects/agent-sim/

## Что создать

### 1. src/game/config/scenarios.ts — 3 сценария

```typescript
export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  scenario: 'medieval' | 'modern' | 'scifi';
  mapFile: string;           // 'medieval.json', 'modern.json', 'scifi.json'
  agentsFile: string;        // 'medieval_agents.ts', 'modern_agents.ts', 'scifi_agents.ts'
  time: {
    startHour: number;
    tickRate: number;        // minutes per tick
  };
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'medieval_town',
    name: 'Средневековый городок',
    description: 'Рынок, таверна, кузница, храм, ферма',
    scenario: 'medieval',
    mapFile: 'medieval.json',
    agentsFile: 'medieval_agents',
    time: { startHour: 8, tickRate: 5 }
  },
  {
    id: 'modern_suburb',
    name: 'Современный пригород',
    description: 'Мэрия, супермаркет, кафе, парк, школа',
    scenario: 'modern',
    mapFile: 'modern.json',
    agentsFile: 'modern_agents',
    time: { startHour: 9, tickRate: 5 }
  },
  {
    id: 'scifi_station',
    name: 'Фантастическая станция',
    description: 'Командный центр, медбей, ангар, жилая секция',
    scenario: 'scifi',
    mapFile: 'scifi.json',
    agentsFile: 'scifi_agents',
    time: { startHour: 7, tickRate: 10 }
  }
];
```

### 2. src/data/medieval_agents.ts — 10 агентов средневековья

```typescript
import { AgentProfile } from '../types/agent';

export const MEDIEVAL_AGENTS: AgentProfile[] = [
  {
    id: 'mayor',
    name: 'Мэр',
    role: 'official',
    avatar: 'purple',
    stats: {
      charisma: 8,
      industriousness: 7,
      sociability: 6,
      emotionalStability: 7
    },
    schedule: [
      { startHour: 8, endHour: 12, activity: 'work', preferredZones: ['town_hall'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['town_hall'] },
      { startHour: 17, endHour: 19, activity: 'socialize', preferredZones: ['tavern', 'fountain'] }
    ],
    relationships: {
      'merchant': 30,
      'guard': 40,
      'priest': 20
    },
    goals: ['Содержать город в порядке', 'Наладить торговлю']
  },
  {
    id: 'merchant',
    name: 'Торговец',
    role: 'merchant',
    avatar: 'green',
    stats: {
      charisma: 9,
      industriousness: 6,
      sociability: 8,
      emotionalStability: 5
    },
    schedule: [
      { startHour: 8, endHour: 12, activity: 'work', preferredZones: ['market'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 18, activity: 'work', preferredZones: ['market'] },
      { startHour: 18, endHour: 20, activity: 'socialize', preferredZones: ['tavern'] }
    ],
    relationships: {
      'mayor': 30,
      'blacksmith': 20,
      'bard': 40
    },
    goals: ['Наладить торговлю', 'Расширить ассортимент']
  },
  // ... остальные 8 агентов
];
```

### 3. src/data/modern_agents.ts — 10 агентов современности
### 4. src/data/scifi_agents.ts — 10 агентов фантастики

Та же структура, другие роли и расписания.

### 5. 3 тайловые карты (Tiled JSON)

**medieval.json** — 30×30 тайлов:
```
┌──────────────────────────────┐
│ 🏰 town_hall │ 🛒 market      │
├──────────────┼───────────────┤
│ 🍺 tavern    │ ⚒️ blacksmith  │
├──────────────┼───────────────┤
│ ⛪ temple     │ 🌾 farm        │
├──────────────┼───────────────┤
│ 🏠 house_1   │ 🏠 house_2     │
├──────────────┼───────────────┤
│ ⛲ fountain   │ 🚪 castle_gate │
└──────────────────────────────┘
```

**modern.json** — 30×30 тайлов
**scifi.json** — 30×30 тайлов

### 6. src/game/scenes/MenuScene.ts — выбор сценария

```typescript
import { Scene } from 'phaser';
import { SCENARIOS } from '../config/scenarios';

export class MenuScene extends Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // Заголовок
    this.add.text(400, 50, 'Agent Sim', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, 'Выберите сценарий', {
      fontSize: '24px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Кнопки сценариев
    SCENARIOS.forEach((scenario, index) => {
      const y = 200 + index * 80;

      // Название
      this.add.text(200, y, scenario.name, {
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      // Описание
      this.add.text(200, y + 30, scenario.description, {
        fontSize: '16px',
        color: '#888888'
      }).setOrigin(0, 0.5);

      // Кнопка запуска
      const startBtn = this.add.text(600, y + 15, 'Старт', {
        fontSize: '18px',
        backgroundColor: '#4CAF50',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      startBtn.setInteractive()
        .on('pointerdown', () => {
          this.startGame(scenario);
        });
    });

    // Кнопка загрузки конфигурации
    const loadBtn = this.add.text(400, 600, '📁 Загрузить конфигурацию', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#2196F3',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    loadBtn.setInteractive()
      .on('pointerdown', () => {
        this.loadConfig();
      });
  }

  startGame(scenario: ScenarioConfig) {
    // Сохранить выбранный сценарий
    this.registry.set('selectedScenario', scenario);

    // Запустить GameWorld
    this.scene.start('GameWorld');
  }

  loadConfig() {
    // Создать input для загрузки JSON
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const config = JSON.parse(text);

      this.registry.set('customConfig', config);
      this.scene.start('GameWorld');
    };

    input.click();
  }
}
```

### 7. Обновить src/game/scenes/GameWorld.ts

```typescript
export class GameWorld extends Scene {
  private agents: Agent[] = [];
  private scenario: ScenarioConfig | null = null;

  create() {
    // Получить выбранный сценарий
    this.scenario = this.registry.get('selectedScenario') as ScenarioConfig;

    // Или кастомную конфигурацию
    const customConfig = this.registry.get('customConfig') as any;
    if (customConfig) {
      this.loadCustomConfig(customConfig);
    } else if (this.scenario) {
      this.loadScenario(this.scenario);
    }

    // ... остальное
  }

  private loadScenario(scenario: ScenarioConfig) {
    // Загрузить карту
    this.load.tilemapTiledJSON(scenario.mapFile, `public/maps/${scenario.mapFile}`);

    // Загрузить агентов
    const agentsFile = scenario.agentsFile === 'medieval_agents'
      ? MEDIEVAL_AGENTS
      : scenario.agentsFile === 'modern_agents'
      ? MODERN_AGENTS
      : SCIFI_AGENTS;

    // Создать агентов
    this.createAgents(agentsFile);
  }

  private loadCustomConfig(config: any) {
    // Загрузить кастомную конфигурацию
    // Карта, агенты, время — всё из JSON
  }

  private createAgents(profiles: AgentProfile[]) {
    profiles.forEach(profile => {
      // Найти начальную зону из расписания
      const firstActivity = profile.schedule[0];
      const startZone = firstActivity.preferredZones[0];

      // Создать агента
      const agent = new Agent(this, profile, startZone);
      this.agents.push(agent);
    });
  }
}
```

### 8. src/ui/hud.ts — кнопка экспорта конфигурации

```typescript
export class HUD extends Phaser.GameObjects.Container {
  exportButton: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene);

    this.exportButton = scene.add.text(750, 50, '⬇️ Экспорт', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#FF9800',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.exportButton.setInteractive()
      .on('pointerdown', () => {
        this.exportConfig();
      });

    this.add(this.exportButton);
  }

  exportConfig() {
    // Собрать текущую конфигурацию
    const config = {
      name: 'Custom Scenario',
      scenario: 'custom',
      time: this.scene.registry.get('timeSettings'),
      agents: this.agents.map(a => ({
        ...a.profile,
        state: {
          location: a.state.location,
          mood: a.state.mood,
          energy: a.state.energy
        }
      }))
    };

    // Скачать JSON
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent_sim_config.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

### 9. src/types/agent.ts — типы

```typescript
export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;              // цвет спрайта
  stats: {
    charisma: number;
    industriousness: number;
    sociability: number;
    emotionalStability: number;
  };
  schedule: ScheduleEntry[];
  relationships: Record<string, number>;
  goals: string[];
}

export interface ScheduleEntry {
  startHour: number;
  endHour: number;
  activity: string;            // "work", "eat", "rest", "socialize"
  preferredZones: string[];
  requiredEnergy?: number;
}
```

## Проверка

- `npx tsc --noEmit` — без ошибок
- `npm run dev` — Phaser запускается
- Меню выбора сценария появляется
- Выбор сценария загружает соответствующую карту и агентов
- 10 агентов видны на карте
- Агенты двигаются по расписанию
- Кнопка "Экспорт" скачивает JSON-конфигурацию
- Кнопка "Загрузить конфигурацию" загружает JSON

## Важно

- 3 сценария = 3 карты + 30 агентов
- Все агенты должны быть уникальными (имена, роли, расписания)
- Конфигурации в JSON — можно редактировать вручную
- Тайловые карты — 30×30, не больше (производительность)
- A* pathfinding написать вручную (простой BFS)