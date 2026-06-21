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
      { startHour: 8, endHour: 12, activity: 'work', zones: ['town_hall'], requiredEnergy: 80 },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['tavern'], requiredEnergy: 60 },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['town_hall'], requiredEnergy: 70 },
      { startHour: 17, endHour: 18, activity: 'rest', zones: ['house_1'], requiredEnergy: 40 },
      { startHour: 18, endHour: 20, activity: 'socialize', zones: ['market', 'tavern'], requiredEnergy: 50 },
      { startHour: 20, endHour: 22, activity: 'rest', zones: ['house_1'], requiredEnergy: 30 }
    ],
    relationships: {
      'guard': 40,
      'priest': 20
    },
    goals: ['Содержать город в порядке', 'Наладить торговлю']
  },
  {
    id: 'merchant',
    name: 'Торговец',
    role: 'merchant',
    avatar: 'yellow',
    stats: {
      charisma: 9,
      industriousness: 8,
      sociability: 7,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 6, endHour: 12, activity: 'work', zones: ['market'], requiredEnergy: 90 },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['tavern'], requiredEnergy: 70 },
      { startHour: 13, endHour: 18, activity: 'work', zones: ['market'], requiredEnergy: 80 },
      { startHour: 18, endHour: 20, activity: 'socialize', zones: ['tavern', 'market'], requiredEnergy: 60 },
      { startHour: 20, endHour: 22, activity: 'rest', zones: ['house_2'], requiredEnergy: 40 }
    ],
    relationships: {
      'mayor': 30,
      'blacksmith': 50
    },
    goals: ['Разбогатеть', 'Расширить торговлю']
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
      emotionalStability: 7
    },
    schedule: [
      { startHour: 7, endHour: 12, activity: 'work', zones: ['blacksmith'], requiredEnergy: 85 },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['tavern'], requiredEnergy: 65 },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['blacksmith'], requiredEnergy: 75 },
      { startHour: 17, endHour: 18, activity: 'rest', zones: ['house_1'], requiredEnergy: 50 },
      { startHour: 18, endHour: 21, activity: 'socialize', zones: ['tavern'], requiredEnergy: 55 },
      { startHour: 21, endHour: 23, activity: 'rest', zones: ['house_1'], requiredEnergy: 35 }
    ],
    relationships: {
      'merchant': 50,
      'guard': 30
    },
    goals: ['Сделать лучшую броню', 'Обучить подмастерьев']
  },
  {
    id: 'priest',
    name: 'Священник',
    role: 'religious',
    avatar: 'blue',
    stats: {
      charisma: 8,
      industriousness: 6,
      sociability: 7,
      emotionalStability: 9
    },
    schedule: [
      { startHour: 6, endHour: 8, activity: 'pray', zones: ['temple'], requiredEnergy: 70 },
      { startHour: 8, endHour: 12, activity: 'work', zones: ['temple'], requiredEnergy: 75 },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['tavern'], requiredEnergy: 60 },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['temple'], requiredEnergy: 70 },
      { startHour: 17, endHour: 19, activity: 'socialize', zones: ['fountain', 'market'], requiredEnergy: 65 },
      { startHour: 19, endHour: 22, activity: 'rest', zones: ['house_2'], requiredEnergy: 40 }
    ],
    relationships: {
      'mayor': 20,
      'farmer': 60
    },
    goals: ['Распространять веру', 'Помогать бедным']
  },
  {
    id: 'farmer',
    name: 'Фермер',
    role: 'worker',
    avatar: 'green',
    stats: {
      charisma: 4,
      industriousness: 8,
      sociability: 5,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 5, endHour: 12, activity: 'work', zones: ['farm'], requiredEnergy: 95 },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['tavern'], requiredEnergy: 70 },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['farm'], requiredEnergy: 80 },
      { startHour: 17, endHour: 18, activity: 'rest', zones: ['house_1'], requiredEnergy: 55 },
      { startHour: 18, endHour: 20, activity: 'socialize', zones: ['market', 'tavern'], requiredEnergy: 60 },
      { startHour: 20, endHour: 22, activity: 'rest', zones: ['house_1'], requiredEnergy: 35 }
    ],
    relationships: {
      'priest': 60,
      'merchant': 40
    },
    goals: ['Собрать хороший урожай', 'Купить новую телегу']
  },
  {
    id: 'guard',
    name: 'Стражник',
    role: 'guard',
    avatar: 'gray',
    stats: {
      charisma: 5,
      industriousness: 7,
      sociability: 4,
      emotionalStability: 8
    },
    schedule: [
      { startHour: 6, endHour: 14, activity: 'patrol', zones: ['castle_gate', 'town_hall'], requiredEnergy: 90 },
      { startHour: 14, endHour: 15, activity: 'eat', zones: ['tavern'], requiredEnergy: 75 },
      { startHour: 15, endHour: 18, activity: 'patrol', zones: ['castle_gate', 'market'], requiredEnergy: 85 },
      { startHour: 18, endHour: 19, activity: 'rest', zones: ['house_2'], requiredEnergy: 60 },
      { startHour: 19, endHour: 23, activity: 'patrol', zones: ['castle_gate'], requiredEnergy: 70 }
    ],
    relationships: {
      'mayor': 40,
      'blacksmith': 30
    },
    goals: ['Защитить город', 'Получить повышение']
  },
  {
    id: 'bard',
    name: 'Бард',
    role: 'entertainer',
    avatar: 'pink',
    stats: {
      charisma: 10,
      industriousness: 4,
      sociability: 9,
      emotionalStability: 5
    },
    schedule: [
      { startHour: 10, endHour: 14, activity: 'socialize', zones: ['market', 'fountain'], requiredEnergy: 80 },
      { startHour: 14, endHour: 15, activity: 'eat', zones: ['tavern'], requiredEnergy: 70 },
      { startHour: 15, endHour: 18, activity: 'perform', zones: ['tavern'], requiredEnergy: 75 },
      { startHour: 18, endHour: 22, activity: 'perform', zones: ['tavern'], requiredEnergy: 65 },
      { startHour: 22, endHour: 23, activity: 'rest', zones: ['house_1'], requiredEnergy: 40 }
    ],
    relationships: {
      'merchant': 60,
      'tavern_owner': 80
    },
    goals: ['Стать известным', 'Написать лучшую песню']
  },
  {
    id: 'tavern_owner',
    name: 'Трактирщик',
    role: 'merchant',
    avatar: 'orange',
    stats: {
      charisma: 7,
      industriousness: 8,
      sociability: 8,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 6, endHour: 23, activity: 'work', zones: ['tavern'], requiredEnergy: 80 }
    ],
    relationships: {
      'bard': 80,
      'merchant': 50
    },
    goals: ['Расширить таверну', 'Привлечь больше клиентов']
  },
  {
    id: 'healer',
    name: 'Целитель',
    role: 'healer',
    avatar: 'cyan',
    stats: {
      charisma: 7,
      industriousness: 6,
      sociability: 6,
      emotionalStability: 8
    },
    schedule: [
      { startHour: 7, endHour: 12, activity: 'work', zones: ['temple', 'house_2'], requiredEnergy: 85 },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['tavern'], requiredEnergy: 70 },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['temple', 'house_2'], requiredEnergy: 80 },
      { startHour: 17, endHour: 19, activity: 'socialize', zones: ['market', 'fountain'], requiredEnergy: 65 },
      { startHour: 19, endHour: 22, activity: 'rest', zones: ['house_2'], requiredEnergy: 45 }
    ],
    relationships: {
      'priest': 70,
      'farmer': 50
    },
    goals: ['Вылечить всех больных', 'Изучить новые травы']
  },
  {
    id: 'apprentice',
    name: 'Подмастерье',
    role: 'worker',
    avatar: 'gray',
    stats: {
      charisma: 3,
      industriousness: 9,
      sociability: 3,
      emotionalStability: 5
    },
    schedule: [
      { startHour: 6, endHour: 12, activity: 'work', zones: ['blacksmith'], requiredEnergy: 95 },
      { startHour: 12, endHour: 13, activity: 'eat', zones: ['tavern'], requiredEnergy: 75 },
      { startHour: 13, endHour: 17, activity: 'work', zones: ['blacksmith'], requiredEnergy: 90 },
      { startHour: 17, endHour: 18, activity: 'rest', zones: ['house_1'], requiredEnergy: 60 },
      { startHour: 18, endHour: 20, activity: 'work', zones: ['blacksmith'], requiredEnergy: 70 },
      { startHour: 20, endHour: 22, activity: 'rest', zones: ['house_1'], requiredEnergy: 40 }
    ],
    relationships: {
      'blacksmith': 90,
      'merchant': 20
    },
    goals: ['Стать мастером', 'Сделать свой первый меч']
  }
];