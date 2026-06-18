import { ScheduleEntry } from './agents';

export const SCHEDULE_TEMPLATES: Record<string, ScheduleEntry[]> = {
  developer: [
    { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
    { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
    { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen', 'meeting_1'] },
  ],
  manager: [
    { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 9, endHour: 11, activity: 'work', preferredZones: ['office_coworking'] },
    { startHour: 11, endHour: 12, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
    { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 13, endHour: 15, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
    { startHour: 15, endHour: 17, activity: 'work', preferredZones: ['office_coworking'] },
    { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['corridor'] },
  ],
  hr: [
    { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['reception'] },
    { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 13, endHour: 15, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
    { startHour: 15, endHour: 17, activity: 'work', preferredZones: ['reception'] },
    { startHour: 17, endHour: 18, activity: 'socialize', preferredZones: ['kitchen'] },
  ],
  qa: [
    { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
    { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 13, endHour: 15, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
    { startHour: 15, endHour: 16, activity: 'meeting', preferredZones: ['meeting_1', 'meeting_2'] },
    { startHour: 16, endHour: 18, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
  ],
  devops: [
    { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['office_coworking'] },
    { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['office_coworking'] },
    { startHour: 17, endHour: 18, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
  ],
  intern: [
    { startHour: 8, endHour: 9, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 9, endHour: 12, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
    { startHour: 12, endHour: 13, activity: 'eat', preferredZones: ['kitchen'] },
    { startHour: 13, endHour: 17, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
    { startHour: 17, endHour: 18, activity: 'work', preferredZones: ['open_space_1', 'open_space_2'] },
  ],
};
