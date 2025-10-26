import express from "express";
import cors from "cors";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email templates
const generateTicketEmailHTML = (data) => {
  const { eventName, eventDescription, ticketUrls, quantity } = data;

  const ticketLinks = ticketUrls
    .map(
      (url, index) => `
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Ticket ${index + 1}</h3>
        <p style="margin: 0 0 10px 0; color: #666;">Click the link below to view your ticket:</p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          View Ticket ${index + 1}
        </a>
      </div>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your ${eventName} Tickets</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: #007bff; margin: 0 0 20px 0; text-align: center;">🎫 Ticket${quantity > 1 ? "s" : ""} Confirmation</h1>
        <h2 style="color: #333; margin: 0 0 20px 0;">${eventName}</h2>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>📝 Description:</strong> ${eventDescription}</p>
          <p style="margin: 0;"><strong>🎟️ Tickets:</strong> ${quantity}</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #333; margin: 0 0 20px 0;">Your Ticket${quantity > 1 ? "s" : ""}</h3>
        ${ticketLinks}
      </div>

      <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h4 style="margin: 0 0 15px 0; color: #333;">Important Information:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin: 5px 0;">Please save this email and keep your ticket links safe</li>
          <li style="margin: 5px 0;">Present your ticket QR code at the event entrance</li>
          <li style="margin: 5px 0;">Each ticket is valid for one person only</li>
          <li style="margin: 5px 0;">Contact us if you have any questions</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0; padding: 20px; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          Powered by <strong>Suicket</strong> - NFT Tickets on Sui Blockchain
        </p>
      </div>
    </body>
    </html>
  `;
};

const generateTicketEmailText = (data) => {
  const { eventName, eventDescription, ticketUrls, quantity } = data;

  const ticketLinks = ticketUrls
    .map((url, index) => `Ticket ${index + 1}: ${url}`)
    .join("\n");

  return `
🎫 TICKET${quantity > 1 ? "S" : ""} CONFIRMATION

Event: ${eventName}
Description: ${eventDescription}
Tickets: ${quantity}

YOUR TICKET${quantity > 1 ? "S" : ""}:
${ticketLinks}

IMPORTANT INFORMATION:
- Please save this email and keep your ticket links safe
- Present your ticket QR code at the event entrance
- Each ticket is valid for one person only
- Contact us if you have any questions

Powered by Suicket - NFT Tickets on Sui Blockchain
  `.trim();
};

// Routes
app.post("/api/send-ticket-email", async (req, res) => {
  try {
    const {
      eventName,
      eventDescription,
      ticketUrls,
      recipientEmail,
      quantity,
    } = req.body;

    if (
      !eventName ||
      !recipientEmail ||
      !ticketUrls ||
      !Array.isArray(ticketUrls)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const msg = {
      to: recipientEmail,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@suicket.com",
      subject: `Your ${eventName} Ticket${quantity > 1 ? "s" : ""} - Confirmation`,
      html: generateTicketEmailHTML({
        eventName,
        eventDescription: eventDescription || "",
        ticketUrls,
        quantity: quantity || 1,
      }),
      text: generateTicketEmailText({
        eventName,
        eventDescription: eventDescription || "",
        ticketUrls,
        quantity: quantity || 1,
      }),
    };

    await sgMail.send(msg);

    console.log(
      `✅ Email sent successfully to ${recipientEmail} for ${eventName}`,
    );
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Email service is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(
    `📧 SendGrid API Key: ${process.env.SENDGRID_API_KEY ? "✅ Set" : "❌ Missing"}`,
  );
  console.log(
    `📧 From Email: ${process.env.SENDGRID_FROM_EMAIL || "noreply@suicket.com"}`,
  );
});
