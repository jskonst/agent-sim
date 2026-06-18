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

export const AGENTS: AgentProfile[] = [
  {
    id: 'alex',
    name: 'Alex',
    role: 'developer',
    avatar: 'green',
    stats: { charisma: 4, industriousness: 9, sociability: 3, emotionalStability: 6 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen'] },
    ],
    relationships: { maria: 20, kim: 10, leo: 15 },
    goals: ['Master advanced patterns', 'Lead a major feature'],
  },
  {
    id: 'maria',
    name: 'Maria',
    role: 'team_lead',
    avatar: 'blue',
    stats: { charisma: 8, industriousness: 7, sociability: 8, emotionalStability: 7 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 11, activity: 'work', preferredZones: ['open_space_1'] },
      { startHour: 11, endHour: 12, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 15, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 15, endHour: 17, activity: 'work', preferredZones: ['open_space_1'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen', 'corridor'] },
    ],
    relationships: { alex: 15, kim: 25, sarah: 30 },
    goals: ['Improve team velocity', 'Mentor junior devs'],
  },
  {
    id: 'kim',
    name: 'Kim',
    role: 'developer',
    avatar: 'purple',
    stats: { charisma: 6, industriousness: 8, sociability: 7, emotionalStability: 6 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen', 'meeting_1'] },
    ],
    relationships: { maria: 20, alex: 10, jake: 15 },
    goals: ['Learn TypeScript', 'Contribute to open source'],
  },
  {
    id: 'leo',
    name: 'Leo',
    role: 'developer',
    avatar: 'cyan',
    stats: { charisma: 5, industriousness: 7, sociability: 5, emotionalStability: 8 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 17, endHour: 18, activity: 'rest', preferredZones: ['kitchen'] },
    ],
    relationships: { alex: 15, zoe: 20 },
    goals: ['Build scalable systems', 'Maintain work-life balance'],
  },
  {
    id: 'nina',
    name: 'Nina',
    role: 'designer',
    avatar: 'pink',
    stats: { charisma: 7, industriousness: 6, sociability: 8, emotionalStability: 7 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 15, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 15, endHour: 17, activity: 'work', preferredZones: ['open_space_1'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen', 'corridor'] },
    ],
    relationships: { tom: 25, sarah: 20, diana: 15 },
    goals: ['Create beautiful UI', 'Improve user experience'],
  },
  {
    id: 'tom',
    name: 'Tom',
    role: 'designer',
    avatar: 'orange',
    stats: { charisma: 3, industriousness: 7, sociability: 3, emotionalStability: 6 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['open_space_2'] },
      { startHour: 17, endHour: 18, activity: 'rest', preferredZones: ['kitchen'] },
    ],
    relationships: { nina: 20, zoe: 10 },
    goals: ['Perfect the design system', 'Work independently'],
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'product_manager',
    avatar: 'red',
    stats: { charisma: 8, industriousness: 8, sociability: 7, emotionalStability: 6 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 11, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 11, endHour: 12, activity: 'work', preferredZones: ['office_cow'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 15, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 15, endHour: 17, activity: 'work', preferredZones: ['office_cow'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen', 'corridor'] },
    ],
    relationships: { maria: 30, bob: 25, nina: 20 },
    goals: ['Launch new features', 'Improve product metrics'],
  },
  {
    id: 'bob',
    name: 'Bob',
    role: 'project_manager',
    avatar: 'yellow',
    stats: { charisma: 6, industriousness: 9, sociability: 5, emotionalStability: 8 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 11, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 11, endHour: 12, activity: 'work', preferredZones: ['office_cow'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 15, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 15, endHour: 17, activity: 'work', preferredZones: ['office_cow'] },
      { startHour: 17, endHour: 18, activity: 'rest', preferredZones: ['kitchen'] },
    ],
    relationships: { sarah: 25, chris: 20 },
    goals: ['Keep projects on track', 'Optimize processes'],
  },
  {
    id: 'chris',
    name: 'Chris',
    role: 'scrum_master',
    avatar: 'green',
    stats: { charisma: 7, industriousness: 6, sociability: 8, emotionalStability: 7 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 10, activity: 'meeting', preferredZones: ['meeting_1'] },
      { startHour: 10, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 14, activity: 'meeting', preferredZones: ['meeting_1'] },
      { startHour: 14, endHour: 17, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen', 'corridor'] },
    ],
    relationships: { bob: 20, alex: 15, kim: 15 },
    goals: ['Facilitate smooth sprints', 'Remove blockers for the team'],
  },
  {
    id: 'diana',
    name: 'Diana',
    role: 'hr_lead',
    avatar: 'purple',
    stats: { charisma: 9, industriousness: 6, sociability: 9, emotionalStability: 8 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['reception'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 15, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 15, endHour: 17, activity: 'work', preferredZones: ['reception'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen'] },
    ],
    relationships: { paul: 25, nina: 15, jake: 20 },
    goals: ['Improve company culture', 'Help new hires succeed'],
  },
  {
    id: 'paul',
    name: 'Paul',
    role: 'recruiter',
    avatar: 'blue',
    stats: { charisma: 8, industriousness: 7, sociability: 9, emotionalStability: 7 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 11, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 11, endHour: 12, activity: 'work', preferredZones: ['reception'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 15, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 15, endHour: 17, activity: 'work', preferredZones: ['reception'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen', 'corridor'] },
    ],
    relationships: { diana: 25, sarah: 15 },
    goals: ['Hire great talent', 'Build employer brand'],
  },
  {
    id: 'eva',
    name: 'Eva',
    role: 'qa_lead',
    avatar: 'red',
    stats: { charisma: 5, industriousness: 9, sociability: 4, emotionalStability: 7 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 15, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 15, endHour: 16, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 16, endHour: 18, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
    ],
    relationships: { mike: 20, alex: 10 },
    goals: ['Zero production bugs', 'Improve test coverage'],
  },
  {
    id: 'mike',
    name: 'Mike',
    role: 'qa',
    avatar: 'orange',
    stats: { charisma: 4, industriousness: 7, sociability: 4, emotionalStability: 8 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 15, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 15, endHour: 16, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
      { startHour: 16, endHour: 18, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
    ],
    relationships: { eva: 20, leo: 10 },
    goals: ['Master automation', 'Become QA lead'],
  },
  {
    id: 'jake',
    name: 'Jake',
    role: 'intern',
    avatar: 'yellow',
    stats: { charisma: 5, industriousness: 8, sociability: 6, emotionalStability: 5 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
      { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen'] },
    ],
    relationships: { kim: 15, diana: 20, maria: 10 },
    goals: ['Learn from seniors', 'Get full-time offer'],
  },
  {
    id: 'zoe',
    name: 'Zoe',
    role: 'devops',
    avatar: 'cyan',
    stats: { charisma: 4, industriousness: 8, sociability: 3, emotionalStability: 7 },
    schedule: [
      { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['office_cow', 'open_space_2'] },
      { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
      { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['office_cow', 'open_space_2'] },
      { startHour: 17, endHour: 18, activity: 'rest', preferredZones: ['kitchen'] },
    ],
    relationships: { leo: 20, tom: 10 },
    goals: ['Improve CI/CD pipeline', 'Automate everything'],
  },
];

export const AVATAR_COLORS: Record<string, number> = {
  green: 0x48bb78,
  blue: 0x4299e1,
  red: 0xf56565,
  purple: 0x9f7aea,
  orange: 0xed8936,
  yellow: 0xecc94b,
  pink: 0xed64a6,
  cyan: 0x0bc5ea,
};
