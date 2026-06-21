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

    this.createSprite(scene);
    this.createLabel(scene);
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
    // TODO: Движение по пути
    if (this.path.length > 0) {
      this.moveAlongPath();
    }

    // TODO: Проверка расписания
    const activity = this.getActivityAtHour(gameHour);
    if (activity && activity.activity !== this.state.activity) {
      this.changeActivity(activity.activity, activity.preferredZones[0]);
    }

    // TODO: Обновление энергии и настроения
    this.updateStats();
  }

  private moveAlongPath() {
    // TODO: Плавное движение по тайлам
  }

  private getActivityAtHour(hour: number): { activity: string; zones: string[] } | null {
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