import Phaser from 'phaser';
import { Agent } from '../game/entities/Agent';
import { ScenarioConfig } from '../game/config/scenarios';

export class HUD {
  private scene: Phaser.Scene;
  private timeText: Phaser.GameObjects.Text;
  private locationText: Phaser.GameObjects.Text;
  private agentsText: Phaser.GameObjects.Text;
  private scenarioText: Phaser.GameObjects.Text;
  private exportButton: Phaser.GameObjects.Text;
  private agents: Agent[] = [];
  private gameHour: number = 8;
  private gameMinute: number = 30;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.scenarioText = scene.add.text(16, 16, 'Средневековый городок', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    this.timeText = scene.add.text(16, 48, '08:30', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    this.locationText = scene.add.text(16, 80, '📍 Ратуша', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    this.agentsText = scene.add.text(16, 108, 'Agents: 10', {
      fontSize: '14px',
      color: '#aaaaaa',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    this.exportButton = scene.add.text(16, 140, '⬇️ Экспорт конфигурации', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#FF980088',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(100).setInteractive();

    this.exportButton.on('pointerdown', () => {
      this.exportConfig();
    });
  }

  setAgents(agents: Agent[]): void {
    this.agents = agents;
    this.updateAgentCount(agents.length);
  }

  update(currentZone: string, hour: number, minute: number) {
    this.gameHour = hour;
    this.gameMinute = minute;

    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    this.timeText.setText(`${h}:${m}`);

    const zoneNames: Record<string, string> = {
      town_hall: 'Ратуша',
      market: 'Рынок',
      tavern: 'Таверна',
      blacksmith: 'Кузница',
      temple: 'Храм',
      farm: 'Ферма',
      house_1: 'Дом 1',
      house_2: 'Дом 2',
      fountain: 'Фонтан',
      castle_gate: 'Ворота замка',
      city_hall: 'Мэрия',
      supermarket: 'Супермаркет',
      cafe: 'Кафе',
      auto_repair: 'Автосервис',
      park: 'Парк',
      school: 'Школа',
      bus_stop: 'Автобусная остановка',
      community_center: 'Общественный центр',
      command_center: 'Командный центр',
      medbay: 'Медбей',
      bar: 'Бар',
      cargo_dock: 'Грузовой док',
      research_lab: 'Исследования',
      living_quarters_1: 'Жилой модуль 1',
      living_quarters_2: 'Жилой модуль 2',
      corridors: 'Коридоры',
      hangar: 'Ангар',
      security_station: 'Служба безопасности'
    };

    this.locationText.setText(`📍 ${zoneNames[currentZone] || currentZone}`);
  }

  updateAgentCount(count: number) {
    this.agentsText.setText(`Agents: ${count}`);
  }

  setScenario(scenario: string) {
    const scenarioNames: Record<string, string> = {
      medieval: 'Средневековый городок',
      modern: 'Современный пригород',
      scifi: 'Фантастическая станция',
      custom: 'Кастомный сценарий'
    };

    this.scenarioText.setText(scenarioNames[scenario] || scenario);
  }

  exportConfig() {
    const scenario = this.scene.registry.get('selectedScenario') as ScenarioConfig | null;
    const customConfig = this.scene.registry.get('customConfig') as any;

    let config: any;

    if (customConfig) {
      config = {
        ...customConfig,
        agents: this.agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          state: {
            location: agent.state.location,
            activity: agent.state.activity,
            mood: agent.state.mood,
            energy: agent.state.energy,
            x: agent.x,
            y: agent.y
          }
        }))
      };
    } else if (scenario) {
      config = {
        name: scenario.name,
        scenario: scenario.scenario,
        time: scenario.time,
        agents: this.agents.map(agent => ({
          ...agent.profile,
          state: {
            location: agent.state.location,
            activity: agent.state.activity,
            mood: agent.state.mood,
            energy: agent.state.energy,
            x: agent.x,
            y: agent.y
          }
        }))
      };
    } else {
      config = {
        name: 'Medieval Town (default)',
        scenario: 'medieval',
        time: { startHour: this.gameHour, tickRate: 5 },
        agents: this.agents.map(agent => ({
          ...agent.profile,
          state: {
            location: agent.state.location,
            activity: agent.state.activity,
            mood: agent.state.mood,
            energy: agent.state.energy,
            x: agent.x,
            y: agent.y
          }
        }))
      };
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_sim_${scenario?.scenario || 'custom'}_${formatDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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