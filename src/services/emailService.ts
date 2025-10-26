// Email service - Frontend client for backend API
// Calls the backend email service to send emails via SendGrid

export interface TicketEmailData {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketUrls: string[];
  recipientEmail: string;
  quantity: number;
}

export class EmailService {
  private static readonly API_BASE_URL = "http://localhost:3001/api";

  /**
   * Send ticket confirmation email with QR code URLs
   * Calls the backend API which handles SendGrid integration
   */
  static async sendTicketConfirmation(data: TicketEmailData): Promise<void> {
    try {
      const {
        eventName,
        eventDate,
        eventLocation,
        ticketUrls,
        recipientEmail,
        quantity,
      } = data;

      const response = await fetch(`${this.API_BASE_URL}/send-ticket-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          eventDate,
          eventLocation,
          ticketUrls,
          recipientEmail,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }

      const result = await response.json();
      console.log("✅ Email sent successfully:", result.message);
    } catch (error) {
      console.error("Error sending ticket confirmation email:", error);

      // Fallback to console logging if backend is not available
      console.log("📧 Fallback - Ticket Information (Backend unavailable)");
      console.log("================================================");
      console.log(`To: ${data.recipientEmail}`);
      console.log(`Subject: Your ${data.eventName} Tickets - Confirmation`);
      console.log(`Event: ${data.eventName}`);
      console.log(`Date: ${data.eventDate}`);
      console.log(`Location: ${data.eventLocation}`);
      console.log(`Quantity: ${data.quantity} tickets`);
      console.log("Ticket URLs:");
      data.ticketUrls.forEach((url: string, index: number) => {
        console.log(`  Ticket ${index + 1}: ${url}`);
      });
      console.log("================================================");

      // Don't throw error to avoid breaking the transaction
      console.warn(
        "⚠️ Email service unavailable, ticket URLs logged to console",
      );
    }
  }

  /**
   * Send bulk ticket emails (for multiple recipients)
   */
  static async sendBulkTicketConfirmations(
    ticketsData: TicketEmailData[],
  ): Promise<void> {
    try {
      const promises = ticketsData.map((data) =>
        this.sendTicketConfirmation(data),
      );
      await Promise.all(promises);
      console.log(
        `Bulk ticket confirmation emails sent successfully (${ticketsData.length} emails)`,
      );
    } catch (error) {
      console.error("Error sending bulk ticket confirmation emails:", error);
      throw new Error("Failed to send bulk ticket confirmation emails");
    }
  }
}
