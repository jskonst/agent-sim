import { tokenLimits, LimitCheckResult, PriorityLevel } from './tokenLimits';
import { getTokenConfig } from './tokenConfig';

const DEFAULT_MODEL = "glm-5.2";
const DEFAULT_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  action: string;
  dialogue?: { text: string; emotion: string };
  moodChange: number;
  relationshipChanges: Record<string, number>;
  thoughts: string;
  tokensUsed?: number;
}

export interface GenerateOptions {
  toolset?: string;
  priority?: PriorityLevel;
  agentId?: string;
  maxTokensOverride?: number;
}

interface LLMConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl: string;
}

class LLMClient {
  private config: LLMConfig;

  constructor() {
    this.config = {
      model: DEFAULT_MODEL,
      maxTokens: 200,
      temperature: 0.8,
      baseUrl: DEFAULT_URL,
    };
    try {
      const stored = localStorage.getItem('openrouter_api_key');
      if (stored) this.config.apiKey = stored;
      const storedUrl = localStorage.getItem('llm_base_url');
      if (storedUrl) this.config.baseUrl = storedUrl;
      const storedModel = localStorage.getItem('llm_model');
      if (storedModel) this.config.model = storedModel;
    } catch {}
  }

  async generate(prompt: LLMMessage[], options?: GenerateOptions): Promise<LLMResponse | null> {
    if (!this.config.apiKey) return null;

    const toolset = options?.toolset || 'activity_change';
    const priority = options?.priority || 'medium';
    const agentId = options?.agentId || 'unknown';
    const provider = this.extractProvider();

    const limitCheck = tokenLimits.checkLimit(toolset, provider, priority, this.config.maxTokens);

    if (!limitCheck.allowed) {
      return null;
    }

    let maxTokens = options?.maxTokensOverride || this.config.maxTokens;
    if (limitCheck.degradation === 'reduce_tokens') {
      maxTokens = tokenLimits.getAdjustedMaxTokens(toolset, maxTokens, 'reduce_tokens');
    }

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: prompt,
          max_tokens: maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;

      const tokensUsed = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

      if (tokensUsed > 0) {
        tokenLimits.recordUsage(tokensUsed, toolset, provider, priority, agentId);
      }

      const parsed = JSON.parse(content);
      return {
        action: parsed.action || 'work',
        dialogue: parsed.dialogue,
        moodChange: Math.max(-10, Math.min(10, parsed.moodChange || 0)),
        relationshipChanges: parsed.relationshipChanges || {},
        thoughts: parsed.thoughts || '',
        tokensUsed,
      };
    } catch {
      return null;
    }
  }

  private extractProvider(): string {
    const url = this.config.baseUrl.toLowerCase();
    if (url.includes('openrouter')) return 'openrouter';
    if (url.includes('openai')) return 'openai';
    if (url.includes('anthropic')) return 'anthropic';
    if (url.includes('google')) return 'google';
    return 'custom';
  }

  setApiKey(key: string): void {
    this.config.apiKey = key;
    try {
      localStorage.setItem('openrouter_api_key', key);
    } catch {}
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  setBaseUrl(url: string): void {
    this.config.baseUrl = url;
    try {
      localStorage.setItem('llm_base_url', url);
    } catch {}
  }

  getModel(): string {
    return this.config.model;
  }

  setModel(model: string): void {
    this.config.model = model;
    try {
      localStorage.setItem('llm_model', model);
    } catch {}
  }

  getTemperature(): number {
    return this.config.temperature;
  }

  setTemperature(temp: number): void {
    this.config.temperature = Math.max(0, Math.min(2, temp));
  }

  getMaxTokens(): number {
    return this.config.maxTokens;
  }

  setMaxTokens(tokens: number): void {
    this.config.maxTokens = Math.max(1, Math.min(4096, tokens));
  }

  hasApiKey(): boolean {
    return !!this.config.apiKey;
  }
}

export const llmClient = new LLMClient();