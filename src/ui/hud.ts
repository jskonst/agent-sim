import Phaser from 'phaser';
import { llmClient } from '../ai/llmClient';
import { Agent, AgentPersistData } from '../game/entities/Agent';

export class HUD {
  private scene: Phaser.Scene;
  private timeText: Phaser.GameObjects.Text;
  private locationText: Phaser.GameObjects.Text;
  private agentsText: Phaser.GameObjects.Text;
  private apiKeyText: Phaser.GameObjects.Text;
  private urlText: Phaser.GameObjects.Text;
  private exportText: Phaser.GameObjects.Text;
  private importText: Phaser.GameObjects.Text;
  private agents: Agent[] = [];

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

    const urlHost = extractHost(llmClient.getBaseUrl());
    this.urlText = scene.add.text(16, 150, `[URL: ${urlHost}]`, {
      fontSize: '12px',
      color: '#4ecdc4',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100).setInteractive();

    this.urlText.on('pointerdown', () => {
      const url = prompt('Enter LLM API base URL:', llmClient.getBaseUrl());
      if (url) {
        llmClient.setBaseUrl(url);
        this.urlText.setText(`[URL: ${extractHost(url)}]`);
      }
    });

    // ── Export button ──
    this.exportText = scene.add.text(16, 175, '[Export State]', {
      fontSize: '12px',
      color: '#48bb78',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100).setInteractive();

    this.exportText.on('pointerdown', () => this.exportToFile());

    // ── Import button ──
    this.importText = scene.add.text(16, 195, '[Import State]', {
      fontSize: '12px',
      color: '#ecc94b',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100).setInteractive();

    this.importText.on('pointerdown', () => this.importFromFile());
  }

  setAgents(agents: Agent[]): void {
    this.agents = agents;
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

  // ── Privates ──

  private exportToFile(): void {
    if (this.agents.length === 0) return;

    const data: Record<string, AgentPersistData> = {};
    for (const agent of this.agents) {
      data[agent.id] = agent.getPersistData();
    }

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      agents: data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-sim-state-${formatDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private importFromFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          const agentsData = parsed.agents as Record<string, AgentPersistData>;
          if (!agentsData) {
            alert('Invalid file format: "agents" key not found');
            return;
          }

          let restored = 0;
          for (const agent of this.agents) {
            if (agentsData[agent.id]) {
              agent.restoreFromData(agentsData[agent.id]);
              restored++;
            }
          }

          alert(`Imported state for ${restored} agents`);
        } catch {
          alert('Failed to parse file');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }
}

function extractHost(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return url.length > 25 ? url.slice(0, 25) + '…' : url;
  }
}

function formatDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${y}-${m}-${day}_${h}-${min}`;
}