import type Food from '#models/food'

// ==============================
// MEAL
// ==============================
export interface Meal {
  type: MealType
  items: MealItem[]
  totals: MacroTargets
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealItem {
  food: Food
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

// ==============================
// MENU
// ==============================
export interface GeneratedMenu {
  id: number;
  date: string
  meals: Meal[]
  totals: MacroTargets
}

export interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
}

// ==============================
// UTILS
// ==============================
/** Food categories for nutritional classification */
export type FoodCategory = 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'mixed'

/** Meal distribution percentages (must sum to 1) */
export interface MealDistribution {
  breakfast: number
  lunch: number
  dinner: number
  snack: number
}

/** Categorized food lists for selection */
export interface CategorizedFoods {
  proteins: Food[]
  carbs: Food[]
  fats: Food[]
  vegetables: Food[]
  fruits: Food[]
}

/** Portion constraints for realistic meal planning */
export interface PortionConstraints {
  minGrams: number
  maxGrams: number
}

/** Default portion constraints by food category */
export const DEFAULT_PORTION_CONSTRAINTS: Record<string, PortionConstraints> = {
  protein: { minGrams: 80, maxGrams: 300 },
  carb: { minGrams: 50, maxGrams: 250 },
  fat: { minGrams: 10, maxGrams: 50 },
  vegetable: { minGrams: 80, maxGrams: 300 },
  fruit: { minGrams: 80, maxGrams: 200 },
  mixed: { minGrams: 100, maxGrams: 400 },
}

/** Meal calorie distribution (must sum to 1.0) */
export const MEAL_CALORIE_DISTRIBUTION: MealDistribution = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
}
