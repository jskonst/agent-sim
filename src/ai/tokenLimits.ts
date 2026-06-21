import {
  TokenBudgetConfig,
  DEFAULT_TOKEN_CONFIG,
  PriorityLevel,
  ToolsetLimit,
} from './tokenConfig';

export type { PriorityLevel };

interface TokenUsageEntry {
  timestamp: number;
  tokens: number;
  toolset: string;
  provider: string;
  priority: PriorityLevel;
  agentId: string;
}

interface PeriodUsage {
  tokens: number;
  count: number;
}

interface ToolsetUsage {
  daily: PeriodUsage;
  hourly: PeriodUsage;
  perMinute: PeriodUsage;
}

interface ProviderUsage {
  daily: PeriodUsage;
  hourly: PeriodUsage;
}

interface PriorityUsage {
  daily: PeriodUsage;
  hourly: PeriodUsage;
}

export type LimitStatus = 'ok' | 'warning' | 'hard_limit' | 'exceeded';
export type DegradationAction = 'none' | 'use_cache' | 'reduce_tokens' | 'skip' | 'fallback_model';

export interface LimitCheckResult {
  allowed: boolean;
  status: LimitStatus;
  degradation: DegradationAction;
  remainingTokens: number;
  usagePercent: number;
  message: string;
}

export interface TokenUsageSnapshot {
  global: { daily: PeriodUsage; hourly: PeriodUsage };
  byToolset: Record<string, ToolsetUsage>;
  byProvider: Record<string, ProviderUsage>;
  byPriority: Record<PriorityLevel, PriorityUsage>;
  totalTokens: number;
  totalRequests: number;
}

class TokenLimits {
  private config: TokenBudgetConfig;
  private entries: TokenUsageEntry[] = [];
  private listeners: Array<(snapshot: TokenUsageSnapshot) => void> = [];

  constructor(config?: Partial<TokenBudgetConfig>) {
    this.config = { ...DEFAULT_TOKEN_CONFIG, ...config };
    this.loadFromStorage();
  }

  onUsageUpdate(listener: (snapshot: TokenUsageSnapshot) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(l => l(snapshot));
  }

