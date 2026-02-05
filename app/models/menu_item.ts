import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Menu from '#models/menu'
import Food from '#models/food'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import type { MealType } from '../types/menu.js'

/** MenuItem model representing a single food item in a menu */
export default class MenuItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'menu_id' })
  declare menuId: number

  @column({ columnName: 'food_id' })
  declare foodId: number

  @column()
  declare grams: number

  @column({ columnName: 'meal_type' })
  declare mealType: MealType

  @belongsTo(() => Menu)
  declare menu: BelongsTo<typeof Menu>

  @belongsTo(() => Food)
  declare food: BelongsTo<typeof Food>

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
