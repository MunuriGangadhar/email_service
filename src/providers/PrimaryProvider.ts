import { EmailProvider } from './EmailProvider';
import { Email } from '../types';

export class PrimaryProvider extends EmailProvider {
  private failureRate = 0.3; // 30% chance of failure for testing

  async send(email: Email): Promise<boolean> {
    if (Math.random() < this.failureRate) {
      throw new Error('Primary provider failed to send email');
    }
    return true;
  }

  getName(): string {
    return 'PrimaryProvider';
  }
}