import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { MenuGeneratorService } from '#services/menu/index'
import { generateMenuValidator } from '#validators/menu'

export default class MenuController {
  /**
   * Generate a daily menu for the authenticated user
   * POST /menus/generate
   *
   * If a menu already exists for the specified date, returns the existing menu.
   * Otherwise, generates a new menu based on user's nutrition profile and preferences.
   */
  async generate({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Validate input
      const data = await request.validateUsing(generateMenuValidator)

      // Parse date or use today
      const date = data.date ? DateTime.fromISO(data.date) : DateTime.now()

      if (!date.isValid) {
        return response.badRequest({
          error: 'Invalid date format. Use YYYY-MM-DD.',
        })
      }

      // Generate menu
      const menuService = new MenuGeneratorService(user.id)
      const menu = await menuService.generateMenu(date)

      return response.ok({
        message: 'Menu generated successfully',
        menu,
      })
    } catch (error) {
      // Handle validation errors
      if (error.messages) {
        return response.badRequest({ errors: error.messages })
      }

      // Handle known errors
      if (error.message?.includes('nutrition profile not found')) {
        return response.badRequest({
          error: 'Please complete onboarding before generating menus.',
        })
      }

      if (
        error.message?.includes('No protein foods') ||
        error.message?.includes('No carb foods') ||
        error.message?.includes('No vegetables')
      ) {
        return response.badRequest({
          error: error.message,
        })
      }

      // Log unexpected errors
      console.error('Menu generation error:', error)
      return response.internalServerError({
        error: 'Failed to generate menu. Please try again.',
      })
    }
  }
}
