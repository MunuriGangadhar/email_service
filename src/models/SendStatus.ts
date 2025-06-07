export enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface SendStatus {
  emailId: string;
  status: Status;
  attempts: number;
  provider: string;
  timestamp: number;
  error?: string;
}