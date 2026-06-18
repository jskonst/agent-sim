# Фаза 0: Каркас Agent Sim — Phaser + камера + карта

## Контекст

Agent Sim — 2D мир с AI-агентами (офисный этаж, Phaser 3).
Архитектура: /home/jskonst/projects/agent-sim/ARCHITECTURE.md

## Задача

Создать минимальный работающий каркас:
1. Vite + Phaser 3 + TypeScript проект
2. Базовая сцена с камерой
3. Тайловая карта офиса
4. Спрайт игрока с WASD движением
5. HUD: время, локация

## Стек

- Vite + TypeScript
- Phaser 3 (phaser npm package)
- Без бэкенда (пока всё в браузере)

## Директория

Работаем в /home/jskonst/projects/agent-sim/

## Что создать

### 1. Проект

```
agent-sim/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts                  # Entry point: new Phaser.Game(...)
│   ├── game/
│   │   ├── config.ts            # Phaser.Types.Core.GameConfig
│   │   └── scenes/
│   │       ├── BootScene.ts     # Загрузка ассетов
│   │       └── GameScene.ts     # Основная игровая сцена
│   └── ui/
│       └── hud.ts               # HUD: время, локация (через Phaser text)
```

### 2. package.json

```json
{
  "name": "agent-sim",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.80.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^6.0.0"
  }
}
```

### 3. index.html

- `<div id="game-container">` для Phaser
- Тёмный фон (#0a0a0a) 
- Подключить /src/main.ts как module

### 4. src/main.ts

```typescript
import Phaser from 'phaser';
import { gameConfig } from './game/config';

new Phaser.Game(gameConfig);
```

### 5. src/game/config.ts

Phaser конфиг:
- type: Phaser.AUTO
- width: 1024
- height: 768
- parent: 'game-container'
- backgroundColor: '#1a1a2e'
- physics: arcade (базовая, для коллизий)
- scene: [BootScene, GameScene]
- scale: режим FIT (адаптивный)
- pixelArt: true (для тайлового арта)

### 6. src/game/scenes/BootScene.ts

Загрузка ассетов:
- Пока ничего не загружаем (генерируем тайлы программно)
- После "загрузки" → переход в GameScene

### 7. src/game/scenes/GameScene.ts

**Карта офиса (программная, через Phaser Graphics):**

```
┌─────────────────────────────────────────┐
│ 0:reception  1:open_space_1  2:open_space_2│
│                                            │
│ 3:meeting_1    corridor      4:meeting_2  │
│                                            │
│ 5:kitchen      corridor      6:office_cow  │
│                                            │
│ 7:wc_m         corridor      8:wc_f       │
└─────────────────────────────────────────┘
```

Нарисовать тайловую карту через Phaser.Graphics:
- Тайлы пола: прямоугольники 32×32 пикселя
- Стены: тёмные прямоугольники на границах комнат
- Каждая комната — зона со своим цветом пола
- Коридор — центральная вертикальная полоса

**Координаты зон (в тайлах):**

```
reception:     x=0..5,   y=0..5
open_space_1:  x=7..13,  y=0..5
open_space_2:  x=15..21, y=0..5
meeting_1:     x=0..5,   y=7..10
meeting_2:     x=15..21, y=7..10
kitchen:       x=0..5,   y=12..16
office_cow:    x=15..21, y=12..16
wc_m:          x=0..5,   y=18..21
wc_f:          x=15..21, y=18..21
corridor:      x=6..14,  y=0..21  (центральная полоса)
```

Размер карты: 22×22 тайла (каждый тайл 32×32 = 704×704 пикселя)
Стены: тайлы с графикой стен (серые/тёмные блоки)

**Игрок:**
- Зелёный квадрат 24×24 пикселя (пока заглушка)
- WASD: движение на скорость 3 пикселя за кадр
- Камера следует за игроком (camera.startFollow)
- Коллизии со стенами (map boundaries и внутренние стены)

**Камера:**
- Следует за игроком
- Зум: колёсико мыши (0.5x..2x)
- Границы камеры = размер карты

### 8. src/ui/hud.ts

Текстовые элементы (Phaser.GameObjects.Text), pinned to camera:
- Время: "14:30" (static пока, но структура готова)
- Локация: "📍 Open Space 1" (статично пока)
- Количество агентов рядом

### 9. src/types.ts

Базовые типы (заготовка для будущих фаз):

```typescript
interface Zone {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  color: number;
}

interface GameState {
  currentTime: { hour: number; minute: number };
  currentZone: string;
  agents: any[];
}
```

## Проверка

После создания:
1. npm install
2. npm run dev
3. Должна открыться страница с картой офиса
4. WASD — движение камеры/игрока
5. Колёсико — зум
6. npx tsc --noEmit — без ошибок

## Важно

- Не использовать внешние ассеты — всё через Phaser Graphics (тайлы генерируются кодом)
- Карта 22×22 тайла, каждый 32×32 = 704×704
- Камера с bounds = размер карты
- Стены физические (arcade physics static group) — игрок не проходит сквозь них
- HUD pinned to camera (setScrollFactor(0))