import { CategorizedFoods, MacroTargets, Meal, MealItem, MealType } from '../../types/menu.js'
import type FoodSelector from './FoodSelector.js'
import MacroSolver from './MacroSolver.js'
import PortionAdjuster from './PortionAdjuster.js'

/**
 * MealBuilder constructs individual meals from available foods
 * while trying to meet macro targets for that meal.
 */
export default class MealBuilder {
  private foodSelector: FoodSelector
  private categorizedFoods: CategorizedFoods

  constructor(foodSelector: FoodSelector, categorizedFoods: CategorizedFoods) {
    this.foodSelector = foodSelector
    this.categorizedFoods = categorizedFoods
  }

  /**
   * Build a complete meal with protein, carb, vegetable/fruit, and optional fat
   */
  buildMeal(mealType: MealType, targets: MacroTargets): Meal {
    const items: MealItem[] = []

    // Select foods for the meal structure
    const proteinFood = this.foodSelector.selectFood(this.categorizedFoods.proteins)
    const carbFood = this.foodSelector.selectFood(this.categorizedFoods.carbs)
    const veggieOrFruit = this.selectVeggieOrFruit(mealType)
    const fatFood = this.shouldIncludeFat(mealType)
      ? this.foodSelector.selectFood(this.categorizedFoods.fats)
      : null

    // Calculate initial portions based on calorie distribution
    // Protein: ~35% of meal calories, Carb: ~40%, Veggie: ~15%, Fat: ~10%
    const proteinCalories = targets.calories * 0.35
    const carbCalories = targets.calories * 0.40
    const veggieCalories = targets.calories * 0.15
    const fatCalories = targets.calories * 0.10

    // Build meal items with calculated portions
    if (proteinFood) {
      const grams = MacroSolver.gramsForCalories(proteinFood, proteinCalories)
      const clampedGrams = PortionAdjuster.clampPortion(proteinFood, grams)
      items.push(MacroSolver.calculateMacros(proteinFood, clampedGrams))
    }

    if (carbFood) {
      const grams = MacroSolver.gramsForCalories(carbFood, carbCalories)
      const clampedGrams = PortionAdjuster.clampPortion(carbFood, grams)
      items.push(MacroSolver.calculateMacros(carbFood, clampedGrams))
    }

    if (veggieOrFruit) {
      const grams = MacroSolver.gramsForCalories(veggieOrFruit, veggieCalories)
      const clampedGrams = PortionAdjuster.clampPortion(veggieOrFruit, grams)
      items.push(MacroSolver.calculateMacros(veggieOrFruit, clampedGrams))
    }

    if (fatFood) {
      const grams = MacroSolver.gramsForCalories(fatFood, fatCalories)
      const clampedGrams = PortionAdjuster.clampPortion(fatFood, grams)
      items.push(MacroSolver.calculateMacros(fatFood, clampedGrams))
    }

    // Adjust portions to better hit targets
    const adjustedItems = this.adjustPortionsToTarget(items, targets)
    const totals = MacroSolver.sumMacros(adjustedItems)

    return {
      type: mealType,
      items: adjustedItems,
      totals,
    }
  }

  /**
   * Select vegetable or fruit based on meal type
   * Breakfast tends to have fruit, other meals have vegetables
   */
  private selectVeggieOrFruit(mealType: MealType) {
    if (mealType === 'breakfast' || mealType === 'snack') {
      return (
        this.foodSelector.selectFood(this.categorizedFoods.fruits) ||
        this.foodSelector.selectFood(this.categorizedFoods.vegetables)
      )
    }
    return (
      this.foodSelector.selectFood(this.categorizedFoods.vegetables) ||
      this.foodSelector.selectFood(this.categorizedFoods.fruits)
    )
  }

  /**
   * Determine if a fat source should be included
   * Skip fat for snacks to keep them lighter
   */
  private shouldIncludeFat(mealType: MealType): boolean {
    return mealType !== 'snack'
  }

  /**
   * Fine-tune portions to better match macro targets
   * Uses iterative adjustment to minimize deviation
   */
  private adjustPortionsToTarget(items: MealItem[], targets: MacroTargets): MealItem[] {
    if (items.length === 0) return items

    let currentTotals = MacroSolver.sumMacros(items)
    let adjustedItems = [...items]

    // Iteratively adjust if we're not within tolerance
    const MAX_ITERATIONS = 5
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      if (MacroSolver.isWithinTolerance(currentTotals, targets, 0.15)) {
        break
      }

      // Scale portions proportionally
      const calorieRatio = targets.calories / currentTotals.calories

      adjustedItems = adjustedItems.map((item) => {
        const newGrams = item.grams * calorieRatio
        const clampedGrams = PortionAdjuster.clampPortion(item.food, newGrams)
        return MacroSolver.calculateMacros(item.food, clampedGrams)
      })

      currentTotals = MacroSolver.sumMacros(adjustedItems)
    }

    return adjustedItems
  }
}
