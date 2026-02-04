import { ActivityLevel, Gender, Goal, NutritionMetrics, NutritionProfileInput } from "../types/nutritionProfile.js"

/**
 * Activity multipliers for TDEE calculation based on standard physical activity level (PAL) values
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

/**
 * Default calorie adjustments for different goals (in kcal)
 */
const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  cut: -400,
  maintain: 0,
  bulk: 400,
}

export default class NutritionCalculator {
  /**
   * Calculate Basal Metabolic Rate using the Mifflin-St Jeor equation
   *
   * Formula:
   * - Male:   BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(years) + 5
   * - Female: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(years) - 161
   */
  static calculateBMR(gender: Gender | null, age: number, weight: number, height: number): number {
    const baseBMR = 10 * weight + 6.25 * height - 5 * age
    const adjustment = gender === 'male' ? 5 : -161
    return Math.round(baseBMR + adjustment)
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   * TDEE = BMR * Activity Multiplier
   */
  static calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]
    return Math.round((bmr * multiplier) / 100) * 100
  }

  /**
   * Calculate daily calorie target based on goal
   */
  static calculateDailyCalories(tdee: number, goal: Goal): number {
    const adjustment = GOAL_ADJUSTMENTS[goal]
    return Math.round(tdee + adjustment)
  }

  /**
   * Calculate daily macros intake from daily calories consumption
   * - Proteins: 25% of calories (4 kcal/g)
   * - Fat: 25% of calories (9 kcal/g)
   * - Carbs: 50% of calories (4 kcal/g)
   */
  static calculateMacros(dailyCalories: number): {
    proteinIntake: number
    fatIntake: number
    carbsIntake: number
  } {
    return {
      proteinIntake: Math.round((dailyCalories * 0.25) / 4),
      fatIntake: Math.round((dailyCalories * 0.25) / 9),
      carbsIntake: Math.round((dailyCalories * 0.5) / 4),
    }
  }

  /**
   * Calculate all nutrition metrics from profile data
   */
  static calculateAll(input: NutritionProfileInput): NutritionMetrics {
    const bmr = this.calculateBMR(input.gender, input.age, input.weight, input.height)
    const tdee = this.calculateTDEE(bmr, input.activityLevel)
    const dailyCaloriesConsumption = this.calculateDailyCalories(tdee, input.goal)
    const macros = this.calculateMacros(dailyCaloriesConsumption)

    return {
      bmr,
      tdee,
      dailyCaloriesConsumption,
      ...macros,
    }
  }
}
