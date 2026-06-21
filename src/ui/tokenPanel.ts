import Phaser from 'phaser';
import { tokenLimits, TokenUsageSnapshot, LimitStatus } from '../ai/tokenLimits';

export class TokenPanel {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private scene: Phaser.Scene;
  private visible: boolean = false;
  private texts: Phaser.GameObjects.Text[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const cam = scene.cameras.main;
    const panelWidth = 320;
    const panelHeight = 280;
    const x = cam.width - panelWidth - 10;
    const y = 10;

    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(200);
    this.container.setVisible(false);

    this.bg = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.85);
    this.bg.setOrigin(0, 0);

    this.border = scene.add.rectangle(0, 0, panelWidth, panelHeight);
    this.border.setOrigin(0, 0);
    this.border.setFillStyle(0x000000, 0);
    this.border.setStrokeStyle(1, 0x4ecdc4, 0.6);

    this.container.add([this.bg, this.border]);

    const labels = [
      { text: '📊 Token Limits', y: 8, style: { fontSize: '12px', color: '#4ecdc4', fontStyle: 'bold' as const } },
      { text: '', y: 28, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 44, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 60, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 76, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 96, style: { fontSize: '11px', color: '#4ecdc4', fontStyle: 'bold' as const } },
      { text: '', y: 112, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 128, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 144, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 164, style: { fontSize: '11px', color: '#4ecdc4', fontStyle: 'bold' as const } },
      { text: '', y: 180, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 196, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 212, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 232, style: { fontSize: '10px', color: '#ffffff' } },
      { text: '', y: 252, style: { fontSize: '10px', color: '#888888' } },
    ];

    labels.forEach(({ text, y, style }) => {
      const t = scene.add.text(8, y, text, style);
      this.texts.push(t);
      this.container.add(t);
    });

    this.unsubscribe = tokenLimits.onUsageUpdate((snapshot) => {
      if (this.visible) this.updateDisplay(snapshot);
    });
  }

  toggle(): void {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
    if (this.visible) {
      this.updateDisplay(tokenLimits.getSnapshot());
    }
  }

  show(): void {
    this.visible = true;
    this.container.setVisible(true);
    this.updateDisplay(tokenLimits.getSnapshot());
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  isVisible(): boolean {
    return this.visible;
  }

  private updateDisplay(snapshot: TokenUsageSnapshot): void {
    const config = tokenLimits.getConfig();
    const g = snapshot.global;

    const gDailyPct = g.daily.tokens / config.global.maxTokensPerDay;
    const gHourlyPct = g.hourly.tokens / config.global.maxTokensPerHour;
    const gStatus = this.getStatusColor(gDailyPct >= config.global.hardLimitThreshold ? 'hard_limit' :
      gDailyPct >= config.global.warningThreshold ? 'warning' : 'ok');

    this.texts[1].setText(`Глобально: ${this.formatTokens(g.daily.tokens)}/${this.formatTokens(config.global.maxTokensPerDay)} (${Math.round(gDailyPct * 100)}%)`);
    this.texts[1].setColor(gStatus);
    this.texts[2].setText(`  Час: ${this.formatTokens(g.hourly.tokens)}/${this.formatTokens(config.global.maxTokensPerHour)} (${Math.round(gHourlyPct * 100)}%)`);
    this.texts[3].setText(`  Запросов: ${g.count} дн / ${snapshot.totalRequests} всего`);
    this.texts[4].setText(`  Токенов всего: ${this.formatTokens(snapshot.totalTokens)}`);

    this.texts[5].setText('🔧 По инструментам:');
    let toolRow = 6;
    const toolsets = Object.keys(config.toolsets);
    for (const ts of toolsets.slice(0, 3)) {
      const tsUsage = snapshot.byToolset[ts];
      const daily = tsUsage?.daily.tokens || 0;
      const limit = config.toolsets[ts].maxTokensPerDay;
      const pct = daily / limit;
      this.texts[toolRow].setText(`  ${ts}: ${this.formatTokens(daily)}/${this.formatTokens(limit)} (${Math.round(pct * 100)}%)`);
      this.texts[toolRow].setColor(this.getStatusColor(pct >= 1 ? 'hard_limit' : pct >= 0.8 ? 'warning' : 'ok'));
      toolRow++;
    }

    this.texts[toolRow++].setText('🏢 По провайдерам:');
    const providers = Object.keys(config.providers);
    for (const p of providers.slice(0, 2)) {
      const pUsage = snapshot.byProvider[p];
      const daily = pUsage?.daily.tokens || 0;
      const limit = config.providers[p].maxTokensPerDay;
      const pct = daily / limit;
      this.texts[toolRow].setText(`  ${p}: ${this.formatTokens(daily)}/${this.formatTokens(limit)} (${Math.round(pct * 100)}%)`);
      this.texts[toolRow].setColor(this.getStatusColor(pct >= 0.95 ? 'hard_limit' : pct >= 0.75 ? 'warning' : 'ok'));
      toolRow++;
    }

    this.texts[toolRow++].setText('⚡ По приоритетам:');
    const priorities: Array<{ key: string; label: string }> = [
      { key: 'critical', label: 'Критический' },
      { key: 'high', label: 'Высокий' },
      { key: 'medium', label: 'Средний' },
    ];
    for (const pr of priorities) {
      const prUsage = snapshot.byPriority[pr.key as keyof typeof snapshot.byPriority];
      const daily = prUsage?.daily.tokens || 0;
      const limit = config.priorities[pr.key as keyof typeof config.priorities].maxTokensPerDay;
      const pct = daily / limit;
      this.texts[toolRow].setText(`  ${pr.label}: ${this.formatTokens(daily)}/${this.formatTokens(limit)} (${Math.round(pct * 100)}%)`);
      this.texts[toolRow].setColor(this.getStatusColor(pct >= 0.9 ? 'hard_limit' : pct >= 0.7 ? 'warning' : 'ok'));
      toolRow++;
    }

    for (let i = toolRow; i < this.texts.length; i++) {
      this.texts[i].setText('');
    }
  }

  private getStatusColor(status: LimitStatus): string {
    switch (status) {
      case 'ok': return '#48bb78';
      case 'warning': return '#ecc94b';
      case 'hard_limit': return '#ed8936';
      case 'exceeded': return '#e53e3e';
    }
  }

  private formatTokens(tokens: number): string {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  }

  destroy(): void {
    if (this.unsubscribe) this.unsubscribe();
    this.container.destroy(true);
  }
}
