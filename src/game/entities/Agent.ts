import Phaser from 'phaser';
import { AgentProfile, AVATAR_COLORS } from '../../data/agents';
import { MovementSystem } from '../systems/MovementSystem';
import { ScheduleSystem } from '../systems/ScheduleSystem';

interface AgentState {
  location: string;
  activity: string;
  mood: number;
  energy: number;
  targetX: number;
  targetY: number;
}

export class Agent {
  id: string;
  name: string;
  profile: AgentProfile;
  state: AgentState;

  sprite: Phaser.GameObjects.Arc;
  nameLabel: Phaser.GameObjects.Text;
  scene: Phaser.Scene;

  private path: { x: number; y: number }[];
  private pathIndex: number;
  private tileX: number;
  private tileY: number;
  private readonly TILE_SIZE = 32;
  private readonly MOVEMENT_SPEED = 2;
  private currentTargetZone: string;
  private readonly TARGET_OFFSET = 16;
  private previousZone: string = '';
  private previousActivity: string = '';
  private highlightRing: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    profile: AgentProfile,
    startTileX: number,
    startTileY: number
  ) {
    this.scene = scene;
    this.profile = profile;
    this.id = profile.id;
    this.name = profile.name;
    this.tileX = startTileX;
    this.tileY = startTileY;

    this.path = [];
    this.pathIndex = 0;
    this.currentTargetZone = '';

    this.state = {
      location: 'corridor',
      activity: 'rest',
      mood: 70,
      energy: 80,
      targetX: startTileX,
      targetY: startTileY,
    };

    const color = AVATAR_COLORS[profile.avatar] || 0x48bb78;
    const pixelX = startTileX * this.TILE_SIZE + this.TARGET_OFFSET;
    const pixelY = startTileY * this.TILE_SIZE + this.TARGET_OFFSET;

    this.sprite = scene.add.circle(pixelX, pixelY, 10, color);
    this.sprite.setStrokeStyle(1, 0xffffff);
    this.sprite.setDepth(10);

    this.nameLabel = scene.add.text(pixelX, pixelY - 16, profile.name, {
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 2, y: 1 },
    });
    this.nameLabel.setOrigin(0.5);
    this.nameLabel.setDepth(11);

    this.highlightRing = scene.add.circle(pixelX, pixelY, 14);
    this.highlightRing.setFillStyle(0x000000, 0);
    this.highlightRing.setStrokeStyle(3, 0x4ecdc4);
    this.highlightRing.setDepth(12);
    this.highlightRing.setVisible(false);
  }

  update(gameHour: number, agents: Agent[]): void {
    const scheduleSystem = ScheduleSystem.getInstance();
    const movementSystem = MovementSystem.getInstance();

    if (this.path.length > 0 && this.pathIndex < this.path.length) {
      this.moveAlongPath();
      return;
    }

    const schedule = scheduleSystem.getCurrentActivity(this.profile, gameHour);

    if (schedule.targetZone !== this.currentTargetZone) {
      this.currentTargetZone = schedule.targetZone;
      this.state.activity = 'moving';
      this.findPathToZone(schedule.targetZone, movementSystem);
      return;
    }

    this.state.activity = schedule.activity;
    this.state.location = this.currentTargetZone;

    this.updateStats();
    this.updateVisuals();
  }

  private moveAlongPath(): void {
    const movementSystem = MovementSystem.getInstance();

    if (this.pathIndex >= this.path.length) {
      this.state.activity = 'idle';
      return;
    }

    const target = this.path[this.pathIndex];
    const targetPixelX = target.x * this.TILE_SIZE + this.TARGET_OFFSET;
    const targetPixelY = target.y * this.TILE_SIZE + this.TARGET_OFFSET;

    const dx = targetPixelX - this.sprite.x;
    const dy = targetPixelY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.MOVEMENT_SPEED) {
      this.sprite.x = targetPixelX;
      this.sprite.y = targetPixelY;
      this.tileX = target.x;
      this.tileY = target.y;
      this.pathIndex++;
    } else {
      const vx = (dx / distance) * this.MOVEMENT_SPEED;
      const vy = (dy / distance) * this.MOVEMENT_SPEED;
      this.sprite.x += vx;
      this.sprite.y += vy;
    }

    this.nameLabel.x = this.sprite.x;
    this.nameLabel.y = this.sprite.y - 16;
  }

  private findPathToZone(zoneId: string, movementSystem: MovementSystem): void {
    const zoneTiles = this.getZoneTiles(zoneId);
    if (zoneTiles.length === 0) return;

    const start = { x: this.tileX, y: this.tileY };
    let bestPath: { x: number; y: number }[] = [];

    for (const tile of zoneTiles) {
      const path = movementSystem.findPath(start, tile);
      if (path.length > 0 && (bestPath.length === 0 || path.length < bestPath.length)) {
        bestPath = path;
      }
    }

    this.path = bestPath;
    this.pathIndex = 0;
  }

  private getZoneTiles(zoneId: string): { x: number; y: number }[] {
    const zones: Record<string, { x: number; y: number; width: number; height: number }> = {
      reception: { x: 0, y: 0, width: 6, height: 6 },
      open_space_1: { x: 7, y: 0, width: 7, height: 6 },
      open_space_2: { x: 15, y: 0, width: 7, height: 6 },
      meeting_1: { x: 0, y: 7, width: 6, height: 4 },
      meeting_2: { x: 15, y: 7, width: 7, height: 4 },
      kitchen: { x: 0, y: 12, width: 6, height: 5 },
      office_cow: { x: 15, y: 12, width: 7, height: 5 },
      wc_m: { x: 0, y: 18, width: 6, height: 4 },
      wc_f: { x: 15, y: 18, width: 7, height: 4 },
    };

    const zone = zones[zoneId];
    if (!zone) return [];

    const tiles: { x: number; y: number }[] = [];
    for (let y = zone.y + 1; y < zone.y + zone.height - 1; y++) {
      for (let x = zone.x + 1; x < zone.x + zone.width - 1; x++) {
        tiles.push({ x, y });
      }
    }

    return tiles;
  }

  private updateStats(): void {
    const energyDrain = this.state.activity === 'work' ? -0.02 : 0;
    const moodChange = this.state.activity === 'socialize' ? 0.02 : 0;

    this.state.energy = Math.max(0, Math.min(100, this.state.energy + energyDrain));
    this.state.mood = Math.max(0, Math.min(100, this.state.mood + moodChange));
  }

  private updateVisuals(): void {
    this.sprite.x = this.tileX * this.TILE_SIZE + this.TARGET_OFFSET;
    this.sprite.y = this.tileY * this.TILE_SIZE + this.TARGET_OFFSET;
    this.nameLabel.x = this.sprite.x;
    this.nameLabel.y = this.sprite.y - 16;
    this.highlightRing.x = this.sprite.x;
    this.highlightRing.y = this.sprite.y;
  }

  getZoneChange(): string | null {
    if (this.state.location !== this.previousZone) {
      this.previousZone = this.state.location;
      return this.state.location;
    }
    return null;
  }

  getActivityChange(): string | null {
    if (this.state.activity !== this.previousActivity) {
      this.previousActivity = this.state.activity;
      return this.state.activity;
    }
    return null;
  }

  setHighlighted(highlighted: boolean): void {
    this.highlightRing.setVisible(highlighted);
    if (highlighted) {
      this.sprite.setStrokeStyle(3, 0x4ecdc4);
    } else {
      this.sprite.setStrokeStyle(1, 0xffffff);
    }
  }
}
