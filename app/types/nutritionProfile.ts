export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Goal = 'cut' | 'maintain' | 'bulk'

export interface NutritionProfileInput {
  gender: Gender | null
  age: number
  weight: number
  height: number
  activityLevel: ActivityLevel
  goal: Goal
}

export interface NutritionMetrics {
  bmr: number
  tdee: number
  dailyCaloriesConsumption: number
  proteinIntake: number
  carbsIntake: number
  fatIntake: number
}
