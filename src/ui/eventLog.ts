import Phaser from 'phaser';

interface LogEntry {
  tick: number;
  text: string;
  color: string;
}

export class EventLog {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private entries: LogEntry[] = [];
  private entryTexts: Phaser.GameObjects.Text[] = [];
  private scene: Phaser.Scene;
  private readonly MAX_ENTRIES = 10;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const cam = scene.cameras.main;
    const panelWidth = 400;
    const panelHeight = 150;
    const x = 10;
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

    this.titleText = scene.add.text(8, 4, '📋 Event Log', {
      fontSize: '11px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    });

    this.container.add([this.bg, this.border, this.titleText]);

    for (let i = 0; i < this.MAX_ENTRIES; i++) {
      const text = scene.add.text(8, 22 + i * 12, '', {
        fontSize: '10px',
        color: '#aaaaaa',
      });
      this.entryTexts.push(text);
      this.container.add(text);
    }
  }

  addEntry(text: string, color: string = '#aaaaaa', tick: number = 0): void {
    this.entries.push({ tick, text, color });
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries.shift();
    }
    this.refreshDisplay();
  }

  clear(): void {
    this.entries = [];
    this.entryTexts.forEach(t => t.setText(''));
  }

  private refreshDisplay(): void {
    for (let i = 0; i < this.MAX_ENTRIES; i++) {
      if (i < this.entries.length) {
        const entry = this.entries[i];
        this.entryTexts[i].setText(entry.text);
        this.entryTexts[i].setColor(entry.color);
      } else {
        this.entryTexts[i].setText('');
      }
    }
  }
}
