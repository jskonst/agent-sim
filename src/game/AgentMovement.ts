import Phaser from 'phaser';
import { Agent } from './Agent';
import { GameTime } from '../GameTime';

/**
 * Agent Movement System
 * Handles pathfinding, movement between zones, and schedule-based navigation
 */
export class AgentMovement {
  private agents: Agent[] = [];
  private scene: Phaser.Scene;
  private gameTime: GameTime;
  private pathfindingGrid: number[][] = [];
  private tileSize: number = 32;
  private mapWidth: number = 30;
  private mapHeight: number = 30;

  // Movement speed (pixels per second)
  private readonly WALK_SPEED = 60;
  private readonly RUN_SPEED = 120;

  constructor(scene: Phaser.Scene, gameTime: GameTime) {
    this.scene = scene;
    this.gameTime = gameTime;
    this.initializePathfinding();
  }

  /**
   * Initialize pathfinding grid based on map dimensions
   */
  private initializePathfinding(): void {
    this.pathfindingGrid = [];
    for (let y = 0; y < this.mapHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        // 0 = walkable, 1 = obstacle
        row.push(0);
      }
      this.pathfindingGrid.push(row);
    }
  }

  /**
   * Set obstacle at grid position
   */
  setObstacle(x: number, y: number, isObstacle: boolean = true): void {
    if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
      this.pathfindingGrid[y][x] = isObstacle ? 1 : 0;
    }
  }

  /**
   * Add agent to movement system
   */
  addAgent(agent: Agent): void {
    this.agents.push(agent);
  }

  /**
   * Remove agent from movement system
   */
  removeAgent(agentId: string): void {
    this.agents = this.agents.filter(a => a.id !== agentId);
  }

  /**
   * Update all agents' movement based on schedule
   */
  update(delta: number): void {
    const currentHour = this.gameTime.getHours();
    const currentMinute = this.gameTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    for (const agent of this.agents) {
      this.updateAgentMovement(agent, currentTime, delta);
    }
  }

  /**
   * Update individual agent movement
   */
  private updateAgentMovement(agent: Agent, currentTime: number, delta: number): void {
    // Check if agent has a schedule
    if (!agent.profile.schedule || agent.profile.schedule.length === 0) {
      return;
    }

    // Find current activity from schedule
    const currentActivity = this.findCurrentActivity(agent.profile.schedule, currentTime);

    if (currentActivity && currentActivity.location !== agent.state.location) {
      // Agent needs to move to new location
      this.moveToLocation(agent, currentActivity.location);
    } else if (currentActivity) {
      // Agent is at correct location, perform activity
      agent.state.activity = currentActivity.activity;
    }

    // Update agent's actual movement
    this.updateAgentPosition(agent, delta);
  }

  /**
   * Find current activity from schedule based on time
   */
  private findCurrentActivity(schedule: any[], currentTime: number): any | null {
    for (const activity of schedule) {
      const startTime = activity.startHour * 60 + activity.startMinute;
      const endTime = activity.endHour * 60 + activity.endMinute;

      if (currentTime >= startTime && currentTime < endTime) {
        return activity;
      }
    }
    return null;
  }

  /**
   * Move agent to specific location
   */
  private moveToLocation(agent: Agent, location: string): void {
    const targetPosition = this.getLocationPosition(location);
    if (targetPosition) {
      agent.setTarget(targetPosition.x, targetPosition.y);
      agent.state.location = location;
    }
  }

  /**
   * Get grid coordinates for a location name
   */
  private getLocationPosition(location: string): { x: number; y: number } | null {
    // Define positions for each location type
    const locations: Record<string, { x: number; y: number }> = {
      // Medieval locations
      town_hall: { x: 15, y: 15 },
      market: { x: 10, y: 20 },
      tavern: { x: 20, y: 10 },
      blacksmith: { x: 5, y: 15 },
      temple: { x: 25, y: 20 },
      farm: { x: 8, y: 25 },
      house_1: { x: 12, y: 8 },
      house_2: { x: 18, y: 8 },
      fountain: { x: 15, y: 12 },
      castle_gate: { x: 15, y: 28 },

      // Modern locations
      city_hall: { x: 15, y: 15 },
      supermarket: { x: 8, y: 20 },
      cafe: { x: 22, y: 12 },
      auto_repair: { x: 5, y: 18 },
      park: { x: 12, y: 25 },
      school: { x: 20, y: 22 },
      bus_stop: { x: 15, y: 5 },
      community_center: { x: 25, y: 15 },
      house_3: { x: 10, y: 10 },
      house_4: { x: 18, y: 10 },

      // Sci-Fi locations
      command_center: { x: 15, y: 15 },
      medbay: { x: 8, y: 20 },
      bar: { x: 22, y: 10 },
      cargo_dock: { x: 5, y: 18 },
      research_lab: { x: 25, y: 22 },
      living_quarters_1: { x: 10, y: 8 },
      living_quarters_2: { x: 20, y: 8 },
      corridors: { x: 15, y: 12 },
      hangar: { x: 15, y: 25 },
      security_station: { x: 25, y: 15 }
    };

    return locations[location] || null;
  }

  /**
   * Update agent's actual position based on target
   */
  private updateAgentPosition(agent: Agent, delta: number): void {
    if (!agent.hasTarget()) {
      return;
    }

    const target = agent.getTarget();
    const currentX = agent.x;
    const currentY = agent.y;

    // Calculate direction to target
    const dx = target.x - currentX;
    const dy = target.y - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Reached target
      agent.clearTarget();
      return;
    }

    // Calculate movement speed based on energy
    const speedMultiplier = agent.state.energy / 100;
    const speed = this.WALK_SPEED * speedMultiplier * (delta / 1000);

    // Normalize and move
    const moveX = (dx / distance) * speed;
    const moveY = (dy / distance) * speed;

    // Update position with bounds checking
    const newX = Math.max(0, Math.min(this.mapWidth * this.tileSize, currentX + moveX));
    const newY = Math.max(0, Math.min(this.mapHeight * this.tileSize, currentY + moveY));

    agent.setPosition(newX, newY);
  }

  /**
   * Make agents interact with nearby agents
   */
  handleInteractions(): void {
    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const agent1 = this.agents[i];
        const agent2 = this.agents[j];

        const distance = Phaser.Math.Distance.Between(
          agent1.x, agent1.y,
          agent2.x, agent2.y
        );

        // Interaction range
        if (distance < 50) {
          this.triggerInteraction(agent1, agent2);
        }
      }
    }
  }

  /**
   * Trigger interaction between two agents
   */
  private triggerInteraction(agent1: Agent, agent2: Agent): void {
    // Only interact if both agents have sufficient energy
    if (agent1.state.energy < 30 || agent2.state.energy < 30) {
      return;
    }

    // Simple interaction: greet and affect mood
    const greetings = [
      'Привет!', 'Добрый день!', 'Здравствуй!',
      'Hi there!', 'Good day!', 'Hello!'
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Boost moods
    agent1.state.mood = Math.min(100, agent1.state.mood + 5);
    agent2.state.mood = Math.min(100, agent2.state.mood + 5);

    // Slightly reduce energy from social interaction
    agent1.state.energy = Math.max(0, agent1.state.energy - 2);
    agent2.state.energy = Math.max(0, agent2.state.energy - 2);

    // Log interaction (could be displayed in UI)
    console.log(`${agent1.name} greeted ${agent2.name}: "${greeting}"`);
  }

  /**
   * Get path between two points using A* algorithm
   */
  private findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
    // Simple A* implementation for pathfinding
    // For now, return direct path - can be enhanced later

    const startGridX = Math.floor(startX / this.tileSize);
    const startGridY = Math.floor(startY / this.tileSize);
    const endGridX = Math.floor(endX / this.tileSize);
    const endGridY = Math.floor(endY / this.tileSize);

    // Direct path for now
    return [
      { x: endX, y: endY }
    ];
  }

  /**
   * Check if position is walkable
   */
  private isWalkable(x: number, y: number): boolean {
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);

    if (gridX < 0 || gridX >= this.mapWidth || gridY < 0 || gridY >= this.mapHeight) {
      return false;
    }

    return this.pathfindingGrid[gridY][gridX] === 0;
  }
}