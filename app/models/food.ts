import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { FoodCategory } from '../types/menu.js'

/** Food model representing nutritional data for food items */
export default class Food extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare category: FoodCategory

  @column({ columnName: 'calories_per_100g' })
  declare caloriesPer100g: number

  @column({ columnName: 'protein_per_100g' })
  declare proteinPer100g: number

  @column({ columnName: 'carbs_per_100g' })
  declare carbsPer100g: number

  @column({ columnName: 'fat_per_100g' })
  declare fatPer100g: number

  @column({ columnName: 'fiber_per_100g' })
  declare fiberPer100g: number | null

  @column()
  declare tags: string[]

  @column({ columnName: 'default_serving_grams' })
  declare defaultServingGrams: number

  @column({ columnName: 'density_factor' })
  declare densityFactor: number | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
