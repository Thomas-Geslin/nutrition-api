import type Food from '#models/food'
import { MacroTargets, MealItem } from '../../types/menu.js'

/**
 * MacroSolver calculates the macronutrient values for foods
 * based on portion sizes and helps determine optimal portions.
 */
export default class MacroSolver {
  /**
   * Calculate macros for a food at a given portion size
   */
  static calculateMacros(food: Food, grams: number): MealItem {
    const multiplier = grams / 100

    return {
      food,
      grams,
      calories: Math.round(food.caloriesPer100g * multiplier * 10) / 10,
      protein: Math.round(food.proteinPer100g * multiplier * 10) / 10,
      carbs: Math.round(food.carbsPer100g * multiplier * 10) / 10,
      fat: Math.round(food.fatPer100g * multiplier * 10) / 10,
    }
  }

  /**
   * Calculate portion size (grams) to hit a target calorie amount
   */
  static gramsForCalories(food: Food, targetCalories: number): number {
    if (food.caloriesPer100g <= 0) return 0
    return (targetCalories / food.caloriesPer100g) * 100
  }

  /**
   * Calculate portion size (grams) to hit a target protein amount
   */
  static gramsForProtein(food: Food, targetProtein: number): number {
    if (food.proteinPer100g <= 0) return 0
    return (targetProtein / food.proteinPer100g) * 100
  }

  /**
   * Sum up the totals for a list of meal items
   */
  static sumMacros(items: MealItem[]): MacroTargets {
    return items.reduce(
      (acc, item) => ({
        calories: Math.round((acc.calories + item.calories) * 10) / 10,
        protein: Math.round((acc.protein + item.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + item.carbs) * 10) / 10,
        fat: Math.round((acc.fat + item.fat) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  /**
   * Calculate the percentage difference between actual and target macros
   */
  static macroDeviation(actual: MacroTargets, target: MacroTargets): number {
    const calDiff = Math.abs(actual.calories - target.calories) / target.calories
    const protDiff = Math.abs(actual.protein - target.protein) / target.protein
    const carbDiff = Math.abs(actual.carbs - target.carbs) / target.carbs
    const fatDiff = Math.abs(actual.fat - target.fat) / target.fat

    // Weighted average: calories and protein are more important
    return calDiff * 0.4 + protDiff * 0.3 + carbDiff * 0.15 + fatDiff * 0.15
  }

  /**
   * Check if macros are within acceptable tolerance of targets
   */
  static isWithinTolerance(
    actual: MacroTargets,
    target: MacroTargets,
    tolerance: number = 0.1
  ): boolean {
    return this.macroDeviation(actual, target) <= tolerance
  }
}
