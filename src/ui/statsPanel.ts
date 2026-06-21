import Phaser from 'phaser';
import { Agent } from '../game/entities/Agent';

export class StatsPanel {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private avgMoodText: Phaser.GameObjects.Text;
  private avgEnergyText: Phaser.GameObjects.Text;
  private busyCountText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const cam = scene.cameras.main;
    const panelWidth = 170;
    const panelHeight = 80;
    const x = cam.width - panelWidth - 10;
    const y = cam.height - panelHeight - 10;

    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(150);

    this.bg = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.7);
    this.bg.setOrigin(0, 0);

    this.border = scene.add.rectangle(0, 0, panelWidth, panelHeight);
    this.border.setOrigin(0, 0);
    this.border.setFillStyle(0x000000, 0);
    this.border.setStrokeStyle(1, 0x4ecdc4, 0.5);

    this.titleText = scene.add.text(8, 4, '📊 Office Stats', {
      fontSize: '11px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    });

    this.avgMoodText = scene.add.text(8, 22, '😊 Настроение: --', {
      fontSize: '11px',
      color: '#48bb78',
    });

    this.avgEnergyText = scene.add.text(8, 38, '⚡ Энергия: --', {
      fontSize: '11px',
      color: '#4299e1',
    });

    this.busyCountText = scene.add.text(8, 54, '💼 Занято: --/--', {
      fontSize: '11px',
      color: '#ecc94b',
    });

    this.container.add([
      this.bg, this.border,
      this.titleText,
      this.avgMoodText, this.avgEnergyText, this.busyCountText,
    ]);
  }

  update(agents: Agent[]): void {
    if (agents.length === 0) return;

    const avgMood = agents.reduce((s, a) => s + a.aiState.mood, 0) / agents.length;
    const avgEnergy = agents.reduce((s, a) => s + a.aiState.energy, 0) / agents.length;
    const busyCount = agents.filter(a =>
      a.aiState.activity === 'work' || a.aiState.activity === 'meeting'
    ).length;

    this.avgMoodText.setText(`😊 Настроение: ${Math.round(avgMood)}%`);
    this.avgEnergyText.setText(`⚡ Энергия: ${Math.round(avgEnergy)}%`);
    this.busyCountText.setText(`💼 Занято: ${busyCount}/${agents.length}`);
  }
}
