import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { parseCsv } from "../../common/utils/env.util";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  private get fromAddress() {
    return this.configService.get<string>("EMAIL_FROM", "FINASTRA <onboarding@resend.dev>");
  }

  private get replyToAddress() {
    return this.configService.get<string>("EMAIL_REPLY_TO") || undefined;
  }

  private get adminRecipients() {
    return parseCsv(this.configService.get<string>("ADMIN_ALERT_EMAILS"));
  }

  private async send(to: string[], subject: string, html: string) {
    if (!this.resend || to.length === 0) {
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
        replyTo: this.replyToAddress
      });
    } catch (error) {
      this.logger.warn(
        `Email send failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async sendRegistrationConfirmation(options: {
    to: string;
    recipientName: string;
    title: string;
    body: string;
  }) {
    await this.send(
      [options.to],
      options.title,
      `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>${options.title}</h2>
        <p>Hello ${options.recipientName},</p>
        <p>${options.body}</p>
        <p>Your submission is now in the FINASTRA workflow.</p>
      </div>`
    );
  }

  async sendAdminAlert(subject: string, summary: string) {
    await this.send(
      this.adminRecipients,
      subject,
      `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>${subject}</h2>
        <p>${summary}</p>
      </div>`
    );
  }
}
