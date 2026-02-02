import { BaseMail } from '@adonisjs/mail'

export default class PasswordResetNotification extends BaseMail {
  subject = 'Password reset'

  constructor(
    private email: string,
    private resetUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.email)
    this.message.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4F46E5;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>

        <body>
          <div class="container">
            <h2>Password Reset</h2>

            <p>You have requested to reset your password.</p>

            <p>Click the button below to set a new password:</p>

            <a href="${this.resetUrl}" class="button">Reset My Password</a>

            <p>This link will expire in <strong>10 minutes</strong>.</p>

            <p>If you did not request this reset, simply ignore this email.</p>
            
            <div class="footer">
              <p>If the button does not work, copy this link into your browser:</p>
              <p>${this.resetUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `)
  }
}
