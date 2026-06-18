# Фаза 1: Агенты с расписаниями и профилями

## Контекст

Agent Sim — 2D офис с AI-агентами. Phaser 3 каркас готов:
- Тайловая карта 22×22, 9 зон
- WASD игрок, камера, зум
- HUD (время, локация, кол-во агентов)
- Коллизии стен

Архитектура: /home/jskonst/projects/agent-sim/ARCHITECTURE.md

## Задача

Добавить в мир 15 агентов с расписаниями, профилями и автономным движением.

## Директория

Работаем в /home/jskonst/projects/agent-sim/

## Что создать

### 1. src/data/agents.ts — 15 профилей агентов

Каждый профиль — AgentProfile:

```typescript
export interface AgentProfile {
  id: string;
  name: string;
  role: string;           // "developer", "manager", "hr", "designer", "intern", "qa", "devops"
  avatar: string;         // цвет спрайта: "green", "blue", "red", "purple", "orange", "yellow", "pink", "cyan"
  stats: {
    charisma: number;       // 1-10
    industriousness: number; // 1-10
    sociability: number;    // 1-10
    emotionalStability: number; // 1-10
  };
  schedule: ScheduleEntry[];
  relationships: Record<string, number>;
  goals: string[];
}

export interface ScheduleEntry {
  startHour: number;        // 0-23
  endHour: number;
  activity: string;         // "work", "eat", "rest", "socialize", "meeting"
  preferredZones: string[]; // ["open_space_1", "kitchen", "meeting_1"]
  requiredEnergy?: number;
}
```

**15 персонажей с разными ролями:**

**Разработчики (4):**
1. Alex — senior dev, замкнутый, трудоголик
2. Maria — team lead, харизматичная
3. Kim — junior dev, общительный, старательный
4. Leo — fullstack dev, спокойный, уравновешенный

**Дизайнеры (2):**
5. Nina — UI/UX дизайнер, креативная, общительная
6. Tom — graphic designer, интроверт

**Менеджеры (3):**
7. Sarah — product manager, амбициозная
8. Bob — project manager, строгий, организованный
9. Chris — scrum master, дружелюбный

**HR (2):**
10. Diana — HR lead, заботливая
11. Paul — recruiter, энергичный

**QA (2):**
12. Eva — QA lead, дотошная
13. Mike — manual QA, спокойный

**Прочие (2):**
14. Jake — intern, старательный, стеснительный
15. Zoe — devops, интроверт, эффективная

**Расписания (по ролям):**
- Рабочий день: 9:00-18:00
- Обед: 13:00-14:00 (в kitchen)
- Утро: кофе в kitchen (8:30-9:00)
- Разработчики: работа в open_space, митинги в meeting
- Менеджеры: митинги, ходят между зонами
- HR: работа в reception, meeting
- QA: open_space, meeting
- DevOps: office_coworking, open_space
- Intern: везде, следует за ментором

Изменения настроения и энергии:
- Работа: energy -0.5/час, mood -0.1 (если industriousness > 5, то mood +0.1)
- Отдых: energy +1/час, mood +0.5
- Еда: energy +2/час, mood +1
- Социализация: mood +1 (если sociability > 5), energy -0.3
- Митинг: mood -0.3 (если charisma < 5), energy -0.2

### 2. Обновить src/game/entities/Agent.ts

```typescript
export class Agent {
  id: string;
  name: string;
  profile: AgentProfile;
  
  // Текущее состояние
  state: {
    location: string;         // Zone ID
    activity: string;         // "working", "moving", "eating", "resting"
    mood: number;             // 0-100
    energy: number;           // 0-100
    targetX: number;          // Целевые координаты тайла
    targetY: number;
  };

  // Phaser объекты
  sprite: Phaser.GameObjects.Arc;  // Круг 20px радиус, цвет по avatar
  nameLabel: Phaser.GameObjects.Text;  // Имя над головой
  
  // Путь
  path: Phaser.Math.Vector2[];

  constructor(scene: Phaser.Scene, profile: AgentProfile, startZone: ZoneConfig) {
    // Создать спрайт в startZone
    // Создать nameLabel
    // Инициализировать состояние
    // Начать выполнение расписания
  }

  update(gameHour: number, agents: Agent[]): void {
    // 1. Если есть path — двигаться по нему
    // 2. Если на месте — выполнять activity
    // 3. Проверить расписание — пора ли сменить активность?
    // 4. Обновить energy/mood
    // 5. Обновить sprite position
  }

  private findPath(fromZone: string, toZone: string): Phaser.Math.Vector2[] {
    // A* pathfinding по тайловой карте
  }

  private getActivityAtHour(hour: number): { activity: string; zones: string[] } {
    // Найти в расписании подходящую запись
  }
}
```

