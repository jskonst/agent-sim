# ЗАДАЧА: Починить CI — исправить все ошибки TypeScript, чтобы `npm run build` проходил успешно

## Контекст

Проект agent-sim (Phaser 3 + TypeScript + Vite). Репозиторий: github.com/jskonst/agent-sim.
GitHub Actions workflow `.github/workflows/deploy.yml` собирает и публикует сайт на GitHub Pages.
Скрипт сборки в package.json: `"build": "tsc && vite build"`.

CI падает на этапе `npm run build` из-за ошибок TypeScript (`tsc` возвращает exit code 2).
Из-за этого шаг deploy никогда не запускается, и GitHub Pages не обновляется.

Цель: сделать так, чтобы `npx tsc --noEmit` и `npm run build` проходили БЕЗ ОШИБОК.

## Полный список ошибок tsc (из лога CI run 27911086014)

```
src/ai/prompts.ts(1,30): error TS2307: Cannot find module '../data/agents' or its corresponding type declarations.
src/ai/prompts.ts(2,10): error TS2305: Module '"../game/entities/Agent"' has no exported member 'AgentState'.
src/ai/prompts.ts(2,22): error TS2305: Module '"../game/entities/Agent"' has no exported member 'AgentEvent'.
src/ai/prompts.ts(7,45): error TS18046: 'val' is of type 'unknown'.
src/ai/prompts.ts(7,65): error TS18046: 'val' is of type 'unknown'.
src/ai/prompts.ts(12,10): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/ai/triggers.ts(24,29): error TS2339: Property 'getActivityChange' does not exist on type 'Agent'.
src/data/schedules.ts(1,31): error TS2307: Cannot find module './agents' or its corresponding type declarations.
src/game/AgentMovement.ts(2,23): error TS2307: Cannot find module './Agent' or its corresponding type declarations.
src/game/AgentMovement.ts(3,26): error TS2307: Cannot find module '../GameTime' or its corresponding type declarations.
src/game/entities/Agent.ts(9,3): error TS2416: Property 'state' in type 'Agent' is not assignable to the same property in base type 'Container'.
src/game/entities/Agent.ts(18,3): error TS2564: Property 'sprite' has no initializer and is not definitely assigned in the constructor.
src/game/entities/Agent.ts(19,3): error TS2564: Property 'nameLabel' has no initializer and is not definitely assigned in the constructor.
src/game/entities/Agent.ts(27,24): error TS2345: Argument of type 'this' is not assignable to parameter of type 'GameObject | Group | Layer'.
src/game/entities/Agent.ts(136,10): error TS2339: Property 'handleAgentInteractions' does not exist on type 'Agent'.
src/game/entities/Agent.ts(176,44): error TS2304: Cannot find name 'ScheduleEntry'.
src/game/scenes/GameScene.ts(226,7): error TS2322: Type 'Rectangle' is not assignable to type 'Rectangle & { body: Body; }'.
src/game/scenes/GameScene.ts(238,41): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/game/scenes/GameScene.ts(239,50): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/game/scenes/GameScene.ts(240,42): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/game/scenes/GameScene.ts(241,50): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/game/systems/ScheduleSystem.ts(1,45): error TS2307: Cannot find module '../../data/agents' or its corresponding type declarations.
src/ui/tokenPanel.ts(101,44): error TS2339: Property 'count' does not exist on type '{ daily: PeriodUsage; hourly: PeriodUsage; }'.
```

## Категории ошибок и подсказки по исправлению

1. **Несуществующие пути импортов (TS2307):** '../data/agents', './agents', './Agent', '../GameTime', '../../data/agents'.
   - Найдите, где реально объявлены эти типы/данные (agents, Agent, GameTime), и исправьте пути импортов.
   - Возможно, файлы переименованы или перемещены. Проверьте фактическую структуру `src/`.

2. **Отсутствующие экспорты (TS2305):** `AgentState`, `AgentEvent` — нужно либо экспортировать эти типы из `src/game/entities/Agent.ts`, либо импортировать из правильного места.

3. **Свойства без инициализаторов (TS2564):** `sprite`, `nameLabel` — используйте `declare` или оператор определённого присваивания `!`.

4. **Конфликт имён со Phaser (TS2416):** свойство `state` в классе Agent конфликтует с базовым типом `Container`. Переименуйте в `agentState` или `aiState`.

5. **this не присваивается (TS2345, строка 27):** `this` передаётся в функцию, ожидающую `GameObject`. Используйте приведение типа `this as unknown as Phaser.GameObjects.GameObject`.

6. **Отсутствующие методы/типы (TS2339/TS2304):** `getActivityChange`, `handleAgentInteractions`, `ScheduleEntry` — добавьте реализации или импорты.

7. **number → string (TS2345, GameScene строки 238-241):** приведите тип через `String(...)` или `.toString()`.

8. **Rectangle & body (TS2322, GameScene строка 226):** добавьте `as unknown as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body }`.

9. **count не существует (TS2339, tokenPanel строка 101):** проверьте интерфейс PeriodUsage, добавьте поле `count` либо исправьте обращение.

## Порядок работы

1. Изучи структуру `src/` — пойми, где что находится.
2. Запусти `npx tsc --noEmit` локально, чтобы увидеть актуальные ошибки.
3. Исправляй ошибки по одной (или группами), сохраняя логику приложения.
4. После каждого блока правок запускай `npx tsc --noEmit` для проверки.
5. Цель — `npx tsc --noEmit` и `npm run build` (полностью, с vite) проходят без ошибок.

## Ограничения

- НЕ меняй логику приложения и игровую механику — только исправляй типы, пути импортов, приведения.
- НЕ добавляй `// @ts-ignore` или `// @ts-nocheck` — исправляй по-настоящему.
- НЕ ослабляй строгость tsconfig (не отключай strict, noImplicitAny и т.п.).
- НЕ удаляй и не переименовывай design-файлы (TASK_*.md).
- Установи зависимости если нужно: `npm install`.

## Проверка (ОБЯЗАТЕЛЬНО запусти и приложи вывод)

```bash
npx tsc --noEmit        # должно быть 0 ошибок
npm run build           # должно завершиться успешно, dist/ создан
```

Обе команды должны завершиться с exit code 0.
