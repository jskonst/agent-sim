import { AgentProfile } from '../types/agent';

export const MEDIEVAL_AGENTS: AgentProfile[] = [
  {
    id: 'mayor',
    name: 'Мэр',
    role: 'official',
    avatar: 'purple',
    stats: {
      charisma: 8,
      industriousness: 7,
      sociability: 6,
      emotionalStability: 7
    },
    schedule: [
      { startHour: 8, endHour: 12, activity: 'work', preferredZones: ['town_hall'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['town_hall'] },
      { startHour: 17, endHour: 19, activity: 'socialize', preferredZones: ['tavern', 'fountain'] }
    ],
    relationships: {
      'merchant': 30,
      'guard': 40,
      'priest': 20
    },
    goals: ['Содержать город в порядке', 'Наладить торговлю']
  },
  {
    id: 'merchant',
    name: 'Торговец',
    role: 'merchant',
    avatar: 'green',
    stats: {
      charisma: 9,
      industriousness: 6,
      sociability: 8,
      emotionalStability: 5
    },
    schedule: [
      { startHour: 8, endHour: 12, activity: 'work', preferredZones: ['market'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 18, activity: 'work', preferredZones: ['market'] },
      { startHour: 18, endHour: 20, activity: 'socialize', preferredZones: ['tavern'] }
    ],
    relationships: {
      'mayor': 30,
      'blacksmith': 20,
      'bard': 40
    },
    goals: ['Наладить торговлю', 'Расширить ассортимент']
  },
  {
    id: 'blacksmith',
    name: 'Кузнец',
    role: 'craftsman',
    avatar: 'red',
    stats: {
      charisma: 5,
      industriousness: 9,
      sociability: 4,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 7, endHour: 12, activity: 'work', preferredZones: ['blacksmith'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 18, activity: 'work', preferredZones: ['blacksmith'] },
      { startHour: 18, endHour: 19, activity: 'rest', preferredZones: ['house_1'] }
    ],
    relationships: {
      'merchant': 20,
      'farmer': 30,
      'guard': 15
    },
    goals: ['Изготовить инструменты', 'Обучить подмастерье']
  },
  {
    id: 'priest',
    name: 'Жрец',
    role: 'cleric',
    avatar: 'blue',
    stats: {
      charisma: 7,
      industriousness: 6,
      sociability: 8,
      emotionalStability: 9
    },
    schedule: [
      { startHour: 6, endHour: 10, activity: 'work', preferredZones: ['temple'] },
      { startHour: 10, endHour: 11, activity: 'socialize', preferredZones: ['fountain'] },
      { startHour: 11, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['temple'] },
      { startHour: 17, endHour: 20, activity: 'rest', preferredZones: ['house_2'] }
    ],
    relationships: {
      'mayor': 20,
      'stranger': 50,
      'peasant': 40
    },
    goals: ['Провести утреннюю службу', 'Помочь жителям']
  },
  {
    id: 'farmer',
    name: 'Фермер',
    role: 'farmer',
    avatar: 'yellow',
    stats: {
      charisma: 4,
      industriousness: 9,
      sociability: 5,
      emotionalStability: 7
    },
    schedule: [
      { startHour: 5, endHour: 11, activity: 'work', preferredZones: ['farm'] },
      { startHour: 11, endHour: 12, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 12, endHour: 15, activity: 'work', preferredZones: ['farm'] },
      { startHour: 15, endHour: 16, activity: 'rest', preferredZones: ['house_1'] },
      { startHour: 16, endHour: 18, activity: 'work', preferredZones: ['market'] }
    ],
    relationships: {
      'blacksmith': 30,
      'merchant': 35,
      'peasant': 50
    },
    goals: ['Собрать урожай', 'Продать на рынке']
  },
  {
    id: 'guard',
    name: 'Охранник',
    role: 'guard',
    avatar: 'red',
    stats: {
      charisma: 6,
      industriousness: 8,
      sociability: 5,
      emotionalStability: 8
    },
    schedule: [
      { startHour: 6, endHour: 12, activity: 'work', preferredZones: ['castle_gate'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['castle_gate'] },
      { startHour: 17, endHour: 19, activity: 'patrol', preferredZones: ['corridors', 'fountain'] }
    ],
    relationships: {
      'mayor': 40,
      'stranger': -20,
      'apprentice': 15
    },
    goals: ['Охранять ворота', 'Патрулировать улицы']
  },
  {
    id: 'bard',
    name: 'Бард',
    role: 'entertainer',
    avatar: 'orange',
    stats: {
      charisma: 9,
      industriousness: 5,
      sociability: 10,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 10, endHour: 12, activity: 'socialize', preferredZones: ['fountain', 'market'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 15, activity: 'work', preferredZones: ['tavern'] },
      { startHour: 15, endHour: 17, activity: 'socialize', preferredZones: ['fountain'] },
      { startHour: 17, endHour: 22, activity: 'work', preferredZones: ['tavern'] }
    ],
    relationships: {
      'merchant': 40,
      'stranger': 35,
      'priest': 25
    },
    goals: ['Исполнить новую песню', 'Узнать новости']
  },
  {
    id: 'stranger',
    name: 'Странник',
    role: 'wanderer',
    avatar: 'gray',
    stats: {
      charisma: 7,
      industriousness: 5,
      sociability: 6,
      emotionalStability: 5
    },
    schedule: [
      { startHour: 8, endHour: 10, activity: 'socialize', preferredZones: ['fountain'] },
      { startHour: 10, endHour: 12, activity: 'socialize', preferredZones: ['market'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 15, activity: 'rest', preferredZones: ['fountain'] },
      { startHour: 15, endHour: 17, activity: 'socialize', preferredZones: ['temple'] }
    ],
    relationships: {
      'priest': 50,
      'merchant': 30,
      'bard': 35
    },
    goals: ['Найти ночлег', 'Узнать о городе']
  },
  {
    id: 'peasant',
    name: 'Селянин',
    role: 'farmer',
    avatar: 'yellow',
    stats: {
      charisma: 3,
      industriousness: 8,
      sociability: 4,
      emotionalStability: 8
    },
    schedule: [
      { startHour: 5, endHour: 11, activity: 'work', preferredZones: ['farm'] },
      { startHour: 11, endHour: 12, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 12, endHour: 16, activity: 'work', preferredZones: ['farm'] },
      { startHour: 16, endHour: 17, activity: 'rest', preferredZones: ['house_1'] },
      { startHour: 17, endHour: 19, activity: 'socialize', preferredZones: ['fountain'] }
    ],
    relationships: {
      'farmer': 50,
      'merchant': 20,
      'priest': 30
    },
    goals: ['Помочь фермеру', 'Купить инструменты']
  },
  {
    id: 'apprentice',
    name: 'Ученик',
    role: 'apprentice',
    avatar: 'cyan',
    stats: {
      charisma: 5,
      industriousness: 7,
      sociability: 6,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 7, endHour: 12, activity: 'work', preferredZones: ['blacksmith'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['tavern'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['blacksmith'] },
      { startHour: 17, endHour: 19, activity: 'rest', preferredZones: ['house_1'] }
    ],
    relationships: {
      'blacksmith': 60,
      'peasant': 20,
      'guard': 10
    },
    goals: ['Научиться ремеслу', 'Помочь мастеру']
  }
];