import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PasswordResetToken extends BaseModel {
  static table = 'password_reset_tokens'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare token: string

  @column.dateTime({ columnName: 'expires_at' })
  declare expiresAt: DateTime

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  /**
   * Check if token is expired
   */
  get isExpired(): boolean {
    return this.expiresAt < DateTime.now()
  }
}
