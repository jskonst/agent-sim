import Phaser from 'phaser';
import { AgentProfile } from '../../types/agent';

export class Agent extends Phaser.GameObjects.Container {
  id: string;
  name: string;
  profile: AgentProfile;

  state: {
    location: string;
    activity: string;
    mood: number;
    energy: number;
    x: number;
    y: number;
  };

  sprite: Phaser.GameObjects.Arc;
  nameLabel: Phaser.GameObjects.Text;

  path: Phaser.Math.Vector2[] = [];
  private moveProgress: number = 0;
  private targetPosition: { x: number; y: number } | null = null;

  constructor(scene: Phaser.Scene, profile: AgentProfile, startZone: string) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.id = profile.id;
    this.name = profile.name;
    this.profile = profile;

    this.state = {
      location: startZone,
      activity: 'rest',
      mood: 50,
      energy: 100,
      x: 0,
      y: 0
    };

    // Set initial position based on zone
    const initialPos = this.getZonePosition(startZone);
    this.setPosition(initialPos.x, initialPos.y);

    this.createSprite(scene);
    this.createLabel(scene);
  }

  private getZonePosition(zone: string): { x: number; y: number } {
    // Default positions for zones (can be enhanced)
    const positions: Record<string, { x: number; y: number }> = {
      'town_hall': { x: 480, y: 480 },
      'market': { x: 320, y: 640 },
      'tavern': { x: 640, y: 320 },
      'blacksmith': { x: 160, y: 480 },
      'temple': { x: 800, y: 640 },
      'farm': { x: 256, y: 800 },
      'house_1': { x: 384, y: 256 },
      'house_2': { x: 576, y: 256 },
      'fountain': { x: 480, y: 384 },
      'castle_gate': { x: 480, y: 896 },
      'city_hall': { x: 480, y: 480 },
      'supermarket': { x: 256, y: 640 },
      'cafe': { x: 704, y: 384 },
      'auto_repair': { x: 160, y: 576 },
      'park': { x: 384, y: 800 },
      'school': { x: 640, y: 704 },
      'bus_stop': { x: 480, y: 160 },
      'community_center': { x: 800, y: 480 },
      'house_3': { x: 320, y: 320 },
      'house_4': { x: 576, y: 320 },
      'command_center': { x: 480, y: 480 },
      'medbay': { x: 256, y: 640 },
      'bar': { x: 704, y: 320 },
      'cargo_dock': { x: 160, y: 576 },
      'research_lab': { x: 800, y: 704 },
      'living_quarters_1': { x: 320, y: 256 },
      'living_quarters_2': { x: 640, y: 256 },
      'corridors': { x: 480, y: 384 },
      'hangar': { x: 480, y: 800 },
      'security_station': { x: 800, y: 480 }
    };

    return positions[zone] || { x: 480, y: 480 };
  }

  private createSprite(scene: Phaser.Scene) {
    this.sprite = scene.add.circle(0, 0, 10, this.getAvatarColor());
    this.add(this.sprite);
  }

  private createLabel(scene: Phaser.Scene) {
    this.nameLabel = scene.add.text(0, -15, this.name, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    this.add(this.nameLabel);
  }

  private getAvatarColor(): number {
    const colors: Record<string, number> = {
      'purple': 0x9b59b6,
      'green': 0x2ecc71,
      'blue': 0x3498db,
      'red': 0xe74c3c,
      'orange': 0xf39c12,
      'yellow': 0xf1c40f,
      'pink': 0xe91e63,
      'cyan': 0x00bcd4,
      'gray': 0x95a5a6
    };

    return colors[this.profile.avatar] || 0x95a5a6;
  }

  update(gameHour: number, agents: Agent[]): void {
    // Handle movement if target is set
    if (this.targetPosition) {
      this.moveToTarget();
    }

    // Check schedule and change activity if needed
    const activity = this.getActivityAtHour(gameHour);
    if (activity && activity.activity !== this.state.activity) {
      this.changeActivity(activity.activity, activity.zones[0]);
    }

    // Update stats
    this.updateStats();

    // Handle interactions with nearby agents
    this.handleAgentInteractions(agents);
  }

  private moveToTarget() {
    if (!this.targetPosition) return;

    const dx = this.targetPosition.x - this.x;
    const dy = this.targetPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Reached target
      this.targetPosition = null;
      return;
    }

    const speed = 2; // pixels per frame
    const moveX = (dx / distance) * speed;
    const moveY = (dy / distance) * speed;

    this.x += moveX;
    this.y += moveY;
  }

  setTarget(x: number, y: number): void {
    this.targetPosition = { x, y };
  }

  hasTarget(): boolean {
    return this.targetPosition !== null;
  }

  getTarget(): { x: number; y: number } | null {
    return this.targetPosition;
  }

  clearTarget(): void {
    this.targetPosition = null;
  }

  private getActivityAtHour(hour: number): ScheduleEntry | null {
    return this.profile.schedule.find(
      s => hour >= s.startHour && hour < s.endHour
    ) || null;
  }

  private changeActivity(newActivity: string, newZone: string) {
    this.state.activity = newActivity;

    // TODO: Найти путь к новой зоне
    // this.path = this.findPath(this.state.location, newZone);
  }

  private updateStats() {
    // TODO: Пассивное расходование энергии
    // TODO: Изменение настроения в зависимости от локации
  }

  findPath(fromZone: string, toZone: string): Phaser.Math.Vector2[] {
    // TODO: A* pathfinding по тайловой карте
    // Пока заглушка - возвращаем пустой путь
    return [];
  }

  setPosition(x: number, y: number): this {
    super.setPosition(x, y);
    this.state.x = x;
    this.state.y = y;
    return this;
  }
}