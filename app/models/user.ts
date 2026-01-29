import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'full_name' })
  declare fullName: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare age: number | null

  @column()
  declare gender: string | null

  @column()
  declare height: number | null

  @column()
  declare weight: number | null

  @column({ columnName: 'dietary_restrictions' })
  declare dietaryRestrictions: string[]

  @column()
  declare goal: string | null

  @column({ columnName: 'liked_food' })
  declare likedFood: string[]

  @column({ columnName: 'unliked_food' })
  declare unlikedFood: string[]

  @column({ columnName: 'onboarding_completed' })
  declare onboardingCompleted: boolean

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
