import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import MenuItem from '#models/menu_item'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

/** Menu model representing a user's daily meal plan */
export default class Menu extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column.date()
  declare date: DateTime

  @column({ columnName: 'total_calories' })
  declare totalCalories: number

  @column({ columnName: 'protein_total' })
  declare proteinTotal: number

  @column({ columnName: 'carbs_total' })
  declare carbsTotal: number

  @column({ columnName: 'fat_total' })
  declare fatTotal: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => MenuItem)
  declare menuItems: HasMany<typeof MenuItem>

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