  checkLimit(
    toolset: string,
    provider: string,
    priority: PriorityLevel,
    requestedTokens: number
  ): LimitCheckResult {
    const now = Date.now();
    const snapshot = this.getSnapshotForCheck(now);

    const globalHourly = snapshot.global.hourly.tokens;
    const globalDaily = snapshot.global.daily.tokens;
    const globalConfig = this.config.global;

    if (globalDaily >= globalConfig.maxTokensPerDay * globalConfig.hardLimitThreshold) {
      return {
        allowed: false,
        status: 'exceeded',
        degradation: 'skip',
        remainingTokens: 0,
        usagePercent: 1,
        message: 'Глобальный дневной лимит токенов исчерпан',
      };
    }

    if (globalHourly >= globalConfig.maxTokensPerHour * globalConfig.hardLimitThreshold) {
      return {
        allowed: false,
        status: 'hard_limit',
        degradation: 'skip',
        remainingTokens: Math.max(0, globalConfig.maxTokensPerHour - globalHourly),
        usagePercent: globalHourly / globalConfig.maxTokensPerHour,
        message: 'Часовой лимит токенов исчерпан',
      };
    }

    const toolsetConfig = this.config.toolsets[toolset];
    if (toolsetConfig) {
      const toolsetHourly = snapshot.byToolset[toolset]?.hourly.tokens || 0;
      const toolsetDaily = snapshot.byToolset[toolset]?.daily.tokens || 0;

      if (toolsetDaily >= toolsetConfig.maxTokensPerDay * toolsetConfig.hardLimitThreshold) {
        return {
          allowed: false,
          status: 'exceeded',
          degradation: 'skip',
          remainingTokens: 0,
          usagePercent: 1,
          message: `Лимит токенов для инструмента "${toolset}" исчерпан`,
        };
      }

      if (toolsetHourly >= toolsetConfig.maxTokensPerHour * toolsetConfig.hardLimitThreshold) {
        return {
          allowed: false,
          status: 'hard_limit',
          degradation: 'reduce_tokens',
          remainingTokens: Math.max(0, toolsetConfig.maxTokensPerHour - toolsetHourly),
          usagePercent: toolsetHourly / toolsetConfig.maxTokensPerHour,
          message: `Часовой лимит для "${toolset}" исчерпан`,
        };
      }
    }

    const providerConfig = this.config.providers[provider];
    if (providerConfig) {
      const providerDaily = snapshot.byProvider[provider]?.daily.tokens || 0;
      const providerHourly = snapshot.byProvider[provider]?.hourly.tokens || 0;

      if (providerDaily >= providerConfig.maxTokensPerDay * providerConfig.hardLimitThreshold) {
        return {
          allowed: false,
          status: 'exceeded',
          degradation: 'skip',
          remainingTokens: 0,
          usagePercent: 1,
          message: `Лимит провайдера "${provider}" исчерпан`,
        };
      }

      if (providerHourly >= providerConfig.maxTokensPerHour * providerConfig.hardLimitThreshold) {
        return {
          allowed: false,
          status: 'hard_limit',
          degradation: 'fallback_model',
          remainingTokens: Math.max(0, providerConfig.maxTokensPerHour - providerHourly),
          usagePercent: providerHourly / providerConfig.maxTokensPerHour,
          message: `Часовой лимит провайдера "${provider}" исчерпан`,
        };
      }
    }

    const priorityConfig = this.config.priorities[priority];
    if (priorityConfig) {
      const priorityDaily = snapshot.byPriority[priority]?.daily.tokens || 0;
      if (priorityDaily >= priorityConfig.maxTokensPerDay * 0.9) {
        return {
          allowed: true,
          status: 'warning',
          degradation: priorityConfig.degradationStrategy,
          remainingTokens: Math.max(0, priorityConfig.maxTokensPerDay - priorityDaily),
          usagePercent: priorityDaily / priorityConfig.maxTokensPerDay,
          message: `Приоритет "${priority}": лимит gần исчерпанием`,
        };
      }
    }

    const totalHourly = globalHourly;
    const totalDaily = globalDaily;
    const hourlyPercent = totalHourly / globalConfig.maxTokensPerHour;
    const dailyPercent = totalDaily / globalConfig.maxTokensPerDay;

    let status: LimitStatus = 'ok';
    let degradation: DegradationAction = 'none';

    if (hourlyPercent >= globalConfig.hardLimitThreshold || dailyPercent >= globalConfig.hardLimitThreshold) {
      status = 'hard_limit';
      degradation = 'reduce_tokens';
    } else if (hourlyPercent >= globalConfig.warningThreshold || dailyPercent >= globalConfig.warningThreshold) {
      status = 'warning';
      degradation = 'use_cache';
    }

    return {
      allowed: true,
      status,
      degradation,
      remainingTokens: Math.max(0, globalConfig.maxTokensPerDay - totalDaily),
      usagePercent: dailyPercent,
      message: status === 'ok' ? 'Лимиты в норме' : `Использовано ${Math.round(dailyPercent * 100)}% дневного лимита`,
    };
  }

  recordUsage(
    tokens: number,
    toolset: string,
    provider: string,
    priority: PriorityLevel,
    agentId: string
  ): void {
    const entry: TokenUsageEntry = {
      timestamp: Date.now(),
      tokens,
      toolset,
      provider,
      priority,
      agentId,
    };

    this.entries.push(entry);
    this.cleanupOldEntries();
    this.saveToStorage();
    this.notify();
  }

  getAdjustedMaxTokens(toolset: string, defaultMax: number, degradation: DegradationAction): number {
    if (degradation === 'reduce_tokens') {
      return Math.min(defaultMax, Math.round(defaultMax * 0.5));
    }

    const toolsetConfig = this.config.toolsets[toolset];
    if (toolsetConfig) {
      const now = Date.now();
      const snapshot = this.getSnapshotForCheck(now);
      const hourlyUsage = snapshot.byToolset[toolset]?.hourly.tokens || 0;
      const hourlyPercent = hourlyUsage / toolsetConfig.maxTokensPerHour;

      if (hourlyPercent > 0.7) {
        return Math.round(defaultMax * 0.6);
      }
      if (hourlyPercent > 0.5) {
        return Math.round(defaultMax * 0.8);
      }
    }

    return defaultMax;
  }

