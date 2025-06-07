import { EmailProvider } from './EmailProvider';
import { Email } from '../types';

export class SecondaryProvider extends EmailProvider {
  private failureRate = 0.1; // 10% chance of failure for testing

  async send(email: Email): Promise<boolean> {
    if (Math.random() < this.failureRate) {
      throw new Error('Secondary provider failed to send email');
    }
    return true;
  }

  getName(): string {
    return 'SecondaryProvider';
  }
}