/**
 * Game time system - day/night cycle for Agent Sim
 * Handles time progression, day/night transitions, and time display
 */

export class GameTime {
  private currentMinutes: number = 480; // Start at 8:00 AM (8 * 60)
  private dayLength: number = 24; // Minutes per game hour
  private dayNumber: number = 1;

  // Time scale: 1 real second = X game minutes
  private timeScale: number = 1;

  constructor(timeScale: number = 1) {
    this.timeScale = timeScale;
  }

  /**
   * Update game time
   * @param delta Time elapsed in seconds
   */
  update(delta: number): void {
    this.currentMinutes += delta * this.timeScale;

    // Check if day ended
    if (this.currentMinutes >= 1440) { // 24 * 60
      this.currentMinutes = 0;
      this.dayNumber++;
    }
  }

  /**
   * Get current time in hours (0-23)
   */
  getHours(): number {
    return Math.floor(this.currentMinutes / 60);
  }

  /**
   * Get current minutes (0-59)
   */
  getMinutes(): number {
    return Math.floor(this.currentMinutes % 60);
  }

  /**
   * Get formatted time string (e.g., "08:30")
   */
  getFormattedTime(): string {
    const hours = this.getHours();
    const minutes = this.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Get day period (morning, afternoon, evening, night)
   */
  getDayPeriod(): string {
    const hour = this.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Check if it's day time (6 AM - 8 PM)
   */
  isDaytime(): boolean {
    const hour = this.getHours();
    return hour >= 6 && hour < 20;
  }

  /**
   * Get current day number
   */
  getDayNumber(): number {
    return this.dayNumber;
  }

  /**
   * Set time scale (speed of time progression)
   */
  setTimeScale(scale: number): void {
    this.timeScale = Math.max(0.1, scale);
  }

  /**
   * Get time scale
   */
  getTimeScale(): number {
    return this.timeScale;
  }

  /**
   * Set specific time (for testing/debugging)
   */
  setTime(hours: number, minutes: number = 0): void {
    this.currentMinutes = hours * 60 + minutes;
  }
}