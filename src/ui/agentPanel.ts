import Phaser from 'phaser';
import { Agent } from '../game/entities/Agent';

export class AgentPanel {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private roleText: Phaser.GameObjects.Text;
  private moodBg: Phaser.GameObjects.Rectangle;
  private moodBar: Phaser.GameObjects.Rectangle;
  private moodText: Phaser.GameObjects.Text;
  private energyBg: Phaser.GameObjects.Rectangle;
  private energyBar: Phaser.GameObjects.Rectangle;
  private energyText: Phaser.GameObjects.Text;
  private activityText: Phaser.GameObjects.Text;
  private locationText: Phaser.GameObjects.Text;
  private thoughtsText: Phaser.GameObjects.Text;
  private relationshipsText: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const cam = scene.cameras.main;
    const panelX = cam.width - 250;
    const panelY = 10;
    const panelWidth = 240;
    const panelHeight = 280;

    this.container = scene.add.container(panelX, panelY);
    this.container.setScrollFactor(0);
    this.container.setDepth(200);

    this.bg = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x1a1a2e, 0.9);
    this.bg.setOrigin(0, 0);

    this.border = scene.add.rectangle(0, 0, panelWidth, panelHeight);
    this.border.setOrigin(0, 0);
    this.border.setFillStyle(0x000000, 0);
    this.border.setStrokeStyle(2, 0x4ecdc4);

    this.nameText = scene.add.text(12, 12, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.roleText = scene.add.text(12, 34, '', {
      fontSize: '12px',
      color: '#aaaaaa',
    });

    const dividerY1 = 52;
    const divider1 = scene.add.rectangle(12, dividerY1, panelWidth - 24, 1, 0x4ecdc4, 0.5);

    const moodLabelY = 62;
    scene.add.text(12, moodLabelY, 'Настроение', { fontSize: '11px', color: '#cccccc' });
    this.moodBg = scene.add.rectangle(12, moodLabelY + 16, 150, 12, 0x333333).setOrigin(0, 0);
    this.moodBar = scene.add.rectangle(12, moodLabelY + 16, 0, 12, 0x48bb78).setOrigin(0, 0);
    this.moodText = scene.add.text(168, moodLabelY + 14, '0', { fontSize: '11px', color: '#ffffff' });

    const energyLabelY = 100;
    scene.add.text(12, energyLabelY, 'Энергия', { fontSize: '11px', color: '#cccccc' });
    this.energyBg = scene.add.rectangle(12, energyLabelY + 16, 150, 12, 0x333333).setOrigin(0, 0);
    this.energyBar = scene.add.rectangle(12, energyLabelY + 16, 0, 12, 0x4299e1).setOrigin(0, 0);
    this.energyText = scene.add.text(168, energyLabelY + 14, '0', { fontSize: '11px', color: '#ffffff' });

    const divider2Y = 140;
    const divider2 = scene.add.rectangle(12, divider2Y, panelWidth - 24, 1, 0x4ecdc4, 0.5);

    this.activityText = scene.add.text(12, 150, '', { fontSize: '12px', color: '#48bb78' });
    this.locationText = scene.add.text(12, 170, '', { fontSize: '12px', color: '#4299e1' });

    const divider3Y = 192;
    const divider3 = scene.add.rectangle(12, divider3Y, panelWidth - 24, 1, 0x4ecdc4, 0.5);

    this.thoughtsText = scene.add.text(12, 200, '', {
      fontSize: '11px',
      color: '#ecc94b',
      wordWrap: { width: panelWidth - 24 },
    });

    const divider4Y = 232;
    const divider4 = scene.add.rectangle(12, divider4Y, panelWidth - 24, 1, 0x4ecdc4, 0.5);

    this.relationshipsText = scene.add.text(12, 240, '', {
      fontSize: '11px',
      color: '#ed64a6',
      wordWrap: { width: panelWidth - 24 },
    });

    this.container.add([
      this.bg, this.border,
      this.nameText, this.roleText,
      divider1,
      this.moodBg, this.moodBar, this.moodText,
      this.energyBg, this.energyBar, this.energyText,
      divider2,
      this.activityText, this.locationText,
      divider3,
      this.thoughtsText,
      divider4,
      this.relationshipsText,
    ]);

    this.container.setVisible(false);
  }

  show(agent: Agent): void {
    this.container.setVisible(true);
    this.update(agent);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  update(agent: Agent): void {
    if (!this.container.visible) return;

    this.nameText.setText(agent.name);
    this.roleText.setText(agent.profile.role.replace('_', ' '));

    const mood = Math.round(agent.state.mood);
    this.moodBar.width = (mood / 100) * 150;
    this.moodText.setText(`${mood}`);
    if (mood > 60) {
      this.moodBar.setFillStyle(0x48bb78);
    } else if (mood > 30) {
      this.moodBar.setFillStyle(0xecc94b);
    } else {
      this.moodBar.setFillStyle(0xf56565);
    }

    const energy = Math.round(agent.state.energy);
    this.energyBar.width = (energy / 100) * 150;
    this.energyText.setText(`${energy}`);
    if (energy > 60) {
      this.energyBar.setFillStyle(0x4299e1);
    } else if (energy > 30) {
      this.energyBar.setFillStyle(0xecc94b);
    } else {
      this.energyBar.setFillStyle(0xf56565);
    }

    const activityLabels: Record<string, string> = {
      work: '💼 Working',
      meeting: '🤝 Meeting',
      eat: '🍽️ Eating',
      socialize: '💬 Socializing',
      rest: '😴 Resting',
      moving: '🚶 Moving',
      idle: '⏸️ Idle',
    };
    this.activityText.setText(activityLabels[agent.state.activity] || agent.state.activity);

    const zoneLabels: Record<string, string> = {
      reception: 'Reception',
      open_space_1: 'Open Space 1',
      open_space_2: 'Open Space 2',
      meeting_1: 'Meeting Room 1',
      meeting_2: 'Meeting Room 2',
      kitchen: 'Kitchen',
      office_cow: 'Office Coworking',
      wc_m: 'WC Men',
      wc_f: 'WC Women',
      corridor: 'Corridor',
    };
    this.locationText.setText(`📍 ${zoneLabels[agent.state.location] || agent.state.location}`);

    this.thoughtsText.setText('💭 "Надо доделать API"');

    const rels = agent.profile.relationships;
    const relEntries = Object.entries(rels).slice(0, 3);
    if (relEntries.length > 0) {
      const relText = relEntries.map(([name, val]) => `  ${name}: ${val > 0 ? '+' : ''}${val}`).join('\n');
      this.relationshipsText.setText(`🤝 Отношения:\n${relText}`);
    } else {
      this.relationshipsText.setText('🤝 Отношения: нет данных');
    }
  }
}
