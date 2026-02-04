import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

/** Extended USER_NUTRITION_PROFILE class for user infos used for nutritionnal calcul */
export default class UserNutritionProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number

  // Input onboarding
  @column()
  declare age: number | null

  @column()
  declare gender: 'male' | 'female' | null

  @column({ columnName: 'height' })
  declare height: number | null

  @column({ columnName: 'weight' })
  declare weight: number | null

  @column({ columnName: 'activity_level' })
  declare activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null

  @column()
  declare goal: 'cut' | 'maintain' | 'bulk' | null

  @column({ columnName: 'dietary_restrictions' })
  declare dietaryRestrictions: string[]

  @column()
  declare bmr: number | null

  @column()
  declare tdee: number | null

  @column({ columnName: 'daily_calories_consumption' })
  declare dailyCaloriesConsumption: number | null

  @column({ columnName: 'protein_intake' })
  declare proteinIntake: number | null

  @column({ columnName: 'carbs_intake' })
  declare carbsIntake: number | null

  @column({ columnName: 'fat_intake' })
  declare fatIntake: number | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
