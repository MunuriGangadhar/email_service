import { Email } from '../models/Email';
import { SendStatus, Status } from '../models/SendStatus';
import { EmailProvider } from '../providers/EmailProvider';
import { CircuitBreaker } from '../utils/CircuitBreaker';
import { Logger } from '../utils/Logger';
import { Queue } from '../utils/Queue';
import { RateLimiter } from '../utils/RateLimiter';

export class EmailService {
  private primaryProvider: EmailProvider;
  private secondaryProvider: EmailProvider;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private queue: Queue<Email>;
  private sentEmails: Set<string> = new Set();
  private statusHistory: SendStatus[] = [];
  private maxRetries: number = 3;
  private baseDelay: number = 1000;

  constructor(primaryProvider: EmailProvider, secondaryProvider: EmailProvider) {
    this.primaryProvider = primaryProvider;
    this.secondaryProvider = secondaryProvider;
    this.circuitBreaker = new CircuitBreaker();
    this.rateLimiter = new RateLimiter(10, 60000); // 10 emails per minute
    this.queue = new Queue<Email>();
  }

  async sendEmail(email: Email, clientId: string): Promise<SendStatus> {
    if (this.sentEmails.has(email.id)) {
      Logger.info(`Duplicate email detected: ${email.id}`);
      return this.getStatus(email.id) || this.createStatus(email.id, Status.FAILED, 'Duplicate email');
    }

    if (!this.rateLimiter.canSend(clientId)) {
      this.queue.enqueue(email);
      Logger.info(`Rate limit exceeded, email ${email.id} queued`);
      return this.createStatus(email.id, Status.PENDING, 'Rate limited');
    }

    this.queue.enqueue(email);
    return this.processQueue();
  }

  private async processQueue(): Promise<SendStatus> {
    while (!this.queue.isEmpty()) {
      const email = this.queue.dequeue()!;
      let status = await this.attemptSend(email);

      if (status.status === Status.PENDING) {
        this.queue.enqueue(email);
      }

      return status;
    }

    return this.createStatus('', Status.FAILED, 'Queue empty');
  }

  private async attemptSend(email: Email): Promise<SendStatus> {
    let attempts = 0;
    let currentProvider = this.primaryProvider;

    while (attempts < this.maxRetries) {
      try {
        const success = await this.circuitBreaker.execute(() => currentProvider.send(email));
        if (success) {
          this.sentEmails.add(email.id);
          return this.createStatus(email.id, Status.SUCCESS, undefined, currentProvider.getName(), attempts + 1);
        }
      } catch (error) {
        Logger.error(`Attempt ${attempts + 1} failed for email ${email.id}: ${error}`);
        attempts++;

        if (attempts === this.maxRetries && currentProvider === this.primaryProvider) {
          // Switch to secondary provider for final attempt
          currentProvider = this.secondaryProvider;
          attempts = 0;
          Logger.info(`Switching to ${currentProvider.getName()} for email ${email.id}`);
          continue;
        }

        // Exponential backoff
        const delay = this.baseDelay * Math.pow(2, attempts);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return this.createStatus(email.id, Status.FAILED, 'All attempts failed', currentProvider.getName(), this.maxRetries);
  }

  private createStatus(
    emailId: string,
    status: Status,
    error?: string,
    provider: string = '',
    attempts: number = 0
  ): SendStatus {
    const sendStatus: SendStatus = {
      emailId,
      status,
      attempts,
      provider,
      timestamp: Date.now(),
      error
    };
    this.statusHistory.push(sendStatus);
    return sendStatus;
  }

  getStatus(emailId: string): SendStatus | undefined {
    return this.statusHistory.find(status => status.emailId === emailId);
  }
}