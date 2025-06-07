import express, { Request, Response } from 'express';
import { EmailService } from '../services/EmailService';
import { Email } from '../models/Email';
import { Logger } from '../utils/Logger';

export const createRouter = (emailService: EmailService) => {
  const router = express.Router();

  router.use(express.json());

  // Send email endpoint
  router.post('/send', async (req: Request, res: Response) => {
    try {
      const { id, to, subject, body, clientId } = req.body;
      if (!id || !to || !subject || !body || !clientId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const email: Email = { id, to, subject, body };
      const status = await emailService.sendEmail(email, clientId);
      res.status(200).json(status);
    } catch (error) {
      Logger.error(`Error sending email: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get email status endpoint
  router.get('/status/:emailId', async (req: Request, res: Response) => {
    try {
      const status = emailService.getStatus(req.params.emailId);
      if (!status) {
        return res.status(404).json({ error: 'Status not found' });
      }
      res.status(200).json(status);
    } catch (error) {
      Logger.error(`Error fetching status: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};