import { Agent } from '../game/entities/Agent';

export interface TriggerResult {
  type: 'meeting' | 'activity_change' | 'crisis' | 'end_of_day';
  data: Record<string, any>;
}

export class LLMTriggerSystem {
  private lastTriggerTime: Map<string, number> = new Map();
  private readonly MIN_TICKS_BETWEEN_TRIGGERS = 10;

  shouldTrigger(agent: Agent, otherAgents: Agent[], tick: number, gameHour: number, gameMinute: number): TriggerResult | null {
    const lastTick = this.lastTriggerTime.get(agent.id) || 0;
    if (tick - lastTick < this.MIN_TICKS_BETWEEN_TRIGGERS) return null;

    const othersHere = otherAgents.filter(
      a => a.state.location === agent.state.location && a.id !== agent.id
    );
    if (othersHere.length > 0 && Math.random() < 0.3) {
      this.lastTriggerTime.set(agent.id, tick);
      return { type: 'meeting', data: { otherAgent: othersHere[0] } };
    }

    const actChange = agent.getActivityChange();
    if (actChange && actChange !== 'moving') {
      this.lastTriggerTime.set(agent.id, tick);
      return { type: 'activity_change', data: { activity: actChange } };
    }

    if (agent.state.energy < 20 || agent.state.mood < 20) {
      this.lastTriggerTime.set(agent.id, tick);
      return { type: 'crisis', data: { energy: agent.state.energy, mood: agent.state.mood } };
    }

    if (gameHour === 18 && gameMinute === 0) {
      this.lastTriggerTime.set(agent.id, tick);
      return { type: 'end_of_day', data: {} };
    }

    return null;
  }
}

export const triggerSystem = new LLMTriggerSystem();
