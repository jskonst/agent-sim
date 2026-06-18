import { LLMResponse } from './llmClient';

function simpleMD5(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export class LLMCache {
  private cache: Map<string, { response: LLMResponse; timestamp: number }> = new Map();
  private readonly TTL_MS = 5 * 60 * 1000;

  getKey(agentId: string, hour: number, location: string, activity: string): string {
    return simpleMD5(`${agentId}:${hour}:${location}:${activity}`);
  }

  get(key: string): LLMResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  set(key: string, response: LLMResponse): void {
    this.cache.set(key, { response, timestamp: Date.now() });
    if (this.cache.size > 200) {
      const oldest = [...this.cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) this.cache.delete(oldest[0]);
    }
  }
}

export const llmCache = new LLMCache();
