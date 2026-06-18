# Фаза 3: UI — панель агента, лог событий, режим наблюдения

## Контекст

Agent Sim — 2D офис с 15 AI-агентами. Агенты двигаются по расписанию (A* pathfinding).
Каркас Phaser + время готов. LLM пока не подключаем.

## Задача

Добавить UI-взаимодействие:
1. Клик по агенту — панель с информацией
2. Лог событий — кто куда пошёл, что делает
3. Режим наблюдения — Tab, камера следует за агентом
4. Статистика — среднее настроение/энергия

## Директория

Работаем в /home/jskonst/projects/agent-sim/

## Что создать

### 1. src/ui/agentPanel.ts — Панель информации об агенте

При клике на агента — показывать панель в правом верхнем углу.

```typescript
export class AgentPanel {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private roleText: Phaser.GameObjects.Text;
  private moodBar: Phaser.GameObjects.Rectangle;   // fill
  private moodBg: Phaser.GameObjects.Rectangle;    // bg
  private energyBar: Phaser.GameObjects.Rectangle;
  private energyBg: Phaser.GameObjects.Rectangle;
  private activityText: Phaser.GameObjects.Text;
  private locationText: Phaser.GameObjects.Text;
  private thoughtsText: Phaser.GameObjects.Text;
  private relationshipsText: Phaser.GameObjects.Text;  // пока заглушка

  constructor(scene: Phaser.Scene) {
    // Создать полупрозрачный фон
    // Текст имени, роли, полоски настроения/энергии
    // Всё pinned to camera (setScrollFactor(0))
    // Скрыто по умолчанию
  }

  show(agent: Agent): void {
    // Показать панель
    // Заполнить данными из agent.state
    // moodBar.width = (agent.state.mood / 100) * 150
    // Цвет moodBar: зелёный (>60), жёлтый (30-60), красный (<30)
    // energyBar.width = (agent.state.energy / 100) * 150
    // activityText = agent.state.activity
    // locationText = zone name
  }

  hide(): void {
    this.container.setVisible(false);
  }

  update(agent: Agent): void {
    // Обновлять каждый кадр если панель открыта
  }
}
```

**Внешний вид панели:**
```
┌─────────────────────────┐
│ Alex                    │  ← имя (белый, 16px)
│ Senior Developer        │  ← роль (серый, 12px)
│─────────────────────────│
│ Настроение ████████░░ 80│  ← полоска + число
│ Энергия    ██████░░░░ 60│  ← полоска + число
│─────────────────────────│
│ 💼 Working              │  ← текущая активность
│ 📍 Open Space 1         │  ← текущая зона
│─────────────────────────│
│ 💭 "Надо доделать API"  │  ← мысли (заглушка пока)
│─────────────────────────│
│ 🤝 Отношения:           │  ← пока заглушка
│   Sarah: +15            │
└─────────────────────────┘
```

Панель:
- x: scene.cameras.main.width - 250, y: 10
- width: 240, height: ~280
- bg: 0x1a1a2e, alpha: 0.9, border: 0x4ecdc4
- Все тексты setScrollFactor(0)

### 2. src/ui/eventLog.ts — Лог событий

Лог событий в левом нижнем углу. Список последних 10 событий.

```typescript
interface LogEntry {
  tick: number;
  text: string;         // "Alex went to Kitchen"
  color: string;        // цвет текста
}

export class EventLog {
  private container: Phaser.GameObjects.Container;
  private entries: LogEntry[] = [];
  private entryTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    // Фон 0x000000, alpha 0.7, width 400, height 120
    // 10 строк текста (предварительно созданы)
    // x: 10, y: scene.cameras.main.height - 140
    // Все setScrollFactor(0), depth: 99
  }

  addEntry(text: string, color: string = '#aaaaaa'): void {
    // Добавить entry
    // Если entries.length > 10 — удалить старую
    // Обновить entryTexts
  }

  clear(): void {
    this.entries = [];
    this.entryTexts.forEach(t => t.setText(''));
  }
}
```

