import Phaser from 'phaser';
import { HUD } from '../../ui/hud';
import { AgentPanel } from '../../ui/agentPanel';
import { EventLog } from '../../ui/eventLog';
import { StatsPanel } from '../../ui/statsPanel';
import { TokenPanel } from '../../ui/tokenPanel';
import { SettingsPanel } from '../../ui/settingsPanel';
import { Agent } from '../entities/Agent';
import { MEDIEVAL_AGENTS } from '../../data/medieval_agents';
import { MODERN_AGENTS } from '../../data/modern_agents';
import { SCIFI_AGENTS } from '../../data/scifi_agents';
import { MovementSystem } from '../systems/MovementSystem';
import { GameTime } from '../GameTime';
import { AgentMovement } from '../AgentMovement';
import { ScheduleEntry } from '../../types/agent';

const TILE_SIZE = 32;

interface ZoneConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

const MEDIEVAL_ZONES: ZoneConfig[] = [
  { id: 'town_hall', name: 'Ратуша', x: 1, y: 1, width: 6, height: 4, color: 0x2d3748 },
  { id: 'market', name: 'Рынок', x: 8, y: 1, width: 5, height: 4, color: 0x2c5282 },
  { id: 'tavern', name: 'Таверна', x: 15, y: 1, width: 4, height: 4, color: 0x975a16 },
  { id: 'blacksmith', name: 'Кузница', x: 1, y: 7, width: 6, height: 3, color: 0x744210 },
  { id: 'temple', name: 'Храм', x: 8, y: 7, width: 5, height: 3, color: 0x553c9a },
  { id: 'farm', name: 'Ферма', x: 15, y: 7, width: 4, height: 3, color: 0x276749 },
  { id: 'house_1', name: 'Дом 1', x: 1, y: 13, width: 6, height: 3, color: 0x2f855a },
  { id: 'house_2', name: 'Дом 2', x: 8, y: 13, width: 5, height: 3, color: 0x2b6cb0 },
  { id: 'fountain', name: 'Фонтан', x: 15, y: 13, width: 4, height: 3, color: 0x4299e1 },
  { id: 'castle_gate', name: 'Ворота замка', x: 1, y: 19, width: 18, height: 3, color: 0x6b46c1 }
];

const MODERN_ZONES: ZoneConfig[] = [
  { id: 'city_hall', name: 'Мэрия', x: 1, y: 1, width: 6, height: 4, color: 0x2d3748 },
  { id: 'supermarket', name: 'Супермаркет', x: 8, y: 1, width: 5, height: 4, color: 0x2c5282 },
  { id: 'cafe', name: 'Кафе', x: 15, y: 1, width: 4, height: 4, color: 0x975a16 },
  { id: 'auto_repair', name: 'Автосервис', x: 1, y: 7, width: 6, height: 3, color: 0x744210 },
  { id: 'park', name: 'Парк', x: 8, y: 7, width: 5, height: 3, color: 0x276749 },
  { id: 'school', name: 'Школа', x: 15, y: 7, width: 4, height: 3, color: 0x553c9a },
  { id: 'house_1', name: 'Дом 1', x: 1, y: 13, width: 6, height: 3, color: 0x2f855a },
  { id: 'house_2', name: 'Дом 2', x: 8, y: 13, width: 5, height: 3, color: 0x2b6cb0 },
  { id: 'bus_stop', name: 'Автобусная остановка', x: 15, y: 13, width: 4, height: 3, color: 0x4299e1 },
  { id: 'community_center', name: 'Общественный центр', x: 1, y: 19, width: 18, height: 3, color: 0x6b46c1 }
];

