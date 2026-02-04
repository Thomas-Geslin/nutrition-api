import { userUpdateValidator } from '#validators/user'
import { HttpContext } from '@adonisjs/core/http'
import UserNutritionProfile from '#models/user_nutrition_profile'
import UserFoodPreference from '#models/user_food_preferences'
import NutritionCalculator from '#services/nutrition_calculator'
import { ActivityLevel, Gender, Goal } from '../types/nutritionProfile.js'

export default class UserController {
  /**
   * PATCH /user/update
   * Update an existing user and return the updated object
   */
  async updateUser({ auth, request, response }: HttpContext) {
    await auth.authenticate()
    const user = auth.user!

    try {
      const data = await request.validateUsing(userUpdateValidator)
      const { nutritionProfile, foodPreferences } = data

      /** --- Update Nutrition Profile --- */
      if (nutritionProfile) {
        const existingProfile = await UserNutritionProfile.findBy('userId', user.id)

        if (!existingProfile) {
          return response.internalServerError({
            message: 'An error occurred during user update',
          })
        }

        // Merge existing profile with new values
        const updatedProfile = {
          ...existingProfile.toJSON(),
          ...nutritionProfile,
        }
        // Recalculate nutrition metrics
        const metrics = NutritionCalculator.calculateAll({
          gender: updatedProfile.gender as Gender,
          age: updatedProfile.age as number,
          weight: updatedProfile.weight as number,
          height: updatedProfile.height as number,
          activityLevel: updatedProfile.activityLevel as ActivityLevel,
          goal: updatedProfile.goal as Goal,
        })

        existingProfile.merge({
          ...updatedProfile,
          ...metrics,
        })

        await existingProfile.save()
      }
      /** --- Update Food Preferences --- */
      if (foodPreferences) {
        // Clear existing preferences
        await UserFoodPreference.query().where('userId', user.id).delete()

        // Create new preferences
        if (foodPreferences.length > 0) {
          const prefs = foodPreferences.map((fp) => ({
            userId: user.id,
            foodName: fp.foodName,
            liked: fp.liked,
          }))
          await UserFoodPreference.createMany(prefs)
        }
      }

      /** --- Load relations for response --- */
      await user.refresh()
      await user.load('nutritionProfile')
      await user.load('foodPreferences')

      return response.ok({
        message: 'User updated successfully',
        user,
      })
    } catch (err) {
      if (err.code === 'E_VALIDATION_ERROR') {
        return response.badRequest({
          message: 'User update failed',
          errors: err.messages,
        })
      }

      return response.internalServerError({
        message: 'An error occurred during user update',
        error: err.message,
      })
    }
  }
}
