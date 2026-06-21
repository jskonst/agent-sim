import { Scene } from 'phaser';
import { SCENARIOS, ScenarioConfig } from '../config/scenarios';

export class MenuScene extends Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const centerX = this.scale.width / 2;

    this.add.text(centerX, 80, 'Agent Sim', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, 140, 'Выберите сценарий', {
      fontSize: '24px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    SCENARIOS.forEach((scenario, index) => {
      const y = 220 + index * 100;

      const nameText = this.add.text(200, y, scenario.name, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const descText = this.add.text(200, y + 30, scenario.description, {
        fontSize: '16px',
        color: '#888888'
      }).setOrigin(0, 0.5);

      const startBtn = this.add.text(600, y + 15, 'Старт', {
        fontSize: '18px',
        backgroundColor: '#4CAF50',
        color: '#ffffff',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      startBtn.setInteractive()
        .on('pointerdown', () => {
          this.startGame(scenario);
        })
        .on('pointerover', () => {
          startBtn.setBackgroundColor('#45a049');
        })
        .on('pointerout', () => {
          startBtn.setBackgroundColor('#4CAF50');
        });
    });

    const loadBtn = this.add.text(centerX, 550, '📁 Загрузить конфигурацию', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#2196F3',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    loadBtn.setInteractive()
      .on('pointerdown', () => {
        this.loadConfig();
      });
  }

  startGame(scenario: ScenarioConfig) {
    this.registry.set('selectedScenario', scenario);
    this.scene.start('GameScene');
  }

  loadConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);
        this.registry.set('customConfig', config);
        this.scene.start('GameScene');
      } catch (err) {
        console.error('Ошибка загрузки конфигурации:', err);
      }
    };

    input.click();
  }
}