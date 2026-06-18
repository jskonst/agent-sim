export interface Zone {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  color: number;
}

export interface GameState {
  currentTime: { hour: number; minute: number };
  currentZone: string;
  agents: any[];
}