const SCIFI_ZONES: ZoneConfig[] = [
  { id: 'command_center', name: 'Командный центр', x: 1, y: 1, width: 6, height: 4, color: 0x2d3748 },
  { id: 'medbay', name: 'Медбей', x: 8, y: 1, width: 5, height: 4, color: 0x2c5282 },
  { id: 'bar', name: 'Бар', x: 15, y: 1, width: 4, height: 4, color: 0x975a16 },
  { id: 'cargo_dock', name: 'Грузовой док', x: 1, y: 7, width: 6, height: 3, color: 0x744210 },
  { id: 'research_lab', name: 'Исследования', x: 8, y: 7, width: 5, height: 3, color: 0x553c9a },
  { id: 'living_quarters_1', name: 'Жилой модуль 1', x: 15, y: 7, width: 4, height: 3, color: 0x2f855a },
  { id: 'living_quarters_2', name: 'Жилой модуль 2', x: 1, y: 13, width: 6, height: 3, color: 0x2b6cb0 },
  { id: 'corridors', name: 'Коридоры', x: 8, y: 13, width: 5, height: 3, color: 0x4299e1 },
  { id: 'hangar', name: 'Ангар', x: 15, y: 13, width: 4, height: 3, color: 0x6b46c1 },
  { id: 'security_station', name: 'Служба безопасности', x: 1, y: 19, width: 18, height: 3, color: 0xe53e3e }
];

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private hud!: HUD;
  private agentPanel!: AgentPanel;
  private eventLog!: EventLog;
  private statsPanel!: StatsPanel;
  private tokenPanel!: TokenPanel;
  private settingsPanel!: SettingsPanel;
  private currentZone: string = 'town_hall';
  private zoneTexts: Phaser.GameObjects.Text[] = [];
  private agents: Agent[] = [];
  private gameHour: number = 8;
  private gameMinute: number = 30;
  private tickAccumulator: number = 0;
  private readonly TICK_INTERVAL: number = 1000;
  private readonly GAME_MINUTES_PER_TICK: number = 5;
  private observedAgentIndex: number = -1;
  private scenario: string = 'medieval';
  private zones: ZoneConfig[] = [];

  // Phase 2: Game systems
  private gameTime!: GameTime;
  private agentMovement!: AgentMovement;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const selectedScenario = this.registry.get('selectedScenario') as any;
    const customConfig = this.registry.get('customConfig') as any;

    // Initialize Phase 2 systems
    this.gameTime = new GameTime(0.5); // 0.5 game minutes per real second
    this.agentMovement = new AgentMovement(this, this.gameTime);

    if (customConfig) {
      this.scenario = 'custom';
      this.loadCustomConfig(customConfig);
    } else if (selectedScenario) {
      this.scenario = selectedScenario.scenario;
      this.loadScenario(selectedScenario);
    } else {
      this.scenario = 'medieval';
      this.loadDefaultMedieval();
    }

    this.drawMap();
    this.createPlayer();
    this.createWalls();
    this.setupCamera();
    this.hud = new HUD(this);
    this.agentPanel = new AgentPanel(this);
    this.eventLog = new EventLog(this);
    this.statsPanel = new StatsPanel(this);
    this.tokenPanel = new TokenPanel(this);
    this.settingsPanel = new SettingsPanel();
    this.settingsPanel.applySaved();
    this.setupInput();
    this.physics.add.collider(this.player, this.walls);

    MovementSystem.getInstance();
    this.createAgents();
    this.hud.setAgents(this.agents);

    // Add agents to movement system
    this.agents.forEach(agent => {
      this.agentMovement.addAgent(agent);
    });

    window.addEventListener('beforeunload', () => {
      // Phase 3: Persistence
      // this.agents.forEach(a => a.persistNow());
    });

    this.setupObservation();
    this.setupClickHandler();
  }

  private loadScenario(selectedScenario: any) {
    switch (selectedScenario.scenario) {
      case 'medieval':
        this.gameHour = selectedScenario.time.startHour;
        this.zones = MEDIEVAL_ZONES;
        this.currentZone = 'town_hall';
        break;
      case 'modern':
        this.gameHour = selectedScenario.time.startHour;
        this.zones = MODERN_ZONES;
        this.currentZone = 'city_hall';
        break;
      case 'scifi':
        this.gameHour = selectedScenario.time.startHour;
        this.zones = SCIFI_ZONES;
        this.currentZone = 'command_center';
        break;
    }
  }

  private loadDefaultMedieval() {
    this.gameHour = 8;
    this.zones = MEDIEVAL_ZONES;
    this.currentZone = 'town_hall';
  }

  private loadCustomConfig(config: any) {
    this.gameHour = config.time.startHour;
    this.zones = config.locations.map((loc: any) => ({
      id: loc.id,
      name: loc.name,
      x: loc.x,
      y: loc.y,
      width: loc.width,
      height: loc.height,
      color: 0x2d3748
    }));
    this.currentZone = config.locations[0]?.id || 'default';
  }

  drawMap() {
    const MAP_WIDTH = this.zones.reduce((max, zone) => Math.max(max, zone.x + zone.width), 20) * TILE_SIZE;
    const MAP_HEIGHT = this.zones.reduce((max, zone) => Math.max(max, zone.y + zone.height), 22) * TILE_SIZE;

    this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH, MAP_HEIGHT, 0x1a1a2e);

    this.zones.forEach(zone => {
      const centerX = zone.x * TILE_SIZE + (zone.width * TILE_SIZE) / 2;
      const centerY = zone.y * TILE_SIZE + (zone.height * TILE_SIZE) / 2;

      this.add.rectangle(
        centerX,
        centerY,
        zone.width * TILE_SIZE - 4,
        zone.height * TILE_SIZE - 4,
        zone.color,
        0.3
      ).setStrokeStyle(2, zone.color);

      const zoneText = this.add.text(centerX, centerY, zone.name, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#00000066',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5);

      this.zoneTexts.push(zoneText);
    });
  }

  createPlayer() {
    const startZone = this.zones[0];
    if (startZone) {
      const centerX = startZone.x * TILE_SIZE + (startZone.width * TILE_SIZE) / 2;
      const centerY = startZone.y * TILE_SIZE + (startZone.height * TILE_SIZE) / 2;

      this.player = this.add.rectangle(centerX, centerY, 20, 20, 0xff6b6b);
      this.physics.add.existing(this.player);
    }
  }

  createWalls() {
    const MAP_WIDTH = this.zones.reduce((max, zone) => Math.max(max, zone.x + zone.width), 20) * TILE_SIZE;
    const MAP_HEIGHT = this.zones.reduce((max, zone) => Math.max(max, zone.y + zone.height), 22) * TILE_SIZE;

    this.walls = this.physics.add.staticGroup();

    // Create border walls
    this.walls.create(MAP_WIDTH / 2, 0, MAP_WIDTH, 10).refreshBody();
    this.walls.create(MAP_WIDTH / 2, MAP_HEIGHT, MAP_WIDTH, 10).refreshBody();
    this.walls.create(0, MAP_HEIGHT / 2, 10, MAP_HEIGHT).refreshBody();
    this.walls.create(MAP_WIDTH, MAP_HEIGHT / 2, 10, MAP_HEIGHT).refreshBody();
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2000, 2000);
    this.cameras.main.setZoom(1);
  }

  setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  createAgents() {
    let agentsData: any[] = [];

    switch (this.scenario) {
      case 'medieval':
        agentsData = MEDIEVAL_AGENTS;
        break;
      case 'modern':
        agentsData = MODERN_AGENTS;
        break;
      case 'scifi':
        agentsData = SCIFI_AGENTS;
        break;
      case 'custom':
        agentsData = this.registry.get('customConfig')?.agents || [];
        break;
      default:
        agentsData = MEDIEVAL_AGENTS;
    }

    agentsData.forEach((profile, index) => {
      const firstActivity = profile.schedule[0];
      const startZone = firstActivity?.preferredZones[0] || this.zones[0]?.id || 'town_hall';

      const zone = this.zones.find(z => z.id === startZone);
      if (zone) {
        const centerX = zone.x * TILE_SIZE + (zone.width * TILE_SIZE) / 2;
        const centerY = zone.y * TILE_SIZE + (zone.height * TILE_SIZE) / 2;

        const agent = new Agent(this, profile, startZone);
        agent.setPosition(centerX + (index % 2) * 30 - 15, centerY + (index % 2) * 30 - 15);
        this.agents.push(agent);
      }
    });
  }

  handleMovement() {
    const speed = 200;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.body.setVelocityX(speed);
    } else {
      this.player.body.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.body.setVelocityY(speed);
    } else {
      this.player.body.setVelocityY(0);
    }
  }

  updateCurrentZone() {
    const playerX = this.player.x;
    const playerY = this.player.y;

    const tileX = Math.floor(playerX / TILE_SIZE);
    const tileY = Math.floor(playerY / TILE_SIZE);

    const newZone = this.zones.find(zone =>
      tileX >= zone.x && tileX < zone.x + zone.width &&
      tileY >= zone.y && tileY < zone.y + zone.height
    );

    if (newZone && newZone.id !== this.currentZone) {
      this.currentZone = newZone.id;
    }
  }

  advanceTime() {
    this.gameMinute += this.GAME_MINUTES_PER_TICK;
    if (this.gameMinute >= 60) {
      this.gameMinute = 0;
      this.gameHour = (this.gameHour + 1) % 24;
    }

    this.agents.forEach(agent => {
      agent.update(this.gameHour, this.agents);
    });
  }

  setupObservation() {
    this.input.keyboard!.on('keydown-TAB', () => {
      this.nextAgent();
    });

    this.input.keyboard!.on('keydown-ESC', () => {
      this.observedAgentIndex = -1;
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
      this.agentPanel.hide();
    });

    this.input.keyboard!.on('keydown-T', () => {
      this.tokenPanel.toggle();
    });

    this.input.keyboard!.on('keydown-S', () => {
      if (this.settingsPanel.isVisible()) {
        this.settingsPanel.hide();
        this.scene.resume();
      } else {
        this.scene.pause();
        this.settingsPanel.show(() => {
          this.scene.resume();
        });
      }
    });
  }

  nextAgent() {
    if (this.agents.length === 0) return;

    this.observedAgentIndex = (this.observedAgentIndex + 1) % (this.agents.length + 1);

    if (this.observedAgentIndex === this.agents.length) {
      this.observedAgentIndex = -1;
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
      this.agentPanel.hide();
    } else {
      const agent = this.agents[this.observedAgentIndex];
      this.cameras.main.startFollow(agent, true, 0.1, 0.1);
      this.agentPanel.show(agent);
    }
  }

  setupClickHandler() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const clickX = pointer.x;
      const clickY = pointer.y;

      this.agents.forEach((agent, index) => {
        const distance = Phaser.Math.Distance.Between(clickX, clickY, agent.x, agent.y);
        if (distance < 30) {
          this.observedAgentIndex = index;
          this.cameras.main.startFollow(agent, true, 0.1, 0.1);
          this.agentPanel.show(agent);
        }
      });
    });
  }

  update(time: number, delta: number) {
    // Update game time
    this.gameTime.update(delta / 1000); // Convert to seconds

    // Update agent movement system
    this.agentMovement.update(delta);

    // Handle interactions
    this.agentMovement.handleInteractions();

    // Update player movement
    this.handleMovement();
    this.updateCurrentZone();

    // Update HUD with current time
    this.hud.update(this.currentZone, this.gameTime.getHours(), this.gameTime.getMinutes());

    // Update individual agents
    this.agents.forEach((agent) => {
      agent.update(this.gameTime.getHours(), this.agents);
    });
  }
}