### 3. Обновить src/game/systems/ (создать если нет)

**MovementSystem.ts:**
- A* pathfinding по тайловой сетке 22×22
- Карта проходимости: все зоны проходимы, стены — нет
- Алгоритм: простой BFS или A* (можно взять tiny-astar или написать самому)
- Путь — массив {x, y} в тайловых координатах
- Агент движется 1 тайл за 2 тика (10 игровых минут)

**ScheduleSystem.ts:**
- Для каждого агента проверяет текущий час
- Если пора менять активность — выбирает зону из preferredZones
- Если в зоне есть кто-то ещё с совпадающей активностью — повышает приоритет (социализация)
- Возвращает { activity, targetZone }

### 4. Обновить GameScene.ts

- В create(): создать 15 Agent объектов, расставить по начальным зонам
- В update(): для каждого агента вызвать agent.update(gameHour)
- Коллизии: агенты не проходят сквозь стены (staticGroup уже есть)
- Отображение: спрайты видны, имена видны

### 5. src/data/schedules.ts

Шаблоны расписаний для разных ролей:

```
Developer schedule:
  8:30-9:00  eat (kitchen)
  9:00-12:00 work (open_space_1/2)
  12:00-13:00 eat (kitchen)
  13:00-17:00 work (open_space_1/2)
  17:00-18:00 socialize (kitchen, meeting_1/2)

Manager schedule:
  8:30-9:00  eat (kitchen)
  9:00-11:00 work (office_coworking)
  11:00-12:00 meeting (meeting_1/2)
  12:00-13:00 eat (kitchen)
  13:00-15:00 meeting (meeting_1/2)
  15:00-17:00 work (office_coworking)
  17:00-18:00 socialize (corridor)

HR schedule:
  8:30-9:00  eat (kitchen)
  9:00-12:00 work (reception)
  12:00-13:00 eat (kitchen)
  13:00-15:00 meeting (meeting_1/2)
  15:00-17:00 work (reception)
  17:00-18:00 socialize (kitchen)

QA schedule:
  8:30-9:00  eat (kitchen)
  9:00-12:00 work (open_space_1/2)
  12:00-13:00 eat (kitchen)
  13:00-15:00 work (open_space_1/2)
  15:00-16:00 meeting (meeting_1/2)
  16:00-18:00 work (open_space_1/2)

DevOps schedule:
  8:30-9:00  eat (kitchen)
  9:00-12:00 work (office_coworking)
  12:00-13:00 eat (kitchen)
  13:00-17:00 work (office_coworking)
  17:00-18:00 work (open_space_1/2)

Intern schedule (следует за ментором):
  8:30-9:00  eat (kitchen)
  9:00-12:00 work (open_space_1/2)
  12:00-13:00 eat (kitchen)
  13:00-17:00 work (open_space_1/2)
  17:00-18:00 work (open_space_1/2)
```

### 6. Симуляция времени

В GameScene добавить простой таймер времени:
```typescript
private gameHour: number = 8;   // 8:00 утра
private gameMinute: number = 30; // 30 минут
private tickAccumulator: number = 0;
private readonly TICK_INTERVAL: number = 1000; // 1 сек = 5 минут

update(time: number, delta: number) {
  this.tickAccumulator += delta;
  if (this.tickAccumulator >= TICK_INTERVAL) {
    this.tickAccumulator -= TICK_INTERVAL;
    this.advanceTime();
  }
  // ... остальное
}

advanceTime() {
  this.gameMinute += 5;
  if (this.gameMinute >= 60) {
    this.gameMinute = 0;
    this.gameHour = (this.gameHour + 1) % 24;
  }
  
  // Обновить всех агентов с новым временем
  this.agents.forEach(agent => agent.update(this.gameHour, this.agents));
  
  // Обновить HUD
  this.hud.updateTime(this.gameHour, this.gameMinute);
}
```

### 7. Обновить HUD

Добавить:
- `updateTime(hour, minute)` — обновление времени
- `updateAgentCount(count)` — обновление кол-ва агентов
- Список имён агентов в текущей зоне (вторым текстом)

## Проверка

- `npx tsc --noEmit` — без ошибок
- `npm run dev` — Phaser запускается
- 15 агентов видны на карте
- Агенты двигаются по расписанию
- Время в HUD тикает
- Агенты не проходят сквозь стены

## Важно

- A* pathfinding написать вручную (не тащить библиотеку) — он простой для 22×22
- Агенты движутся плавно (по пикселям, не прыгают по тайлам)
- Имена над агентами всегда читаемы (setScrollFactor(0) или следят за камерой)
- Коллизии: агенты друг через друга могут проходить (не блокируют друг друга пока)
- Каждый агент — отдельный файл данных в src/data/agents.ts? Нет, один файл с массивом из 15 объектов