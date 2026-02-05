import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'foods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().primary()
      table.string('name').notNullable().unique()
      table
        .enum('category', ['protein', 'carb', 'fat', 'vegetable', 'fruit', 'mixed'])
        .notNullable()
      table.decimal('calories_per_100g', 6, 2).notNullable()
      table.decimal('protein_per_100g', 5, 2).notNullable()
      table.decimal('carbs_per_100g', 5, 2).notNullable()
      table.decimal('fat_per_100g', 5, 2).notNullable()
      table.decimal('fiber_per_100g', 5, 2).nullable()
      table.specificType('tags', 'text[]').nullable().defaultTo('{}')
      table.integer('default_serving_grams').notNullable().defaultTo(100)
      table.decimal('density_factor', 4, 2).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
