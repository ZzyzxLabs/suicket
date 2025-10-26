# SendGrid Email Service Setup

This document explains how to set up SendGrid for sending ticket confirmation
emails in the Suicket application.

## Prerequisites

1. A SendGrid account (sign up at https://sendgrid.com/)
2. A verified sender email address in SendGrid

## Setup Steps

### 1. Get SendGrid API Key

1. Log in to your SendGrid dashboard
2. Navigate to Settings > API Keys
3. Click "Create API Key"
4. Choose "Restricted Access" and give it "Mail Send" permissions
5. Copy the generated API key

### 2. Verify Sender Email

1. In SendGrid dashboard, go to Settings > Sender Authentication
2. Click "Verify a Single Sender"
3. Enter your email address and complete verification
4. Note the verified email address for use in environment variables

### 3. Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SENDGRID_API_KEY=your_sendgrid_api_key_here
VITE_SENDGRID_FROM_EMAIL=your_verified_email@domain.com
```

**Important:**

- Replace `your_sendgrid_api_key_here` with your actual SendGrid API key
- Replace `your_verified_email@domain.com` with your verified sender email
- Never commit the `.env` file to version control
- In Vite, environment variables are accessed via `import.meta.env` instead of
  `process.env`

### 4. Example Configuration

```env
VITE_SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_SENDGRID_FROM_EMAIL=noreply@suicket.com
```

## Features

The email service provides:

- **Ticket Confirmation Emails**: Automatically sent when users purchase tickets
- **HTML & Text Templates**: Professional email templates with event details
- **Multiple Ticket Support**: Handles single or multiple ticket purchases
- **Error Handling**: Graceful fallback if email sending fails
- **Bulk Email Support**: For sending to multiple recipients

## Usage

The email service is automatically integrated into the ticket purchasing flow.
When a user buys tickets:

1. The system generates QR code URLs for each ticket
2. An email is automatically sent with ticket links
3. Users receive a professional confirmation email with event details
4. Each ticket has its own clickable link

## Email Template

The email includes:

- Event name, date, and location
- Individual ticket links
- Important instructions
- Professional branding

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Verify your API key is correct
   - Ensure the API key has "Mail Send" permissions

2. **"Sender Not Verified" Error**
   - Complete sender verification in SendGrid dashboard
   - Use the exact verified email address

3. **Emails Not Sending**
   - Check browser console for error messages
   - Verify environment variables are loaded correctly
   - Check SendGrid account status and limits

### Testing

To test the email functionality:

1. Set up environment variables
2. Purchase a ticket through the app
3. Check the browser console for success/error messages
4. Verify the email arrives in the recipient's inbox

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Consider using a backend service for production email sending
- Monitor SendGrid usage and set up alerts for unusual activity
