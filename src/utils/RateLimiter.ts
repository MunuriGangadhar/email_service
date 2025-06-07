export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private requests: Map<string, number[]> = new Map();

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canSend(clientId: string): boolean {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];
    const validRequests = clientRequests.filter(timestamp => now - timestamp < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(clientId, validRequests);
    return true;
  }
}