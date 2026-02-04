import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_nutrition_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .unique()

      table.integer('age').notNullable()
      table.string('gender').notNullable()

      table.integer('height').notNullable()
      table.integer('weight').notNullable()

      table.string('activity_level').notNullable()
      table.string('goal').notNullable()
      table.specificType('dietary_restrictions', 'text[]').nullable().defaultTo('{}')

      table.integer('bmr').notNullable()
      table.integer('tdee').notNullable()
      table.integer('daily_calories_consumption').notNullable()

      table.integer('protein_intake').notNullable()
      table.integer('carbs_intake').notNullable()
      table.integer('fat_intake').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
