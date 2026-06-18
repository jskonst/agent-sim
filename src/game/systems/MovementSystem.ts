import Phaser from 'phaser';

interface Tile {
  x: number;
  y: number;
}

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class MovementSystem {
  private static instance: MovementSystem;
  private grid: boolean[][];
  private gridWidth: number;
  private gridHeight: number;

  private constructor(gridWidth: number, gridHeight: number) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.grid = [];
    for (let y = 0; y < gridHeight; y++) {
      this.grid[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        this.grid[y][x] = true;
      }
    }
  }

  static getInstance(gridWidth: number = 22, gridHeight: number = 22): MovementSystem {
    if (!MovementSystem.instance) {
      MovementSystem.instance = new MovementSystem(gridWidth, gridHeight);
    }
    return MovementSystem.instance;
  }

  setBlocked(x: number, y: number, blocked: boolean): void {
    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
      this.grid[y][x] = blocked;
    }
  }

  isBlocked(x: number, y: number): boolean {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
      return true;
    }
    return !this.grid[y][x];
  }

  findPath(start: Tile, end: Tile): Tile[] {
    if (this.isBlocked(start.x, start.y) || this.isBlocked(end.x, end.y)) {
      return [];
    }

    if (start.x === end.x && start.y === end.y) {
      return [];
    }

    const openList: PathNode[] = [];
    const closedList: Set<string> = new Set();

    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;

    openList.push(startNode);

    while (openList.length > 0) {
      let lowestIndex = 0;
      for (let i = 0; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openList[lowestIndex];

      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }

      openList.splice(lowestIndex, 1);
      closedList.add(`${current.x},${current.y}`);

      const neighbors = this.getNeighbors(current);

      for (const neighbor of neighbors) {
        if (closedList.has(`${neighbor.x},${neighbor.y}`)) {
          continue;
        }

        const gScore = current.g + 1;
        const existingNode = openList.find(
          (n) => n.x === neighbor.x && n.y === neighbor.y
        );

        if (existingNode) {
          if (gScore < existingNode.g) {
            existingNode.g = gScore;
            existingNode.f = gScore + existingNode.h;
            existingNode.parent = current;
          }
        } else {
          const neighborNode: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: gScore,
            h: this.heuristic(neighbor, end),
            f: 0,
            parent: current,
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openList.push(neighborNode);
        }
      }
    }

    return [];
  }

  private heuristic(a: Tile, b: Tile): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private getNeighbors(node: PathNode): Tile[] {
    const neighbors: Tile[] = [];
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    for (const dir of directions) {
      const nx = node.x + dir.x;
      const ny = node.y + dir.y;

      if (!this.isBlocked(nx, ny)) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    return neighbors;
  }

  private reconstructPath(node: PathNode): Tile[] {
    const path: Tile[] = [];
    let current: PathNode | null = node;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    path.shift();
    return path;
  }
}
