# Suicket Email Server

A simple Express.js backend service that handles email sending via SendGrid for
the Suicket application.

## Why This Backend is Needed

SendGrid cannot be used directly from the browser due to CORS (Cross-Origin
Resource Sharing) restrictions. This backend acts as a proxy to handle email
sending securely.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
PORT=3001
```

### 3. Get SendGrid Credentials

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to Settings > API Keys
3. Create a new API key with "Mail Send" permissions
4. Verify a sender email in Settings > Sender Authentication

### 4. Start the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST /api/send-ticket-email

Sends a ticket confirmation email.

**Request Body:**

```json
{
  "eventName": "CalHacks 12.0",
  "eventDate": "November 15-17, 2025",
  "eventLocation": "UC Berkeley, CA",
  "ticketUrls": ["https://example.com/ticket1", "https://example.com/ticket2"],
  "recipientEmail": "user@example.com",
  "quantity": 2
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "message": "Email service is running"
}
```

## Frontend Integration

The frontend automatically calls this backend service. If the backend is not
running, it falls back to console logging.

## Development

- The server uses ES modules (`"type": "module"` in package.json)
- CORS is enabled for all origins (configure for production)
- Error handling includes detailed logging
- Email templates are generated server-side

## Production Considerations

1. **Security**: Add authentication/rate limiting
2. **CORS**: Configure specific allowed origins
3. **Environment**: Use proper environment variable management
4. **Logging**: Add structured logging
5. **Monitoring**: Add health checks and monitoring
6. **Scaling**: Consider using a proper email service or queue system
