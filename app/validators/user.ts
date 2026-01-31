import vine from '@vinejs/vine'

/**
 * User validator (update)
 * - Age between 0 and 120
 * - Gender must be MALE, FEMALE or OTHER
 * - Height must be between 50 and 250
 * - Weight must be betwwen 20 and 400
 * - DietaryRestrictions must be a value in a defined string array
 */
export const userUpdateValidator = vine.compile(
  vine.object({
    age: vine.number().min(0).max(120).optional(),
    gender: vine.enum(['male', 'female', 'other']).optional(),
    height: vine.number().min(50).max(250).optional(),
    weight: vine.number().min(20).max(400).optional(),
    goal: vine.enum(['loss', 'maintenance', 'gain']).optional(),

    dietaryRestrictions: vine
      .array(vine.enum(['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'halal', 'kosher']))
      .optional(),

    likedFood: vine.array(vine.string()).minLength(0).optional(),
    unlikedFood: vine.array(vine.string()).minLength(0).optional(),
  })
)