  private getSnapshotForCheck(now: number): {
    global: { daily: PeriodUsage; hourly: PeriodUsage };
    byToolset: Record<string, ToolsetUsage>;
    byProvider: Record<string, ProviderUsage>;
    byPriority: Record<PriorityLevel, PriorityUsage>;
  } {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    const hourAgo = now - 3600000;
    const minAgo = now - 60000;

    const globalDaily: PeriodUsage = { tokens: 0, count: 0 };
    const globalHourly: PeriodUsage = { tokens: 0, count: 0 };

    const byToolset: Record<string, ToolsetUsage> = {};
    const byProvider: Record<string, ProviderUsage> = {};
    const byPriority: Record<PriorityLevel, PriorityUsage> = {
      critical: { daily: { tokens: 0, count: 0 }, hourly: { tokens: 0, count: 0 } },
      high: { daily: { tokens: 0, count: 0 }, hourly: { tokens: 0, count: 0 } },
      medium: { daily: { tokens: 0, count: 0 }, hourly: { tokens: 0, count: 0 } },
      low: { daily: { tokens: 0, count: 0 }, hourly: { tokens: 0, count: 0 } },
    };

    for (const entry of this.entries) {
      if (entry.timestamp >= dayStartMs) {
        globalDaily.tokens += entry.tokens;
        globalDaily.count++;

        if (!byToolset[entry.toolset]) {
          byToolset[entry.toolset] = {
            daily: { tokens: 0, count: 0 },
            hourly: { tokens: 0, count: 0 },
            perMinute: { tokens: 0, count: 0 },
          };
        }
        byToolset[entry.toolset].daily.tokens += entry.tokens;
        byToolset[entry.toolset].daily.count++;

        if (!byProvider[entry.provider]) {
          byProvider[entry.provider] = {
            daily: { tokens: 0, count: 0 },
            hourly: { tokens: 0, count: 0 },
          };
        }
        byProvider[entry.provider].daily.tokens += entry.tokens;
        byProvider[entry.provider].daily.count++;

        byPriority[entry.priority].daily.tokens += entry.tokens;
        byPriority[entry.priority].daily.count++;
      }

      if (entry.timestamp >= hourAgo) {
        globalHourly.tokens += entry.tokens;
        globalHourly.count++;

        if (byToolset[entry.toolset]) {
          byToolset[entry.toolset].hourly.tokens += entry.tokens;
          byToolset[entry.toolset].hourly.count++;
        }

        if (byProvider[entry.provider]) {
          byProvider[entry.provider].hourly.tokens += entry.tokens;
          byProvider[entry.provider].hourly.count++;
        }

        byPriority[entry.priority].hourly.tokens += entry.tokens;
        byPriority[entry.priority].hourly.count++;
      }
    }

    return { global: { daily: globalDaily, hourly: globalHourly }, byToolset, byProvider, byPriority };
  }

  getSnapshot(): TokenUsageSnapshot {
    const now = Date.now();
    const check = this.getSnapshotForCheck(now);
    const totalTokens = this.entries.reduce((s, e) => s + e.tokens, 0);
    return {
      ...check,
      totalTokens,
      totalRequests: this.entries.length,
    };
  }

  private cleanupOldEntries(): void {
    const cutoff = Date.now() - this.config.persistence.historyDays * 86400000;
    this.entries = this.entries.filter(e => e.timestamp > cutoff);
  }

  private saveToStorage(): void {
    try {
      const data = JSON.stringify(this.entries);
      localStorage.setItem(this.config.persistence.storageKey, data);
    } catch {}
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.config.persistence.storageKey);
      if (data) {
        this.entries = JSON.parse(data);
        this.cleanupOldEntries();
      }
    } catch {
      this.entries = [];
    }
  }

  reset(): void {
    this.entries = [];
    try {
      localStorage.removeItem(this.config.persistence.storageKey);
    } catch {}
    this.notify();
  }

  resetDaily(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.entries = this.entries.filter(e => e.timestamp < today.getTime());
    this.saveToStorage();
    this.notify();
  }

  getConfig(): TokenBudgetConfig {
    return this.config;
  }

  setConfig(config: Partial<TokenBudgetConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      toolsets: { ...this.config.toolsets, ...config.toolsets },
      providers: { ...this.config.providers, ...config.providers },
      priorities: { ...this.config.priorities, ...config.priorities },
      global: { ...this.config.global, ...config.global },
      persistence: { ...this.config.persistence, ...config.persistence },
    };
  }

  exportUsage(): string {
    return JSON.stringify({
      config: this.config,
      snapshot: this.getSnapshot(),
      entries: this.entries.slice(-100),
    }, null, 2);
  }
}

export const tokenLimits = new TokenLimits();
