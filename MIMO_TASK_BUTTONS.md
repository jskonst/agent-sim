# Fix: Broken Buttons + Missing Settings Button

## Context

This is a Phaser 3 + TypeScript game ("Agent Sim"), built with Vite, deployed to GitHub Pages.
Tech stack: Phaser 3.90, Vite 6, TypeScript 5.

**Problem**: On the deployed site (and locally), clicking ANY "Старт" button in the menu crashes the game — GameScene.create() throws a TypeError. Additionally, there is NO visible button to open the Settings/Configuration panel (it's only accessible via keyboard 'S', which conflicts with WASD movement).

## Bugs to Fix

### Bug 1 (CRITICAL): `preferredZones` field name mismatch — crashes GameScene

**File**: `src/game/scenes/GameScene.ts`, line ~282, in `createAgents()`:

```typescript
// CURRENT (BROKEN):
const startZone = firstActivity?.preferredZones[0] || this.zones[0]?.id || 'town_hall';
```

The schedule entries use the field `zones` (array of strings), NOT `preferredZones`. See the type definition in `src/types/agent.ts`:

```typescript
export interface ScheduleEntry {
  startHour: number;
  endHour: number;
  activity: string;
  zones: string[];        // ← field is "zones"
  requiredEnergy?: number;
}
```

All agent data files (`src/data/medieval_agents.ts`, `src/data/modern_agents.ts`, `src/data/scifi_agents.ts`) use `zones`.

**Error thrown**: `TypeError: Cannot read properties of undefined (reading '0')` — because `firstActivity.preferredZones` is `undefined`, and `undefined[0]` throws. The optional chaining `firstActivity?.preferredZones[0]` does NOT help here: `?.` only guards `firstActivity`, but `firstActivity` is not null (it exists), so `preferredZones` is accessed and is `undefined`, then `[0]` on `undefined` throws.

**Fix**: Change `preferredZones` to `zones`:
```typescript
const startZone = firstActivity?.zones?.[0] || this.zones[0]?.id || 'town_hall';
```

This is THE root cause of all buttons appearing broken — clicking "Старт" starts GameScene which crashes immediately.

### Bug 2: No visible Settings/Configuration button

**File**: `src/game/scenes/GameScene.ts` and `src/ui/hud.ts`

The `SettingsPanel` (in `src/ui/settingsPanel.ts`) exists and works, but it can ONLY be opened via keyboard shortcut 'S' (see `setupObservation()` in GameScene.ts around line 360). There is NO on-screen button anywhere.

**Fix**: Add a visible "⚙ Настройки" (Settings) button to the HUD (`src/ui/hud.ts`), positioned below the existing buttons (e.g. at y=204, below "Скачать профили" at y=172). Make it interactive (`setInteractive()`, `on('pointerdown', ...)`). The click handler should toggle the SettingsPanel.

Since `SettingsPanel` is created in `GameScene` (not in `HUD`), you need to either:
- Pass a callback from GameScene to HUD's constructor, OR
- Use Phaser's scene events/registry to communicate the button click.

Example approach:
1. In GameScene.create(), after creating HUD and SettingsPanel, pass a callback to HUD:
```typescript
this.hud = new HUD(this);
// ... later ...
this.hud.onSettingsClick = () => {
  if (this.settingsPanel.isVisible()) {
    this.settingsPanel.hide();
    this.scene.resume();
  } else {
    this.scene.pause();
    this.settingsPanel.show(() => {
      this.scene.resume();
    });
  }
};
```

2. In HUD, add a public property and a button:
```typescript
onSettingsClick: (() => void) | null = null;

// In constructor, add button:
this.settingsButton = scene.add.text(16, 204, '⚙ Настройки', {
  fontSize: '14px',
  color: '#ffffff',
  backgroundColor: '#4ecdc488',
  padding: { x: 8, y: 4 }
}).setScrollFactor(0).setDepth(100).setInteractive();

this.settingsButton.on('pointerdown', () => {
  this.onSettingsClick?.();
});
```

### Bug 3: `keydown-S` conflict with WASD movement

**File**: `src/game/scenes/GameScene.ts`, `setupObservation()` (~line 360)

The key 'S' is registered for BOTH:
- Downward movement in WASD (`setupInput()`): `S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S)`
- Toggling settings panel: `this.input.keyboard!.on('keydown-S', ...)`

This means every time the player presses 'S' to move down, the settings panel also toggles.

**Fix**: Since we are now adding a visible Settings button (Bug 2), REMOVE the `keydown-S` handler for settings from `setupObservation()`. Keep the 'T' key for token panel toggle (that one is fine — 'T' is not used for movement... actually check: WASD uses W, A, S, D. 'T' is safe).

Alternatively, change the settings hotkey to a non-conflicting key (e.g. `keydown-ESC` is already used, maybe use a key like 'C' or 'O'). But the PREFERRED fix is to just remove the keyboard shortcut since we have a button now.

### Bug 4: `createWalls()` passes wrong arguments

**File**: `src/game/scenes/GameScene.ts`, `createWalls()` (~line 231)

```typescript
// CURRENT (BROKEN):
this.walls.create(MAP_WIDTH / 2, 0, MAP_WIDTH as unknown as string, 10).refreshBody();
this.walls.create(MAP_WIDTH / 2, MAP_HEIGHT, MAP_WIDTH as unknown as string, 10).refreshBody();
this.walls.create(0, MAP_HEIGHT / 2, 10 as unknown as string, MAP_HEIGHT).refreshBody();
this.walls.create(MAP_WIDTH, MAP_HEIGHT / 2, 10 as unknown as string, MAP_HEIGHT).refreshBody();
```

`staticGroup.create(x, y, key, frame)` expects a TEXTURE KEY as the 3rd argument. Here it passes numeric width/height values (cast to string via `as unknown as string`). This creates sprites with non-existent textures ("__MISSING") — Phaser logs warnings: `Texture "__MISSING" has no frame "10"`.

**Fix**: Create invisible rectangle walls instead. Use `scene.add.rectangle()` + `scene.physics.add.existing(rect, true)` for static bodies, then add to the walls group. Or use `this.physics.add.staticImage()` with a generated texture. The simplest approach:

```typescript
createWalls() {
  const MAP_WIDTH = this.zones.reduce((max, zone) => Math.max(max, zone.x + zone.width), 20) * TILE_SIZE;
  const MAP_HEIGHT = this.zones.reduce((max, zone) => Math.max(max, zone.y + zone.height), 22) * TILE_SIZE;

  this.walls = this.physics.add.staticGroup();

  // Create border walls as invisible rectangles with static physics bodies
  const wallThickness = 10;
  const walls = [
    { x: MAP_WIDTH / 2, y: 0, w: MAP_WIDTH, h: wallThickness },                    // top
    { x: MAP_WIDTH / 2, y: MAP_HEIGHT, w: MAP_WIDTH, h: wallThickness },            // bottom
    { x: 0, y: MAP_HEIGHT / 2, w: wallThickness, h: MAP_HEIGHT },                   // left
    { x: MAP_WIDTH, y: MAP_HEIGHT / 2, w: wallThickness, h: MAP_HEIGHT },            // right
  ];

  walls.forEach(w => {
    const rect = this.add.rectangle(w.x, w.y, w.w, w.h, 0x000000, 0); // invisible
    this.physics.add.existing(rect, true); // true = static body
    this.walls.add(rect);
  });
}
```

### Bug 5: AgentMovement uses nonexistent schedule fields

**File**: `src/game/AgentMovement.ts`, `findCurrentActivity()` (~line 106)

```typescript
// CURRENT (BROKEN):
private findCurrentActivity(schedule: any[], currentTime: number): any | null {
    for (const activity of schedule) {
      const startTime = activity.startHour * 60 + activity.startMinute;  // startMinute doesn't exist!
      const endTime = activity.endHour * 60 + activity.endMinute;        // endMinute doesn't exist!
      if (currentTime >= startTime && currentTime < endTime) {
        return activity;
      }
    }
    return null;
}
```

The schedule entries have `startHour` (integer 0-23) and `endHour` (integer 0-23), but NO `startMinute`/`endMinute`. So `activity.startMinute` is `undefined`, making `startTime` = `NaN`, and the comparison always fails. Agents never get their scheduled activity.

Also at line 91: `currentActivity.location` — schedule entries don't have a `location` field, they have `zones` (array). The code should use `activity.zones[0]`.

**Fix**:
```typescript
private findCurrentActivity(schedule: any[], currentTime: number): any | null {
    for (const activity of schedule) {
      const startTime = activity.startHour * 60;  // hours only, no minutes
      const endTime = activity.endHour * 60;
      if (currentTime >= startTime && currentTime < endTime) {
        return activity;
      }
    }
    return null;
}
```

And in `updateAgentMovement()` (~line 91), change:
```typescript
// FROM:
if (currentActivity && currentActivity.location !== agent.aiState.location) {
    this.moveToLocation(agent, currentActivity.location);
// TO:
const targetZone = currentActivity.zones?.[0];
if (currentActivity && targetZone && targetZone !== agent.aiState.location) {
    this.moveToLocation(agent, targetZone);
```

## Verification

After making ALL fixes above:

1. **TypeScript must compile cleanly:**
```bash
npx tsc --noEmit
```

2. **Build must succeed:**
```bash
npm run build
```

3. **Manual check (if possible):**
- Start dev server: `npx vite --port 3000`
- Open http://localhost:3000/agent-sim/
- Click any "Старт" button → GameScene should load without crashing
- The "⚙ Настройки" button should be visible and clickable
- Clicking it should open the Settings panel
- No "__MISSING" texture warnings in console

## Files to Modify

1. `src/game/scenes/GameScene.ts` — Bugs 1, 2, 3, 4
2. `src/ui/hud.ts` — Bug 2 (add Settings button)
3. `src/game/AgentMovement.ts` — Bug 5

## Constraints

- Do NOT change the data files (`src/data/*.ts`) — they are correct (field is `zones`).
- Do NOT change the type definition (`src/types/agent.ts`) — it is correct (field is `zones`).
- Do NOT add new npm dependencies.
- Keep all UI text in Russian (existing convention).
- Preserve existing code style and formatting.
