import Phaser from 'phaser';
import { HUD } from '../../ui/hud';
import { AgentPanel } from '../../ui/agentPanel';
import { EventLog } from '../../ui/eventLog';
import { StatsPanel } from '../../ui/statsPanel';
import { Agent } from '../entities/Agent';
import { AGENTS } from '../../data/agents';
import { MovementSystem } from '../systems/MovementSystem';

const TILE_SIZE = 32;
const MAP_WIDTH = 22;
const MAP_HEIGHT = 22;

interface ZoneConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

const ZONES: ZoneConfig[] = [
  { id: 'reception', name: 'Reception', x: 0, y: 0, width: 6, height: 6, color: 0x2d3748 },
  { id: 'open_space_1', name: 'Open Space 1', x: 7, y: 0, width: 7, height: 6, color: 0x2c5282 },
  { id: 'open_space_2', name: 'Open Space 2', x: 15, y: 0, width: 7, height: 6, color: 0x2b6cb0 },
  { id: 'meeting_1', name: 'Meeting Room 1', x: 0, y: 7, width: 6, height: 4, color: 0x553c9a },
  { id: 'meeting_2', name: 'Meeting Room 2', x: 15, y: 7, width: 7, height: 4, color: 0x6b46c1 },
  { id: 'kitchen', name: 'Kitchen', x: 0, y: 12, width: 6, height: 5, color: 0x276749 },
  { id: 'office_cow', name: 'Office Coworking', x: 15, y: 12, width: 7, height: 5, color: 0x2f855a },
  { id: 'wc_m', name: 'WC Men', x: 0, y: 18, width: 6, height: 4, color: 0x744210 },
  { id: 'wc_f', name: 'WC Women', x: 15, y: 18, width: 7, height: 4, color: 0x975a16 },
];

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private hud!: HUD;
  private agentPanel!: AgentPanel;
  private eventLog!: EventLog;
  private statsPanel!: StatsPanel;
  private currentZone: string = 'reception';
  private zoneTexts: Phaser.GameObjects.Text[] = [];
  private agents: Agent[] = [];
  private gameHour: number = 8;
  private gameMinute: number = 30;
  private tickAccumulator: number = 0;
  private readonly TICK_INTERVAL: number = 1000;
  private readonly GAME_MINUTES_PER_TICK: number = 5;
  private observedAgentIndex: number = -1;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.drawMap();
    this.createPlayer();
    this.createWalls();
    this.setupCamera();
    this.hud = new HUD(this);
    this.agentPanel = new AgentPanel(this);
    this.eventLog = new EventLog(this);
    this.statsPanel = new StatsPanel(this);
    this.setupInput();
    this.physics.add.collider(this.player, this.walls);

    MovementSystem.getInstance();
    this.createAgents();

    this.setupObservation();
    this.setupClickHandler();
  }

  update(time: number, delta: number) {
    this.handleMovement();
    this.updateCurrentZone();
    this.hud.update(this.currentZone);

    this.tickAccumulator += delta;
    if (this.tickAccumulator >= this.TICK_INTERVAL) {
      this.tickAccumulator -= this.TICK_INTERVAL;
      this.advanceTime();
    }

    this.agents.forEach((agent) => {
      const prevZone = agent.state.location;
      const prevActivity = agent.state.activity;
      agent.update(this.gameHour, this.agents);

      const zoneChange = agent.getZoneChange();
      if (zoneChange && zoneChange !== prevZone) {
        const zoneLabels: Record<string, string> = {
          reception: 'Reception', open_space_1: 'Open Space 1', open_space_2: 'Open Space 2',
          meeting_1: 'Meeting Room 1', meeting_2: 'Meeting Room 2', kitchen: 'Kitchen',
          office_cow: 'Office Coworking', wc_m: 'WC Men', wc_f: 'WC Women', corridor: 'Corridor',
        };
        this.eventLog.addEntry(`${agent.name} → ${zoneLabels[zoneChange] || zoneChange}`, '#4ecdc4', this.gameHour * 60 + this.gameMinute);
      }

      const actChange = agent.getActivityChange();
      if (actChange && actChange !== prevActivity && actChange !== 'moving') {
        const actLabels: Record<string, string> = {
          work: 'начал работать', meeting: 'идёт на встречу', eat: 'пошёл есть',
          socialize: 'общается', rest: 'отдыхает', idle: 'бездействует',
        };
        if (actLabels[actChange]) {
          this.eventLog.addEntry(`${agent.name} ${actLabels[actChange]}`, '#48bb78', this.gameHour * 60 + this.gameMinute);
        }
      }
    });

    this.statsPanel.update(this.agents);

    if (this.observedAgentIndex >= 0 && this.observedAgentIndex < this.agents.length) {
      this.agentPanel.update(this.agents[this.observedAgentIndex]);
    }
  }

  private createAgents() {
    const startPositions = [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 9, y: 2 },
      { x: 10, y: 2 },
      { x: 11, y: 2 },
      { x: 9, y: 3 },
      { x: 10, y: 3 },
      { x: 17, y: 2 },
      { x: 18, y: 2 },
      { x: 19, y: 2 },
      { x: 17, y: 3 },
      { x: 18, y: 3 },
    ];

    for (let i = 0; i < AGENTS.length; i++) {
      const pos = startPositions[i] || { x: 2, y: 2 };
      const agent = new Agent(this, AGENTS[i], pos.x, pos.y);
      this.agents.push(agent);
    }
  }

  private advanceTime() {
    this.gameMinute += this.GAME_MINUTES_PER_TICK;
    if (this.gameMinute >= 60) {
      this.gameMinute = 0;
      this.gameHour = (this.gameHour + 1) % 24;
    }

    this.hud.updateTime(this.gameHour, this.gameMinute);
    this.hud.updateAgentCount(this.agents.length);
  }

  private drawMap() {
    const graphics = this.add.graphics();

    ZONES.forEach(zone => {
      graphics.fillStyle(zone.color, 1);
      graphics.fillRect(
        zone.x * TILE_SIZE,
        zone.y * TILE_SIZE,
        zone.width * TILE_SIZE,
        zone.height * TILE_SIZE
      );

      const text = this.add.text(
        (zone.x + zone.width / 2) * TILE_SIZE,
        (zone.y + zone.height / 2) * TILE_SIZE,
        zone.name,
        {
          fontSize: '10px',
          color: '#ffffff',
          align: 'center'
        }
      ).setOrigin(0.5);
      this.zoneTexts.push(text);
    });

    graphics.fillStyle(0x4a5568, 1);
    graphics.fillRect(6 * TILE_SIZE, 0, TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

    graphics.lineStyle(2, 0x718096, 1);
    graphics.strokeRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
  }

  private createPlayer() {
    this.player = this.add.rectangle(
      2 * TILE_SIZE + TILE_SIZE / 2,
      2 * TILE_SIZE + TILE_SIZE / 2,
      24,
      24,
      0x48bb78
    );
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  private createWalls() {
    this.walls = this.physics.add.staticGroup();

    this.createWallBorder();
    this.createRoomDividers();
  }

  private createWallBorder() {
    const wallThickness = 4;

    this.addWall(0, 0, MAP_WIDTH * TILE_SIZE, wallThickness);
    this.addWall(0, MAP_HEIGHT * TILE_SIZE - wallThickness, MAP_WIDTH * TILE_SIZE, wallThickness);
    this.addWall(0, 0, wallThickness, MAP_HEIGHT * TILE_SIZE);
    this.addWall(MAP_WIDTH * TILE_SIZE - wallThickness, 0, wallThickness, MAP_HEIGHT * TILE_SIZE);
  }

  private createRoomDividers() {
    const wallThickness = 4;

    this.addWall(6 * TILE_SIZE - wallThickness / 2, 6 * TILE_SIZE, wallThickness, 1 * TILE_SIZE);
    this.addWall(14 * TILE_SIZE - wallThickness / 2, 6 * TILE_SIZE, wallThickness, 1 * TILE_SIZE);

    this.addWall(6 * TILE_SIZE - wallThickness / 2, 11 * TILE_SIZE, wallThickness, 1 * TILE_SIZE);
    this.addWall(14 * TILE_SIZE - wallThickness / 2, 11 * TILE_SIZE, wallThickness, 1 * TILE_SIZE);

    this.addWall(6 * TILE_SIZE - wallThickness / 2, 17 * TILE_SIZE, wallThickness, 1 * TILE_SIZE);
    this.addWall(14 * TILE_SIZE - wallThickness / 2, 17 * TILE_SIZE, wallThickness, 1 * TILE_SIZE);
  }

  private addWall(x: number, y: number, width: number, height: number) {
    const wall = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x2d3748);
    this.physics.add.existing(wall, true);
    this.walls.add(wall);
  }

  private setupCamera() {
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number) => {
      const camera = this.cameras.main;
      const newZoom = camera.zoom - deltaY * 0.001;
      camera.setZoom(Phaser.Math.Clamp(newZoom, 0.5, 2));
    });
  }

  private setupInput() {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private setupObservation() {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-TAB', () => {
      if (this.agents.length === 0) return;

      if (this.observedAgentIndex >= 0 && this.observedAgentIndex < this.agents.length) {
        this.agents[this.observedAgentIndex].setHighlighted(false);
      }

      this.observedAgentIndex = (this.observedAgentIndex + 1) % this.agents.length;
      const agent = this.agents[this.observedAgentIndex];
      this.cameras.main.startFollow(agent.sprite, true, 0.08, 0.08);
      this.agentPanel.show(agent);
      agent.setHighlighted(true);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.observedAgentIndex >= 0 && this.observedAgentIndex < this.agents.length) {
        this.agents[this.observedAgentIndex].setHighlighted(false);
      }
      this.observedAgentIndex = -1;
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      this.agentPanel.hide();
    });
  }

  private setupClickHandler() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const clickedAgent = this.agents.find(a => {
        const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, a.sprite.x, a.sprite.y);
        return dist < 20;
      });

      if (this.observedAgentIndex >= 0 && this.observedAgentIndex < this.agents.length) {
        this.agents[this.observedAgentIndex].setHighlighted(false);
      }

      if (clickedAgent) {
        this.observedAgentIndex = this.agents.indexOf(clickedAgent);
        this.cameras.main.startFollow(clickedAgent.sprite, true, 0.08, 0.08);
        this.agentPanel.show(clickedAgent);
        clickedAgent.setHighlighted(true);
      } else {
        this.observedAgentIndex = -1;
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.agentPanel.hide();
      }
    });
  }

  private handleMovement() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = 160;

    body.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      body.setVelocityY(speed);
    }

    body.velocity.normalize().scale(speed);
  }

  private updateCurrentZone() {
    const playerTileX = Math.floor(this.player.x / TILE_SIZE);
    const playerTileY = Math.floor(this.player.y / TILE_SIZE);

    for (const zone of ZONES) {
      if (
        playerTileX >= zone.x &&
        playerTileX < zone.x + zone.width &&
        playerTileY >= zone.y &&
        playerTileY < zone.y + zone.height
      ) {
        this.currentZone = zone.id;
        return;
      }
    }

    this.currentZone = 'corridor';
  }
}
