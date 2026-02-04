import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_food_preferences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('food_name').notNullable()

      table.boolean('liked').defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'food_name']) // Create a unicity constraint to have one user unable to have more than one entry of the same food
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
