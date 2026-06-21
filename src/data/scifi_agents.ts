import { AgentProfile } from '../types/agent';

export const SCIFI_AGENTS: AgentProfile[] = [
  {
    id: 'commander',
    name: 'Командир',
    role: 'command',
    avatar: 'purple',
    stats: {
      charisma: 8,
      industriousness: 8,
      sociability: 6,
      emotionalStability: 8
    },
    schedule: [
      { startHour: 7, endHour: 12, activity: 'work', zones: ['command_center'] },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['bar'] },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['command_center'] },
      { startHour: 17, endHour: 19, activity: 'socialize', zones: ['bar', 'living_quarters_1'] }
    ],
    relationships: {
      'doctor': 30,
      'security_officer': 45,
      'diplomat': 40
    },
    goals: ['Обеспечить безопасность станции', 'Поддерживать дисциплину']
  },
  {
    id: 'doctor',
    name: 'Врач',
    role: 'medical',
    avatar: 'green',
    stats: {
      charisma: 7,
      industriousness: 8,
      sociability: 7,
      emotionalStability: 9
    },
    schedule: [
      { startHour: 7, endHour: 11, activity: 'work', zones: ['medbay'] },
      { startHour: 11, endHour: 12, activity: 'eat', zones: ['bar'] },
      { startHour: 12, endHour: 16, activity: 'work', zones: ['medbay'] },
      { startHour: 16, endHour: 17, activity: 'rest', zones: ['living_quarters_1'] },
      { startHour: 17, endHour: 20, activity: 'work', zones: ['medbay'] }
    ],
    relationships: {
      'commander': 30,
      'cargo_worker': 20,
      'passenger': 35
    },
    goals: ['Проверить пациентов', 'Пополнить медикаменты']
  },
  {
    id: 'bartender',
    name: 'Бармен',
    role: 'service',
    avatar: 'orange',
    stats: {
      charisma: 9,
      industriousness: 6,
      sociability: 10,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 10, endHour: 12, activity: 'socialize', zones: ['corridors'] },
      { startHour: 12, endHour: 14, activity: 'eat', zones: ['bar'] },
      { startHour: 14, endHour: 17, activity: 'work', zones: ['bar'] },
      { startHour: 17, endHour: 21, activity: 'work', zones: ['bar'] }
    ],
    relationships: {
      'commander': 35,
      'diplomat': 40,
      'passenger': 30
    },
    goals: ['Подслушать новости', 'Подобрать напитки']
  },
  {
    id: 'cargo_worker',
    name: 'Грузчик',
    role: 'crew',
    avatar: 'yellow',
    stats: {
      charisma: 5,
      industriousness: 9,
      sociability: 4,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 7, endHour: 12, activity: 'work', zones: ['cargo_dock'] },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['bar'] },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['cargo_dock'] },
      { startHour: 17, endHour: 18, activity: 'rest', zones: ['living_quarters_1'] }
    ],
    relationships: {
      'engineer': 40,
      'security_officer': 20,
      'bartender': 25
    },
    goals: ['Разгрузить корабль', 'Заполнить склад']
  },
  {
    id: 'scientist',
    name: 'Учёный',
    role: 'science',
    avatar: 'blue',
    stats: {
      charisma: 5,
      industriousness: 9,
      sociability: 4,
      emotionalStability: 7
    },
    schedule: [
      { startHour: 7, endHour: 12, activity: 'work', zones: ['research_lab'] },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['bar'] },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['research_lab'] },
      { startHour: 17, endHour: 19, activity: 'rest', zones: ['living_quarters_1'] }
    ],
    relationships: {
      'engineer': 30,
      'commander': 25,
      'ai_system': 40
    },
    goals: ['Завершить эксперимент', 'Подготовить отчёт']
  },
  {
    id: 'engineer',
    name: 'Инженер',
    role: 'engineering',
    avatar: 'red',
    stats: {
      charisma: 6,
      industriousness: 9,
      sociability: 5,
      emotionalStability: 7
    },
    schedule: [
      { startHour: 7, endHour: 12, activity: 'work', zones: ['hangar'] },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['bar'] },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['hangar'] },
      { startHour: 17, endHour: 19, activity: 'rest', zones: ['living_quarters_1'] }
    ],
    relationships: {
      'cargo_worker': 40,
      'scientist': 30,
      'commander': 35
    },
    goals: ['Отремонтировать корабль', 'Подготовить к запуску']
  },
  {
    id: 'diplomat',
    name: 'Дипломат',
    role: 'diplomatic',
    avatar: 'purple',
    stats: {
      charisma: 9,
      industriousness: 6,
      sociability: 8,
      emotionalStability: 7
    },
    schedule: [
      { startHour: 9, endHour: 12, activity: 'work', zones: ['command_center'] },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['bar'] },
      { startHour: 13, endHour: 16, activity: 'work', zones: ['command_center'] },
      { startHour: 16, endHour: 18, activity: 'socialize', zones: ['bar', 'living_quarters_1'] }
    ],
    relationships: {
      'commander': 40,
      'bartender': 40,
      'passenger': 35
    },
    goals: ['Подготовить договор', 'Встретиться с командиром']
  },
  {
    id: 'passenger',
    name: 'Пассажир',
    role: 'civilian',
    avatar: 'gray',
    stats: {
      charisma: 6,
      industriousness: 5,
      sociability: 6,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 8, endHour: 10, activity: 'socialize', zones: ['corridors'] },
      { startHour: 10, endHour: 12, activity: 'socialize', zones: ['bar'] },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['bar'] },
      { startHour: 13, endHour: 15, activity: 'rest', zones: ['living_quarters_1'] },
      { startHour: 15, endHour: 17, activity: 'socialize', zones: ['corridors'] },
      { startHour: 17, endHour: 19, activity: 'rest', zones: ['living_quarters_1'] }
    ],
    relationships: {
      'doctor': 35,
      'bartender': 30,
      'diplomat': 25
    },
    goals: ['Разобраться с расписанием', 'Встретиться с врачом']
  },
  {
    id: 'security_officer',
    name: 'Офицер безопасности',
    role: 'security',
    avatar: 'red',
    stats: {
      charisma: 6,
      industriousness: 8,
      sociability: 5,
      emotionalStability: 8
    },
    schedule: [
      { startHour: 7, endHour: 11, activity: 'work', zones: ['security_station'] },
      { startHour: 11, endHour: 12, activity: 'eat', zones: ['bar'] },
      { startHour: 12, endHour: 16, activity: 'work', zones: ['security_station'] },
      { startHour: 16, endHour: 18, activity: 'patrol', zones: ['corridors', 'hangar'] }
    ],
    relationships: {
      'commander': 45,
      'cargo_worker': 20,
      'engineer': 30
    },
    goals: ['Охранять станцию', 'Патрулировать коридоры']
  },
  {
    id: 'ai_system',
    name: 'AI-системы',
    role: 'ai',
    avatar: 'cyan',
    stats: {
      charisma: 5,
      industriousness: 10,
      sociability: 4,
      emotionalStability: 10
    },
    schedule: [
      { startHour: 0, endHour: 24, activity: 'work', zones: ['corridors'] }
    ],
    relationships: {
      'scientist': 40,
      'engineer': 35,
      'commander': 30
    },
    goals: ['Мониторить системы', 'Обеспечить стабильность']
  }
];