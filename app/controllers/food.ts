import { HttpContext } from '@adonisjs/core/http'
import Food from '#models/food'

export default class FoodController {
  /**
   * Get all food items
   * GET /foods
   */
  async getAllFoods({  response }: HttpContext) {
    try {
      const foods = await Food.all()

      return response.ok({
        foods,
      })
    } catch (error) {
     
      return response.internalServerError({
        error: 'Failed to fetch foods. Please try again.',
      })
    }
  }
}
