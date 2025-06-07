import { Logger } from './Logger';

enum State {
  CLOSED,
  OPEN,
  HALF_OPEN
}

export class CircuitBreaker {
  private state: State = State.CLOSED;
  private failureCount = 0;
  private failureThreshold: number;
  private resetTimeout: number;
  private lastFailureTime: number | null = null;

  constructor(failureThreshold: number = 3, resetTimeout: number = 10000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === State.OPEN) {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = State.HALF_OPEN;
        Logger.info('Circuit breaker transitioning to HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === State.HALF_OPEN) {
      this.state = State.CLOSED;
      this.failureCount = 0;
      Logger.info('Circuit breaker transitioned to CLOSED');
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = State.OPEN;
      Logger.error('Circuit breaker transitioned to OPEN');
    }
  }
}