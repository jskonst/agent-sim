export class RateLimiter {
  private calls: number[] = [];
  private readonly MAX_CALLS = 10;
  private readonly WINDOW_MS = 60000;

  canCall(): boolean {
    const now = Date.now();
    this.calls = this.calls.filter(t => now - t < this.WINDOW_MS);
    return this.calls.length < this.MAX_CALLS;
  }

  recordCall(): void {
    this.calls.push(Date.now());
  }
}

export const rateLimiter = new RateLimiter();
