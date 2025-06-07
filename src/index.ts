import express from 'express';
import { EmailService } from './services/EmailService';
import { PrimaryProvider } from './providers/PrimaryProvider';
import { SecondaryProvider } from './providers/SecondaryProvider';
import { createRouter } from './api/routes';

async function main() {
  const app = express();
  const port = 3000;

  const primaryProvider = new PrimaryProvider();
  const secondaryProvider = new SecondaryProvider();
  const emailService = new EmailService(primaryProvider, secondaryProvider);

  app.use('/api/email', createRouter(emailService));

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

main().catch(console.error);