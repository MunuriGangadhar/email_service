import { Email } from '../types';

export abstract class EmailProvider {
  abstract send(email: Email): Promise<boolean>;
  abstract getName(): string;
}