**Какие события логировать (в GameScene.update или Agent.update):**
- Смена зоны: "Alex → Kitchen" (цвет: #4ecdc4 — teal)
- Смена активности: "Alex начал работать" (цвет: #48bb78 — зелёный)
- Встреча с другим агентом: "Alex и Sarah в Open Space 1" (цвет: #ecc94b — жёлтый)
- Смена часа: "⏰ 10:00" (цвет: #718096 — серый)

### 3. src/ui/statsPanel.ts — Статистика офиса

Маленькая панель статистики, pinned to camera в правом нижнем углу.

```typescript
export class StatsPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private avgMoodText: Phaser.GameObjects.Text;
  private avgEnergyText: Phaser.GameObjects.Text;
  private busyCountText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    // Фон 0x000000, alpha 0.7
    // x: scene.cameras.main.width - 180
    // y: scene.cameras.main.height - 100
    // depth: 98
  }

  update(agents: Agent[]): void {
    if (agents.length === 0) return;
    
    const avgMood = agents.reduce((s, a) => s + a.state.mood, 0) / agents.length;
    const avgEnergy = agents.reduce((s, a) => s + a.state.energy, 0) / agents.length;
    const busyCount = agents.filter(a => a.state.activity === 'working' || a.state.activity === 'meeting').length;
    
    this.avgMoodText.setText(`😊 Настроение: ${Math.round(avgMood)}%`);
    this.avgEnergyText.setText(`⚡ Энергия: ${Math.round(avgEnergy)}%`);
    this.busyCountText.setText(`💼 Занято: ${busyCount}/${agents.length}`);
  }
}
```

### 4. Режим наблюдения

Добавить в GameScene:

```typescript
private observedAgentIndex: number = -1;  // -1 = наблюдение выключено

// В create():
this.input.keyboard.on('keydown-TAB', () => {
  if (this.agents.length === 0) return;
  this.observedAgentIndex = (this.observedAgentIndex + 1) % this.agents.length;
  const agent = this.agents[this.observedAgentIndex];
  this.cameras.main.startFollow(agent.sprite, true, 0.08, 0.08);
  this.agentPanel.show(agent);
  
  // Подсветка выбранного агента (толстая рамка вокруг спрайта)
  // Сбросить подсветку предыдущего
});

this.input.keyboard.on('keydown-ESC', () => {
  // Выйти из режима наблюдения
  this.observedAgentIndex = -1;
  this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  this.agentPanel.hide();
});
```

**При клике на агента (pointerdown):**
```typescript
this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
  const clickedAgent = this.agents.find(a => {
    const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, a.sprite.x, a.sprite.y);
    return dist < 20;
  });
  
  if (clickedAgent) {
    this.observedAgentIndex = this.agents.indexOf(clickedAgent);
    this.cameras.main.startFollow(clickedAgent.sprite, true, 0.08, 0.08);
    this.agentPanel.show(clickedAgent);
  } else {
    // Клик по пустому месту — сброс
    this.observedAgentIndex = -1;
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.agentPanel.hide();
  }
});
```

### 5. Обновить GameScene.ts

Добавить:
- В create(): AgentPanel, EventLog, StatsPanel
- В update():
  - Обновлять StatsPanel каждый кадр
  - Если observedAgentIndex >= 0 — обновлять AgentPanel
  - Логировать события при смене зоны/активности (через compare с предыдущим состоянием)
- Сброс подсветки для всех агентов при переключении

### 6. Обновить Agent.ts

Добавить метод для проверки изменений:
```typescript
private previousZone: string = '';
private previousActivity: string = '';

getZoneChange(): string | null {
  if (this.state.location !== this.previousZone) {
    const change = this.state.location;
    this.previousZone = this.state.location;
    return change;
  }
  return null;
}

getActivityChange(): string | null {
  if (this.state.activity !== this.previousActivity) {
    const change = this.state.activity;
    this.previousActivity = this.state.activity;
    return change;
  }
  return null;
}
```

Добавить визуальное выделение выбранного агента:
```typescript
private highlightRing: Phaser.GameObjects.Arc;  // круг вокруг спрайта

setHighlighted(highlighted: boolean): void {
  this.highlightRing.setVisible(highlighted);
  if (highlighted) {
    this.sprite.setStrokeStyle(3, 0x4ecdc4);  // teal border
  } else {
    this.sprite.setStrokeStyle(1, 0xffffff);  // default border
  }
}
```

Все Phaser.GameObjects.Arc должны иметь strokeStyle для видимости.

## Проверка

- `npx tsc --noEmit` — без ошибок
- Клик по агенту — показывает панель
- Tab — переключение между агентами
- Esc — выход из режима наблюдения
- Лог показывает события (перемещения, смена активности)
- Статистика обновляется
- Камера следует за выбранным агентом

## Важно

- Все UI-элементы pinned to camera (setScrollFactor(0), depth 95+)
- Не ломать существующее движение агентов и время
- LLM не подключаем — мысли/диалоги пока заглушки