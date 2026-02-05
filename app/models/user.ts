import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasOne, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import type { HasOne, HasMany } from '@adonisjs/lucid/types/relations'

import UserNutritionProfile from '#models/user_nutrition_profile'
import UserFoodPreference from '#models/user_food_preferences'
import Menu from '#models/menu'

/** Basic USER class for auth and identity */
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

  @column({ columnName: 'google_id' })
  declare googleId: string | null

  @column({ columnName: 'onboarding_completed' })
  declare onboardingCompleted: boolean

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relations
  @hasOne(() => UserNutritionProfile)
  declare nutritionProfile: HasOne<typeof UserNutritionProfile>

  @hasMany(() => UserFoodPreference)
  declare foodPreferences: HasMany<typeof UserFoodPreference>

  @hasMany(() => Menu)
  declare menus: HasMany<typeof Menu>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
