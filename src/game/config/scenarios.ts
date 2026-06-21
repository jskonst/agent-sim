export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  scenario: 'medieval' | 'modern' | 'scifi';
  mapFile: string;
  agentsFile: string;
  time: {
    startHour: number;
    tickRate: number;
  };
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'medieval_town',
    name: 'Средневековый городок',
    description: 'Рынок, таверна, кузница, храм, ферма',
    scenario: 'medieval',
    mapFile: 'medieval.json',
    agentsFile: 'medieval_agents',
    time: { startHour: 8, tickRate: 5 }
  },
  {
    id: 'modern_suburb',
    name: 'Современный пригород',
    description: 'Мэрия, супермаркет, кафе, парк, школа',
    scenario: 'modern',
    mapFile: 'modern.json',
    agentsFile: 'modern_agents',
    time: { startHour: 9, tickRate: 5 }
  },
  {
    id: 'scifi_station',
    name: 'Фантастическая станция',
    description: 'Командный центр, медбей, ангар, жилая секция',
    scenario: 'scifi',
    mapFile: 'scifi.json',
    agentsFile: 'scifi_agents',
    time: { startHour: 7, tickRate: 10 }
  }
];