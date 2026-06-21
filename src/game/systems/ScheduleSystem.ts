import { AgentProfile, ScheduleEntry } from '../../types/agent';

interface ScheduleResult {
  activity: string;
  targetZone: string;
}

export class ScheduleSystem {
  private static instance: ScheduleSystem;

  private constructor() {}

  static getInstance(): ScheduleSystem {
    if (!ScheduleSystem.instance) {
      ScheduleSystem.instance = new ScheduleSystem();
    }
    return ScheduleSystem.instance;
  }

  getCurrentActivity(profile: AgentProfile, gameHour: number): ScheduleResult {
    for (const entry of profile.schedule) {
      if (gameHour >= entry.startHour && gameHour < entry.endHour) {
        const targetZone = this.selectZone(entry, gameHour);
        return {
          activity: entry.activity,
          targetZone,
        };
      }
    }

    return {
      activity: 'rest',
      targetZone: 'kitchen',
    };
  }

  private selectZone(entry: ScheduleEntry, gameHour: number): string {
    if (entry.zones.length === 0) {
      return 'corridor';
    }

    const index = Math.floor(gameHour) % entry.zones.length;
    return entry.zones[index];
  }

  shouldChangeActivity(
    currentActivity: string,
    newActivity: string,
    currentZone: string,
    targetZone: string
  ): boolean {
    if (currentActivity !== newActivity) {
      return true;
    }

    if (currentZone !== targetZone) {
      return true;
    }

    return false;
  }
}
