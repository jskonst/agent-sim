const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
}

interface LLMConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

class LLMClient {
  private config: LLMConfig;

  constructor() {
    this.config = {
      model: 'google/gemini-2.0-flash-lite-preview-02-05',
      maxTokens: 200,
      temperature: 0.8,
    };
    try {
      const stored = localStorage.getItem('openrouter_api_key');
      if (stored) this.config.apiKey = stored;
    } catch {}
  }

  async generate(prompt: LLMMessage[]): Promise<LLMResponse | null> {
    if (!this.config.apiKey) return null;

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: prompt,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);
      return {
        action: parsed.action || 'work',
        dialogue: parsed.dialogue,
        moodChange: Math.max(-10, Math.min(10, parsed.moodChange || 0)),
        relationshipChanges: parsed.relationshipChanges || {},
        thoughts: parsed.thoughts || '',
      };
    } catch {
      return null;
    }
  }

  setApiKey(key: string): void {
    this.config.apiKey = key;
    try {
      localStorage.setItem('openrouter_api_key', key);
    } catch {}
  }

  hasApiKey(): boolean {
    return !!this.config.apiKey;
  }
}

export const llmClient = new LLMClient();
