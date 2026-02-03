import { onboardingValidator } from '#validators/onboarding'
import { HttpContext } from '@adonisjs/core/http'

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

      // Separate liked & unliked foods
      const likedFood = foodPreferences
        .filter((food) => food.type === 'INCLUDE')
        .map((food) => food.foodId)

      const unlikedFood = foodPreferences
        .filter((food) => food.type === 'EXCLUDE')
        .map((food) => food.foodId)

      await user
        .merge({
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          activityLevel: profile.activityLevel,
          dietaryRestrictions: profile.dietaryRestrictions,
          goal,
          likedFood,
          unlikedFood,
          onboardingCompleted: true,
        })
        .save()

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
