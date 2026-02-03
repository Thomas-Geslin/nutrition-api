import vine from '@vinejs/vine'

/**
 * Onboarding validator
 * - Age between 0 and 120
 * - Gender must be MALE, FEMALE or OTHER
 * - Height must be between 50 and 250
 * - Weight must be betwwen 20 and 400
 * - activityLevel must be a value in a defined string array
 * - DietaryRestrictions must be a value in a defined string array
 * - Goal must be LOSS, MAINTENANCE or GAIN
 * - FoodPreferences must be an array of objects containing an ID and a type
 */
export const onboardingValidator = vine.compile(
  vine.object({
    profile: vine.object({
      age: vine.number().min(0).max(120),
      gender: vine.enum(['male', 'female', 'other']),
      height: vine.number().min(50).max(250),
      weight: vine.number().min(20).max(400),
      activityLevel: vine.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
      dietaryRestrictions: vine.array(
        vine.enum(['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'halal', 'kosher'])
      ),
    }),

    goal: vine.enum(['loss', 'maintenance', 'gain']),

    foodPreferences: vine
      .array(
        vine.object({
          foodId: vine
            .string()
            .minLength(1) /** TODO: MinLength WILL NEED TO BE CHANGED WHEN foodId IS A UUID */,
          type: vine.enum(['INCLUDE', 'EXCLUDE']).nullable(),
        })
      )
      .minLength(0),
  })
)
