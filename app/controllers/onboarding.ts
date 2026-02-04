import { onboardingValidator } from '#validators/onboarding'
import { HttpContext } from '@adonisjs/core/http'
import UserNutritionProfile from '#models/user_nutrition_profile'
import UserFoodPreference from '#models/user_food_preferences'
import NutritionCalculator from '#services/nutrition_calculator'

export default class OnboardingController {
  /**
   * POST /onboarding/submit
   * Submit user onboarding
   */
  async submitOnboarding({ auth, request, response }: HttpContext) {
    await auth.authenticate() // verify that the user trying to update the onboarding infos is logged

    try {
      const user = auth.user!

      const { profile, goal, foodPreferences } = await request.validateUsing(onboardingValidator)

      // Calculate nutrition metrics
      const metrics = NutritionCalculator.calculateAll({
        ...profile,
        goal: goal,
      })

      // Create nutrition profile with calculated values
      await UserNutritionProfile.create({
        userId: user.id,
        ...profile,
        goal,
        ...metrics,
      })

      // Create foodPrefences entries
      const foodPreferencesData = foodPreferences
        .filter((food) => food.type !== null)
        .map((food) => ({
          userId: user.id,
          foodName: food.foodId,
          liked: food.type === 'INCLUDE',
        }))

      if (foodPreferencesData.length > 0) {
        await UserFoodPreference.createMany(foodPreferencesData)
      }

      // Mark onboarding as completed
      user.onboardingCompleted = true
      await user.save()

      // Load relations for response
      await user.load('nutritionProfile')
      await user.load('foodPreferences')

      return response.ok({
        message: 'Onboarding completed successfully',
        user,
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Onboarding failed',
          errors: error.messages,
        })
      }

      return response.internalServerError({
        message: 'An error occured',
        error: error.message,
      })
    }
  }
}
