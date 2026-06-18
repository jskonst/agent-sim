import { AgentProfile } from '../data/agents';
import { AgentState, AgentEvent } from '../game/entities/Agent';
import { LLMMessage } from './llmClient';

export function buildSystemPrompt(agent: AgentProfile, state: AgentState, hour: number): string {
  const relationshipLines = Object.entries(state.relationships || {})
    .map(([id, val]) => `- ${id}: ${val} (${val > 10 ? 'друг' : val < -10 ? 'неприязнь' : 'нейтрально'})`)
    .join('\n');

  const memoryLines = (state.memory || [])
    .slice(-5)
    .map(e => `- ${e.description}`)
    .join('\n');

  return `Ты — ${agent.name}, ${agent.role} в офисе.

ТВОЙ ХАРАКТЕР:
- Харизма: ${agent.stats.charisma}/10
- Трудолюбие: ${agent.stats.industriousness}/10
- Общительность: ${agent.stats.sociability}/10
- Эмоциональная стабильность: ${agent.stats.emotionalStability}/10

ТЕКУЩЕЕ СОСТОЯНИЕ:
- Локация: ${state.location}
- Активность: ${state.activity}
- Настроение: ${state.mood}/100
- Энергия: ${state.energy}/100

ТВОИ ЦЕЛИ: ${agent.goals.join(', ')}

ПОСЛЕДНИЕ СОБЫТИЯ:
${memoryLines || '(нет событий)'}

ОТНОШЕНИЯ С КОЛЛЕГАМИ:
${relationshipLines || '(нет данных)'}

ОТВЕТЬ ТОЛЬКО JSON:
{
  "action": "work|talk|rest|eat|socialize",
  "dialogue": { "text": "что говоришь (1 фраза)", "emotion": "neutral|happy|sad|angry" },
  "moodChange": -5..+5,
  "relationshipChanges": { "agent_id": -10..+10 },
  "thoughts": "мысль (1 фраза)"
}

ВАЖНО:
- Отвечай ТОЛЬКО JSON, без пояснений
- Действие должно соответствовать локации (в kitchen — eat/rest, в open_space — work, в corridor — move/socialize)
- Если энергия < 20 — выбери rest или eat
- Диалог — 1 короткая фраза на русском
- Мысли — 1 фраза, отражает внутреннее состояние`;
}

export function buildInteractionPrompt(
  agent: AgentProfile,
  agentState: AgentState,
  otherAgentName: string,
  otherAgentRole: string,
  context: string,
  hour: number
): LLMMessage[] {
  const system = buildSystemPrompt(agent, agentState, hour);
  const user = `Ты встретил ${otherAgentName} (${otherAgentRole}) в ${context}.
Что ты делаешь/говоришь? Учти ваши отношения и свой характер.`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}
