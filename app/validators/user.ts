import vine from '@vinejs/vine'

/**
 * User validator (update)
 * - Age between 0 and 120
 * - Gender must be MALE, FEMALE or OTHER
 * - Height must be between 50 and 250
 * - Weight must be betwwen 20 and 400
 * - DietaryRestrictions must be a value in a defined string array
 * - FoodPreferences must be an array of type UserFoodPreferences
 */
export const userUpdateValidator = vine.compile(
  vine.object({
    nutritionProfile: vine
      .object({
        age: vine.number().min(0).max(120).optional(),
        gender: vine.enum(['male', 'female']).optional(),
        height: vine.number().min(50).max(250).optional(),
        weight: vine.number().min(20).max(400).optional(),
        activityLevel: vine
          .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
          .optional(),
        goal: vine.enum(['cut', 'maintain', 'bulk']).optional(),

        dietaryRestrictions: vine
          .array(
            vine.enum(['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'halal', 'kosher'])
          )
          .optional(),
      })
      .optional(),

    foodPreferences: vine
      .array(
        vine.object({
          foodName: vine.string(),
          liked: vine.boolean(),
        })
      )
      .minLength(0)
      .optional(),
  })
)
