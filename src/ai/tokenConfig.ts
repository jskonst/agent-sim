export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ToolsetLimit {
  maxTokensPerDay: number;
  maxTokensPerHour: number;
  maxTokensPerMinute: number;
  maxTokensPerRequest: number;
  warningThreshold: number;
  hardLimitThreshold: number;
}

export interface ProviderLimit {
  providerId: string;
  maxTokensPerDay: number;
  maxTokensPerHour: number;
  warningThreshold: number;
  hardLimitThreshold: number;
}

export interface TokenBudgetConfig {
  toolsets: Record<string, ToolsetLimit>;
  providers: Record<string, ProviderLimit>;
  priorities: Record<PriorityLevel, {
    maxTokensPerDay: number;
    maxTokensPerHour: number;
    degradationStrategy: 'skip' | 'reduce_tokens' | 'use_cache' | 'fallback_model';
  }>;
  global: {
    maxTokensPerDay: number;
    maxTokensPerHour: number;
    warningThreshold: number;
    hardLimitThreshold: number;
  };
  persistence: {
    storageKey: string;
    historyDays: number;
  };
}

export const DEFAULT_TOKEN_CONFIG: TokenBudgetConfig = {
  toolsets: {
    meeting: {
      maxTokensPerDay: 5000,
      maxTokensPerHour: 500,
      maxTokensPerMinute: 100,
      maxTokensPerRequest: 200,
      warningThreshold: 0.8,
      hardLimitThreshold: 1.0,
    },
    activity_change: {
      maxTokensPerDay: 3000,
      maxTokensPerHour: 300,
      maxTokensPerMinute: 80,
      maxTokensPerRequest: 200,
      warningThreshold: 0.8,
      hardLimitThreshold: 1.0,
    },
    crisis: {
      maxTokensPerDay: 8000,
      maxTokensPerHour: 800,
      maxTokensPerMinute: 200,
      maxTokensPerRequest: 200,
      warningThreshold: 0.7,
      hardLimitThreshold: 0.9,
    },
    end_of_day: {
      maxTokensPerDay: 2000,
      maxTokensPerHour: 200,
      maxTokensPerMinute: 50,
      maxTokensPerRequest: 200,
      warningThreshold: 0.8,
      hardLimitThreshold: 1.0,
    },
  },
  providers: {
    openrouter: {
      providerId: 'openrouter',
      maxTokensPerDay: 50000,
      maxTokensPerHour: 5000,
      warningThreshold: 0.75,
      hardLimitThreshold: 0.95,
    },
  },
  priorities: {
    critical: {
      maxTokensPerDay: 20000,
      maxTokensPerHour: 2000,
      degradationStrategy: 'reduce_tokens',
    },
    high: {
      maxTokensPerDay: 15000,
      maxTokensPerHour: 1500,
      degradationStrategy: 'use_cache',
    },
    medium: {
      maxTokensPerDay: 10000,
      maxTokensPerHour: 1000,
      degradationStrategy: 'use_cache',
    },
    low: {
      maxTokensPerDay: 5000,
      maxTokensPerHour: 500,
      degradationStrategy: 'skip',
    },
  },
  global: {
    maxTokensPerDay: 50000,
    maxTokensPerHour: 5000,
    warningThreshold: 0.7,
    hardLimitThreshold: 0.9,
  },
  persistence: {
    storageKey: 'agent_sim_token_usage',
    historyDays: 30,
  },
};

let currentConfig: TokenBudgetConfig = { ...DEFAULT_TOKEN_CONFIG };

export function getTokenConfig(): TokenBudgetConfig {
  return currentConfig;
}

export function setTokenConfig(config: Partial<TokenBudgetConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
    toolsets: { ...currentConfig.toolsets, ...config.toolsets },
    providers: { ...currentConfig.providers, ...config.providers },
    priorities: { ...currentConfig.priorities, ...config.priorities },
    global: { ...currentConfig.global, ...config.global },
    persistence: { ...currentConfig.persistence, ...config.persistence },
  };
}

export function resetTokenConfig(): void {
  currentConfig = { ...DEFAULT_TOKEN_CONFIG };
}
