# 📧 Resilient Email Sending Service

A robust email delivery service built with **TypeScript** that includes:
- Retry logic with exponential backoff
- Fallback providers
- Circuit breaker pattern
- Rate limiting
- Idempotency support
- Email status tracking

---

## 🚀 Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/email-service.git
   cd email-service


2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Run the project**

   ```bash
   npm start
   ```

5. **Run tests**

   ```bash
   npm test
   ```

---

## 📬 API Endpoints

### `POST /api/email/send`

Send an email using the service.

#### 📥 Request Body:

```json
{
  "id": "string",
  "to": "string",
  "subject": "string",
  "body": "string",
  "clientId": "string"
}
```

#### 📤 Response:

* `200 OK`: Returns email status object.
* `400 Bad Request`: Missing required fields.
* `500 Internal Server Error`: Something went wrong.

---

### `GET /api/email/status/:emailId`

Retrieve the status of a previously sent email.

#### 📤 Response:

* `200 OK`: Returns email status object.
* `404 Not Found`: Email status not found.
* `500 Internal Server Error`: Something went wrong.

---

## 🧑‍💻 Usage Example

```ts
import { EmailService } from './services/EmailService';
import { PrimaryProvider } from './providers/PrimaryProvider';
import { SecondaryProvider } from './providers/SecondaryProvider';

const emailService = new EmailService(new PrimaryProvider(), new SecondaryProvider());

const email = {
  id: 'email-123',
  to: 'recipient@example.com',
  subject: 'Test Email',
  body: 'This is a test email'
};

emailService.sendEmail(email, 'client-1').then(status => {
  console.log('Email status:', status);
});
```

---

## ✨ Features

* 🔁 **Retry Mechanism**: Retries failed email sends with exponential backoff.
* 🔄 **Fallback Providers**: Switches between primary and secondary providers if one fails.
* 🛑 **Circuit Breaker**: Avoids overwhelming failing providers.
* 🧠 **Idempotency**: Uses email ID cache to prevent duplicate sends.
* 🚦 **Rate Limiting**: Restricts sending to 10 emails per minute per client.
* 📊 **Status Tracking**: Tracks and retrieves the status of sent emails.
* 📝 **Simple Logging**: Logs essential service events.
* 📩 **Basic Queue System**: Ensures ordered and controlled email dispatch.

---

## 📁 Project Structure

```
.
├── src/
│   ├── api/                  # API routes
│   ├── providers/            # Email provider implementations
│   ├── services/             # Core EmailService logic
│   ├── utils/                # Helper utilities (circuit breaker, rate limiter, etc.)
│   └── index.ts              # Entry point
├── package.json
├── tsconfig.json
└── README.md
