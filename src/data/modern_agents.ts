import { AgentProfile } from '../types/agent';

export const MODERN_AGENTS: AgentProfile[] = [
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
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['city_hall'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['city_hall'] },
      { startHour: 17, endHour: 19, activity: 'socialize', preferredZones: ['community_center'] }
    ],
    relationships: {
      'entrepreneur': 30,
      'teacher': 40,
      'senior': 20
    },
    goals: ['Улучшить инфраструктуру', 'Поддержать местный бизнес']
  },
  {
    id: 'cashier',
    name: 'Кассир',
    role: 'service',
    avatar: 'green',
    stats: {
      charisma: 7,
      industriousness: 6,
      sociability: 8,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 9, endHour: 13, activity: 'work', preferredZones: ['supermarket'] },
      { startHour: 13, endHour: 14, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 14, endHour: 18, activity: 'work', preferredZones: ['supermarket'] },
      { startHour: 18, endHour: 19, activity: 'rest', preferredZones: ['house_1'] }
    ],
    relationships: {
      'entrepreneur': 25,
      'student': 15,
      'senior': 35
    },
    goals: ['Отработать смену', 'Встретиться с друзьями']
  },
  {
    id: 'chef',
    name: 'Повар',
    role: 'service',
    avatar: 'orange',
    stats: {
      charisma: 6,
      industriousness: 9,
      sociability: 7,
      emotionalStability: 5
    },
    schedule: [
      { startHour: 7, endHour: 11, activity: 'work', preferredZones: ['cafe'] },
      { startHour: 11, endHour: 12, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 12, endHour: 16, activity: 'work', preferredZones: ['cafe'] },
      { startHour: 16, endHour: 17, activity: 'rest', preferredZones: ['house_1'] },
      { startHour: 17, endHour: 21, activity: 'work', preferredZones: ['cafe'] }
    ],
    relationships: {
      'entrepreneur': 40,
      'cashier': 20,
      'taxi_driver': 30
    },
    goals: ['Приготовить блюда', 'Пополнить запасы']
  },
  {
    id: 'mechanic',
    name: 'Механик',
    role: 'craftsman',
    avatar: 'red',
    stats: {
      charisma: 5,
      industriousness: 9,
      sociability: 4,
      emotionalStability: 7
    },
    schedule: [
      { startHour: 8, endHour: 12, activity: 'work', preferredZones: ['auto_repair'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['auto_repair'] },
      { startHour: 17, endHour: 18, activity: 'rest', preferredZones: ['house_1'] }
    ],
    relationships: {
      'entrepreneur': 15,
      'taxi_driver': 45,
      'senior': 25
    },
    goals: ['Отремонтировать машины', 'Пополнить инструменты']
  },
  {
    id: 'teacher',
    name: 'Учитель',
    role: 'education',
    avatar: 'blue',
    stats: {
      charisma: 8,
      industriousness: 7,
      sociability: 8,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 8, endHour: 12, activity: 'work', preferredZones: ['school'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['school'] },
      { startHour: 17, endHour: 19, activity: 'rest', preferredZones: ['house_1'] }
    ],
    relationships: {
      'mayor': 40,
      'student': 50,
      'senior': 30
    },
    goals: ['Обучить учеников', 'Подготовить уроки']
  },
  {
    id: 'student',
    name: 'Школьник',
    role: 'student',
    avatar: 'cyan',
    stats: {
      charisma: 6,
      industriousness: 5,
      sociability: 7,
      emotionalStability: 5
    },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'commute', preferredZones: ['bus_stop'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['school'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 13, endHour: 15, activity: 'work', preferredZones: ['school'] },
      { startHour: 15, endHour: 16, activity: 'socialize', preferredZones: ['park'] },
      { startHour: 16, endHour: 17, activity: 'commute', preferredZones: ['bus_stop'] },
      { startHour: 17, endHour: 19, activity: 'rest', preferredZones: ['house_1'] }
    ],
    relationships: {
      'teacher': 50,
      'senior': 20,
      'athlete': 40
    },
    goals: ['Сделать домашку', 'Погулять в парке']
  },
  {
    id: 'senior',
    name: 'Пенсионер',
    role: 'resident',
    avatar: 'gray',
    stats: {
      charisma: 7,
      industriousness: 4,
      sociability: 6,
      emotionalStability: 8
    },
    schedule: [
      { startHour: 9, endHour: 10, activity: 'rest', preferredZones: ['house_1'] },
      { startHour: 10, endHour: 12, activity: 'socialize', preferredZones: ['park'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 13, endHour: 15, activity: 'socialize', preferredZones: ['community_center'] },
      { startHour: 15, endHour: 17, activity: 'rest', preferredZones: ['house_1'] },
      { startHour: 17, endHour: 19, activity: 'socialize', preferredZones: ['park'] }
    ],
    relationships: {
      'mayor': 20,
      'teacher': 30,
      'senior': 40
    },
    goals: ['Встретиться с друзьями', 'Прогуляться в парке']
  },
  {
    id: 'entrepreneur',
    name: 'Предприниматель',
    role: 'business',
    avatar: 'green',
    stats: {
      charisma: 9,
      industriousness: 8,
      sociability: 7,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 8, endHour: 12, activity: 'work', preferredZones: ['cafe'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['community_center'] },
      { startHour: 17, endHour: 19, activity: 'socialize', preferredZones: ['cafe'] }
    ],
    relationships: {
      'mayor': 30,
      'chef': 40,
      'mechanic': 15
    },
    goals: ['Встретиться с партнёрами', 'Расширить бизнес']
  },
  {
    id: 'taxi_driver',
    name: 'Таксист',
    role: 'service',
    avatar: 'yellow',
    stats: {
      charisma: 6,
      industriousness: 8,
      sociability: 7,
      emotionalStability: 6
    },
    schedule: [
      { startHour: 7, endHour: 11, activity: 'work', preferredZones: ['bus_stop'] },
      { startHour: 11, endHour: 12, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 12, endHour: 16, activity: 'work', preferredZones: ['bus_stop', 'park'] },
      { startHour: 16, endHour: 17, activity: 'rest', preferredZones: ['house_1'] },
      { startHour: 17, endHour: 20, activity: 'work', preferredZones: ['bus_stop'] }
    ],
    relationships: {
      'mechanic': 45,
      'senior': 30,
      'entrepreneur': 25
    },
    goals: ['Выполнить заказы', 'Пополнить кассу']
  },
  {
    id: 'athlete',
    name: 'Спортсмен',
    role: 'resident',
    avatar: 'red',
    stats: {
      charisma: 7,
      industriousness: 9,
      sociability: 6,
      emotionalStability: 7
    },
    schedule: [
      { startHour: 6, endHour: 8, activity: 'work', preferredZones: ['park'] },
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['auto_repair'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['cafe'] },
      { startHour: 13, endHour: 16, activity: 'work', preferredZones: ['auto_repair'] },
      { startHour: 16, endHour: 17, activity: 'work', preferredZones: ['park'] },
      { startHour: 17, endHour: 19, activity: 'rest', preferredZones: ['house_1'] }
    ],
    relationships: {
      'student': 40,
      'senior': 25,
      'mechanic': 20
    },
    goals: ['Тренироваться', 'Помощь другу']
  }
];