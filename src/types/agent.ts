export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  stats: {
    charisma: number;
    industriousness: number;
    sociability: number;
    emotionalStability: number;
  };
  schedule: ScheduleEntry[];
  relationships: Record<string, number>;
  goals: string[];
}

export interface ScheduleEntry {
  startHour: number;
  endHour: number;
  activity: string;
  preferredZones: string[];
  requiredEnergy?: number;
}