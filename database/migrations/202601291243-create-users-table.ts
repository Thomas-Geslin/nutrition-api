import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()
      table.string('full_name').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.integer('age').nullable()
      table.string('gender').nullable()
      table.integer('height').nullable()
      table.integer('weight').nullable()
      table.specificType('dietary_restrictions', 'text[]').nullable().defaultTo('{}')
      table.string('goal').nullable()
      table.specificType('liked_food', 'text[]').nullable().defaultTo('{}')
      table.specificType('unliked_food', 'text[]').nullable().defaultTo('{}')
      table.boolean('onboarding_completed').notNullable().defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
