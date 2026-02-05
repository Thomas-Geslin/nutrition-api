import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menu_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()

      table
        .integer('menu_id')
        .unsigned()
        .references('id')
        .inTable('menus')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('food_id')
        .unsigned()
        .references('id')
        .inTable('foods')
        .onDelete('RESTRICT')
        .notNullable()

      table.decimal('grams', 6, 2).notNullable()
      table
        .enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack'])
        .notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
