import Phaser from 'phaser';
import { llmClient } from '../ai/llmClient';

export class HUD {
  private scene: Phaser.Scene;
  private timeText: Phaser.GameObjects.Text;
  private locationText: Phaser.GameObjects.Text;
  private agentsText: Phaser.GameObjects.Text;
  private apiKeyText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.timeText = scene.add.text(16, 16, '08:30', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    this.locationText = scene.add.text(16, 56, '📍 Reception', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    this.agentsText = scene.add.text(16, 96, 'Agents: 15', {
      fontSize: '14px',
      color: '#aaaaaa',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    const apiKeyLabel = llmClient.hasApiKey() ? 'API Key: ✓' : '[Set OpenRouter API Key]';
    const apiKeyColor = llmClient.hasApiKey() ? '#48bb78' : '#ecc94b';

    this.apiKeyText = scene.add.text(16, 130, apiKeyLabel, {
      fontSize: '12px',
      color: apiKeyColor,
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100).setInteractive();

    this.apiKeyText.on('pointerdown', () => {
      const key = prompt('Enter OpenRouter API key:');
      if (key) {
        llmClient.setApiKey(key);
        this.apiKeyText.setText('API Key: ✓');
        this.apiKeyText.setColor('#48bb78');
      }
    });
  }

  update(currentZone: string) {
    const zoneNames: Record<string, string> = {
      reception: 'Reception',
      open_space_1: 'Open Space 1',
      open_space_2: 'Open Space 2',
      meeting_1: 'Meeting Room 1',
      meeting_2: 'Meeting Room 2',
      kitchen: 'Kitchen',
      office_cow: 'Office Coworking',
      wc_m: 'WC Men',
      wc_f: 'WC Women',
      corridor: 'Corridor'
    };

    this.locationText.setText(`📍 ${zoneNames[currentZone] || currentZone}`);
  }

  updateTime(hour: number, minute: number) {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    this.timeText.setText(`${h}:${m}`);
  }

  updateAgentCount(count: number) {
    this.agentsText.setText(`Agents: ${count}`);
  }
}
