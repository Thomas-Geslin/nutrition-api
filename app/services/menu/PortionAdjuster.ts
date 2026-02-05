import type Food from '#models/food'
import { PortionConstraints, DEFAULT_PORTION_CONSTRAINTS } from '../../types/menu.js'

/**
 * PortionAdjuster ensures food portions stay within realistic ranges
 * and adjusts portions to meet nutritional targets while staying practical.
 */
export default class PortionAdjuster {
  /**
   * Get portion constraints for a food based on its category
   */
  static getConstraints(food: Food): PortionConstraints {
    return DEFAULT_PORTION_CONSTRAINTS[food.category] || {
      minGrams: 50,
      maxGrams: 400,
    }
  }

  /**
   * Clamp a portion size to realistic bounds
   */
  static clampPortion(food: Food, grams: number): number {
    const constraints = this.getConstraints(food)
    const clamped = Math.max(constraints.minGrams, Math.min(constraints.maxGrams, grams))
    // Round to nearest 5g for cleaner portions
    return Math.round(clamped / 5) * 5
  }

  /**
   * Check if a portion is within realistic bounds
   */
  static isRealisticPortion(food: Food, grams: number): boolean {
    const constraints = this.getConstraints(food)
    return grams >= constraints.minGrams && grams <= constraints.maxGrams
  }

  /**
   * Adjust portions for a set of foods to meet a calorie target
   * while keeping portions realistic
   */
  static adjustPortionsForCalories(
    foods: Array<{ food: Food; baseGrams: number }>,
    targetCalories: number
  ): Array<{ food: Food; grams: number }> {
    if (foods.length === 0) return []

    // Calculate current total calories
    let currentCalories = 0
    for (const { food, baseGrams } of foods) {
      currentCalories += (food.caloriesPer100g * baseGrams) / 100
    }

    if (currentCalories === 0) return foods.map(({ food }) => ({ food, grams: 100 }))

    // Calculate scaling factor
    const scaleFactor = targetCalories / currentCalories

    // Apply scaling with constraints
    return foods.map(({ food, baseGrams }) => {
      const scaledGrams = baseGrams * scaleFactor
      const clampedGrams = this.clampPortion(food, scaledGrams)
      return { food, grams: clampedGrams }
    })
  }

  /**
   * Distribute remaining calories across foods
   * Used when we need to fill up to a target after initial portions are set
   */
  static distributeRemainingCalories(
    foods: Array<{ food: Food; grams: number }>,
    remainingCalories: number
  ): Array<{ food: Food; grams: number }> {
    if (foods.length === 0 || remainingCalories <= 0) return foods

    // Distribute evenly, prioritizing foods with room to grow
    const caloriesPerFood = remainingCalories / foods.length

    return foods.map(({ food, grams }) => {
      const additionalGrams = (caloriesPerFood / food.caloriesPer100g) * 100
      const newGrams = grams + additionalGrams
      return { food, grams: this.clampPortion(food, newGrams) }
    })
  }
}
