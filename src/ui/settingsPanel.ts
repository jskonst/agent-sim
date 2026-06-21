import { getTokenConfig, setTokenConfig, resetTokenConfig, TokenBudgetConfig } from '../ai/tokenConfig';
import { tokenLimits } from '../ai/tokenLimits';
import { llmClient } from '../ai/llmClient';

const STORAGE_KEY = 'agent_sim_settings';

interface SavedSettings {
  global: TokenBudgetConfig['global'];
  toolsets: Record<string, { maxTokensPerDay: number; maxTokensPerHour: number }>;
  priorities: Record<string, { maxTokensPerDay: number; maxTokensPerHour: number; degradationStrategy: string }>;
  providers: Record<string, { maxTokensPerDay: number; maxTokensPerHour: number }>;
  llm: { model: string; maxTokens: number; temperature: number; baseUrl: string; apiKey: string };
}

function loadSaved(): SavedSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveSettings(s: SavedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

function numInput(label: string, value: number, step: number, min: number, max: number): string {
  const id = `s_${label.replace(/\s+/g, '_')}`;
  return `<div style="display:flex;align-items:center;gap:6px;margin:3px 0">
    <span style="width:160px;color:#ccc;font-size:11px">${label}</span>
    <input id="${id}" type="number" value="${value}" step="${step}" min="${min}" max="${max}"
      style="width:80px;background:#1a1a2e;color:#fff;border:1px solid #4ecdc4;padding:3px 5px;font-size:11px;border-radius:3px" />
  </div>`;
}

function textInput(label: string, value: string, type = 'text'): string {
  const id = `s_${label.replace(/\s+/g, '_')}`;
  return `<div style="display:flex;align-items:center;gap:6px;margin:3px 0">
    <span style="width:160px;color:#ccc;font-size:11px">${label}</span>
    <input id="${id}" type="${type}" value="${value}"
      style="width:200px;background:#1a1a2e;color:#fff;border:1px solid #4ecdc4;padding:3px 5px;font-size:11px;border-radius:3px" />
  </div>`;
}

function sectionHeader(title: string, collapsed = false): string {
  return `<div style="color:#4ecdc4;font-weight:bold;font-size:12px;margin:10px 0 4px;border-top:1px solid #333;padding-top:6px">${title}</div>`;
}

function getVal(id: string, fallback: number): number {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return fallback;
  const v = parseFloat(el.value);
  return isNaN(v) ? fallback : v;
}

function getStr(id: string, fallback: string): string {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el?.value || fallback;
}

export class SettingsPanel {
  private overlay: HTMLDivElement | null = null;
  private visible = false;
  private onCloseCallback: (() => void) | null = null;

  show(onClose?: () => void): void {
    if (this.visible) return;
    this.visible = true;
    this.onCloseCallback = onClose || null;
    this.render();
  }

  hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.overlay?.remove();
    this.overlay = null;
  }

  toggle(onClose?: () => void): void {
    if (this.visible) this.hide();
    else this.show(onClose);
  }

  private render(): void {
    const config = getTokenConfig();
    const saved = loadSaved();

    const g = saved?.global || config.global;
    const llm = saved?.llm || {
      model: llmClient.getModel(),
      maxTokens: llmClient.getMaxTokens(),
      temperature: llmClient.getTemperature(),
      baseUrl: llmClient.getBaseUrl(),
      apiKey: '',
    };

    const toolsetNames = Object.keys(config.toolsets);
    const priorityNames = Object.keys(config.priorities) as Array<keyof typeof config.priorities>;

    let html = `
    <div id="settingsOverlay" style="
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.5);z-index:9999;
      display:flex;align-items:center;justify-content:center;
    ">
    <div style="
      background:#0d1117;border:1px solid #4ecdc4;border-radius:8px;
      padding:16px;width:440px;max-height:80vh;overflow-y:auto;
      font-family:monospace;color:#fff;
    ">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="color:#4ecdc4;font-size:14px;font-weight:bold">⚙ Token Settings</span>
        <button id="settingsClose" style="background:none;border:none;color:#e53e3e;font-size:18px;cursor:pointer">✕</button>
      </div>

      ${sectionHeader('LLM')}
      ${textInput('Model', llm.model)}
      ${numInput('Max Tokens/Req', llm.maxTokens, 50, 1, 4096)}
      ${numInput('Temperature', llm.temperature, 0.1, 0, 2)}
      ${textInput('Base URL', llm.baseUrl)}
      ${textInput('API Key', llm.apiKey, 'password')}

      ${sectionHeader('Глобальные лимиты')}
      ${numInput('Max Tokens/Day', g.maxTokensPerDay, 1000, 0, 1000000)}
      ${numInput('Max Tokens/Hour', g.maxTokensPerHour, 100, 0, 100000)}
      ${numInput('Warning Threshold', g.warningThreshold, 0.05, 0, 1)}
      ${numInput('Hard Limit Threshold', g.hardLimitThreshold, 0.05, 0, 1)}

      ${sectionHeader('Toolsets')}
      ${toolsetNames.map(ts => {
        const tl = saved?.toolsets?.[ts] || config.toolsets[ts];
        return `<div style="margin-left:10px">
          <span style="color:#ecc94b;font-size:11px">${ts}</span>
          ${numInput(`${ts} Day`, tl.maxTokensPerDay, 500, 0, 100000)}
          ${numInput(`${ts} Hour`, tl.maxTokensPerHour, 50, 0, 10000)}
        </div>`;
      }).join('')}

      ${sectionHeader('Приоритеты')}
      ${priorityNames.map(pr => {
        const pl = saved?.priorities?.[pr] || config.priorities[pr];
        const strategies = ['skip', 'reduce_tokens', 'use_cache', 'fallback_model'];
        return `<div style="margin-left:10px">
          <span style="color:#ecc94b;font-size:11px">${pr}</span>
          ${numInput(`${pr} Day`, pl.maxTokensPerDay, 500, 0, 100000)}
          ${numInput(`${pr} Hour`, pl.maxTokensPerHour, 50, 0, 10000)}
          <div style="display:flex;align-items:center;gap:6px;margin:3px 0">
            <span style="width:160px;color:#ccc;font-size:11px">Strategy</span>
            <select id="s_${pr}_strategy" style="width:200px;background:#1a1a2e;color:#fff;border:1px solid #4ecdc4;padding:3px 5px;font-size:11px;border-radius:3px">
              ${strategies.map(s => `<option value="${s}" ${s === pl.degradationStrategy ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>`;
      }).join('')}

      <div style="display:flex;gap:8px;margin-top:14px;border-top:1px solid #333;padding-top:10px">
        <button id="settingsApply" style="flex:1;background:#4ecdc4;color:#000;border:none;padding:6px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:12px">Применить</button>
        <button id="settingsReset" style="flex:1;background:#ecc94b;color:#000;border:none;padding:6px;border-radius:4px;cursor:pointer;font-size:12px">Сбросить</button>
        <button id="settingsCloseBtn" style="flex:1;background:#555;color:#fff;border:none;padding:6px;border-radius:4px;cursor:pointer;font-size:12px">Закрыть</button>
      </div>
    </div>
    </div>`;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    this.overlay = container.firstElementChild as HTMLDivElement;

    this.overlay.querySelector('#settingsClose')!.addEventListener('click', () => this.close());
    this.overlay.querySelector('#settingsCloseBtn')!.addEventListener('click', () => this.close());
    this.overlay.querySelector('#settingsApply')!.addEventListener('click', () => this.apply());
    this.overlay.querySelector('#settingsReset')!.addEventListener('click', () => this.resetToDefaults());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  private apply(): void {
    const toolsetNames = Object.keys(getTokenConfig().toolsets);
    const priorityNames = Object.keys(getTokenConfig().priorities);

    const toolsets: Record<string, any> = {};
    for (const ts of toolsetNames) {
      toolsets[ts] = {
        maxTokensPerDay: getVal(`s_${ts}_Day`, 5000),
        maxTokensPerHour: getVal(`s_${ts}_Hour`, 500),
      };
    }

    const priorities: Record<string, any> = {};
    for (const pr of priorityNames) {
      const stratEl = document.getElementById(`s_${pr}_strategy`) as HTMLSelectElement | null;
      priorities[pr] = {
        maxTokensPerDay: getVal(`s_${pr}_Day`, 10000),
        maxTokensPerHour: getVal(`s_${pr}_Hour`, 1000),
        degradationStrategy: (stratEl?.value || 'skip') as 'skip' | 'reduce_tokens' | 'use_cache' | 'fallback_model',
      };
    }

    const configUpdate: Partial<TokenBudgetConfig> = {
      global: {
        maxTokensPerDay: getVal('s_Max_Tokens/Day', 50000),
        maxTokensPerHour: getVal('s_Max_Tokens/Hour', 5000),
        warningThreshold: getVal('s_Warning_Threshold', 0.7),
        hardLimitThreshold: getVal('s_Hard_Limit_Threshold', 0.9),
      },
      toolsets,
      priorities,
    };

    setTokenConfig(configUpdate);
    tokenLimits.setConfig(configUpdate);

    const model = getStr('s_Model', 'glm-5.2');
    const maxTokens = getVal('s_Max_Tokens/Req', 200);
    const temperature = getVal('s_Temperature', 0.8);
    const baseUrl = getStr('s_Base_URL', 'https://openrouter.ai/api/v1/chat/completions');
    const apiKey = getStr('s_API_Key', '');

    llmClient.setModel(model);
    llmClient.setMaxTokens(maxTokens);
    llmClient.setTemperature(temperature);
    llmClient.setBaseUrl(baseUrl);
    if (apiKey) llmClient.setApiKey(apiKey);

    saveSettings({
      global: configUpdate.global!,
      toolsets,
      priorities,
      providers: {},
      llm: { model, maxTokens, temperature, baseUrl, apiKey: llmClient.hasApiKey() ? '***' : '' },
    });
  }

  private resetToDefaults(): void {
    resetTokenConfig();
    tokenLimits.setConfig(getTokenConfig());
    localStorage.removeItem(STORAGE_KEY);
    this.hide();
    this.show(this.onCloseCallback ?? undefined);
  }

  private close(): void {
    this.hide();
    this.onCloseCallback?.();
  }

  isVisible(): boolean {
    return this.visible;
  }

  applySaved(): void {
    const saved = loadSaved();
    if (!saved) return;

    const configUpdate: Partial<TokenBudgetConfig> = {
      global: saved.global,
      toolsets: {} as any,
      priorities: {} as any,
    };

    const config = getTokenConfig();
    for (const ts of Object.keys(config.toolsets)) {
      if (saved.toolsets?.[ts]) {
        configUpdate.toolsets![ts] = { ...config.toolsets[ts], ...saved.toolsets[ts] };
      }
    }
    for (const pr of Object.keys(config.priorities) as Array<keyof typeof config.priorities>) {
      if (saved.priorities?.[pr]) {
        const savedPr = saved.priorities[pr];
        configUpdate.priorities![pr] = {
          ...config.priorities[pr],
          ...savedPr,
          degradationStrategy: savedPr.degradationStrategy as typeof config.priorities[typeof pr]['degradationStrategy'],
        };
      }
    }

    setTokenConfig(configUpdate);
    tokenLimits.setConfig(configUpdate);

    if (saved.llm) {
      if (saved.llm.model) llmClient.setModel(saved.llm.model);
      if (saved.llm.maxTokens) llmClient.setMaxTokens(saved.llm.maxTokens);
      if (saved.llm.temperature) llmClient.setTemperature(saved.llm.temperature);
      if (saved.llm.baseUrl) llmClient.setBaseUrl(saved.llm.baseUrl);
    }
  }
}
