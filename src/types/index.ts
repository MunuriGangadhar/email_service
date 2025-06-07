export interface EmailProvider {
  send(email: Email): Promise<boolean>;
  getName(): string;
}

export interface Email {
  id: string;
  to: string;
  subject: string;
  body: string;
}