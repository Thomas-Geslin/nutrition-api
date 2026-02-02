import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes, createHash } from 'crypto'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import PasswordResetNotification from '#mails/password_reset_notification'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/auth'
import env from '#start/env'

const FRONTEND_URL = env.get('FRONTEND_URL', 'http://localhost:3000')
const TOKEN_EXPIRATION_MINUTES = 10

export default class PasswordResetController {
  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * Hash token for secure storage in database
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  /**
   * POST /auth/forgot-password
   * Send password reset email if user exists
   */
  async forgotPassword({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(forgotPasswordValidator)

      // Always return success to prevent email enumeration
      const successResponse = {
        message: 'If a user with this email exist, a reset link has been sent.',
      }

      // Check if user exists
      const user = await User.findBy('email', email)
      if (!user) {
        return response.ok(successResponse)
      }

      // Delete any existing tokens for this email
      await PasswordResetToken.query().where('email', email).delete()

      // Generate new token
      const token = this.generateToken()
      const hashedToken = this.hashToken(token)

      // Store hashed token in database
      await PasswordResetToken.create({
        email,
        token: hashedToken,
        expiresAt: DateTime.now().plus({ minutes: TOKEN_EXPIRATION_MINUTES }),
      })

      // Build reset URL with plain token
      const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

      // Send email
      await mail.send(new PasswordResetNotification(email, resetUrl))

      return response.ok(successResponse)
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Validation failed',
          errors: error.messages,
        })
      }
      throw error
    }
  }

  /**
   * POST /auth/reset-password
   * Reset password with valid token
   */
  async resetPassword({ request, response }: HttpContext) {
    try {
      const { token, email, password } = await request.validateUsing(resetPasswordValidator)

      // Hash the provided token to compare with stored hash
      const hashedToken = this.hashToken(token)

      // Find token record
      const tokenRecord = await PasswordResetToken.query()
        .where('email', email)
        .where('token', hashedToken)
        .first()

      if (!tokenRecord) {
        return response.badRequest({
          message: 'Invalid or expired link.',
        })
      }

      // Check if token is expired
      if (tokenRecord.isExpired) {
        await tokenRecord.delete()
        return response.badRequest({
          message: 'Invalid or expired link.',
        })
      }

      // Find user and update password
      const user = await User.findBy('email', email)
      if (!user) {
        return response.badRequest({
          message: 'Invalid or expired link.',
        })
      }

      // Update password (will be automatically hashed by AuthFinder)
      user.password = password
      await user.save()

      // Delete the used token
      await tokenRecord.delete()

      // Revoke all existing access tokens for security
      await User.accessTokens.all(user).then((tokens) => {
        return Promise.all(tokens.map((t) => User.accessTokens.delete(user, t.identifier)))
      })

      return response.ok({
        message: 'Password reset successfully. You can know log into your account.',
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Validation failed',
          errors: error.messages,
        })
      }
      throw error
    }
  }
}
