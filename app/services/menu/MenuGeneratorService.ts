import { DateTime } from 'luxon'
import User from '#models/user'
import Menu from '#models/menu'
import MenuItem from '#models/menu_item'
import FoodSelector from './FoodSelector.js'
import MealBuilder from './MealBuilder.js'
import MacroSolver from './MacroSolver.js'
import {
  GeneratedMenu,
  MacroTargets,
  Meal,
  MEAL_CALORIE_DISTRIBUTION,
  MealType,
} from '../../types/menu.js'

/**
 * MenuGeneratorService orchestrates the entire menu generation process.
 * It loads user data, generates meals, and persists the menu to the database.
 */
export default class MenuGeneratorService {
  private userId: number

  constructor(userId: number) {
    this.userId = userId
  }

  /**
   * Generate a menu for a specific date
   * Returns existing menu if one already exists for that date
   */
  async generateMenu(date: DateTime = DateTime.now()): Promise<GeneratedMenu> {
    // Check for existing menu
    const existing = await this.getExistingMenu(date)

    if (existing) {
      return this.formatMenuForResponse(existing)
    }

    // Load user data
    const user = await this.loadUserWithProfile()

    // Validate nutrition profile exists
    if (!user.nutritionProfile) {
      throw new Error('User nutrition profile not found. Complete onboarding first.')
    }

    // Extract macro targets from profile
    const dailyTargets = this.extractDailyTargets(user)

    if (!dailyTargets) {
      throw new Error('Unable to retrieve user daily target. Try again later.')
    }

    // Initialize food selector with preferences and restrictions
    const foodSelector = new FoodSelector(
      user.foodPreferences,
      user.nutritionProfile.dietaryRestrictions
    )

    // Get categorized foods
    const categorizedFoods = await foodSelector.getCategorizedFoods()

    // Validate we have enough foods
    this.validateFoodAvailability(categorizedFoods)

    // Build meals
    const mealBuilder = new MealBuilder(foodSelector, categorizedFoods)
    const meals = this.buildAllMeals(mealBuilder, dailyTargets)

    // Calculate totals
    const totals = this.calculateDayTotals(meals)

    // Save to database
    const menu = await this.saveMenu(date, meals, totals)

    return this.formatMenuForResponse(menu)
  }

  /**
   * Check if a menu already exists for the given date
   */
  private async getExistingMenu(date: DateTime): Promise<Menu | null> {
    const isoDate = date.toISODate()
    if (!isoDate) return null

    return Menu.query()
      .where('user_id', this.userId)
      .whereRaw('DATE(date) = ?', [isoDate])
      .preload('menuItems', (query) => {
        query.preload('food')
      })
      .first()
  }

  /**
   * Load user with nutrition profile and food preferences
   */
  private async loadUserWithProfile(): Promise<User> {
    const user = await User.query()
      .where('id', this.userId)
      .preload('nutritionProfile')
      .preload('foodPreferences')
      .firstOrFail()

    return user
  }

  /**
   * Extract daily macro targets from user's nutrition profile
   */
  private extractDailyTargets(user: User): MacroTargets | null {
    const profile = user.nutritionProfile

    if (
      !profile.dailyCaloriesConsumption ||
      !profile.proteinIntake ||
      !profile.carbsIntake ||
      !profile.fatIntake
    )
      return null

    return {
      calories: profile.dailyCaloriesConsumption,
      protein: profile.proteinIntake,
      carbs: profile.carbsIntake,
      fat: profile.fatIntake,
    }
  }

  /**
   * Validate that we have enough foods in each category to build meals
   */
  private validateFoodAvailability(categorizedFoods: {
    proteins: unknown[]
    carbs: unknown[]
    vegetables: unknown[]
    fruits: unknown[]
  }): void {
    if (categorizedFoods.proteins.length === 0) {
      throw new Error('No protein foods available matching your preferences')
    }
    if (categorizedFoods.carbs.length === 0) {
      throw new Error('No carb foods available matching your preferences')
    }
    if (categorizedFoods.vegetables.length === 0 && categorizedFoods.fruits.length === 0) {
      throw new Error('No vegetables or fruits available matching your preferences')
    }
  }

  /**
   * Build all meals for the day
   */
  private buildAllMeals(mealBuilder: MealBuilder, dailyTargets: MacroTargets): Meal[] {
    const meals: Meal[] = []
    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

    for (const mealType of mealTypes) {
      const distribution = MEAL_CALORIE_DISTRIBUTION[mealType]

      const mealTargets: MacroTargets = {
        calories: dailyTargets.calories * distribution,
        protein: dailyTargets.protein * distribution,
        carbs: dailyTargets.carbs * distribution,
        fat: dailyTargets.fat * distribution,
      }

      const meal = mealBuilder.buildMeal(mealType, mealTargets)
      meals.push(meal)
    }

    return meals
  }

  /**
   * Calculate total macros for the entire day
   */
  private calculateDayTotals(meals: Meal[]): MacroTargets {
    const allItems = meals.flatMap((m) => m.items)
    return MacroSolver.sumMacros(allItems)
  }

  /**
   * Save the generated menu to the database
   */
  private async saveMenu(date: DateTime, meals: Meal[], totals: MacroTargets): Promise<Menu> {
    // Create menu record
    const menu = await Menu.create({
      userId: this.userId,
      date,
      totalCalories: totals.calories,
      proteinTotal: totals.protein,
      carbsTotal: totals.carbs,
      fatTotal: totals.fat,
    })

    // Create menu items
    const menuItemsData: Partial<MenuItem>[] = []

    for (const meal of meals) {
      for (const item of meal.items) {
        menuItemsData.push({
          menuId: menu.id,
          foodId: item.food.id,
          grams: item.grams,
          mealType: meal.type,
        })
      }
    }

    await MenuItem.createMany(menuItemsData)

    // Reload with relations
    await menu.load('menuItems', (query) => {
      query.preload('food')
    })

    return menu
  }

  /**
   * Format menu data for API response
   */
  private formatMenuForResponse(menu: Menu): GeneratedMenu {
    // Group menu items by meal type
    const mealsByType: Record<MealType, Meal> = {
      breakfast: {
        type: 'breakfast',
        items: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      },
      lunch: { type: 'lunch', items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      dinner: { type: 'dinner', items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      snack: { type: 'snack', items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
    }

    for (const item of menu.menuItems) {
      const mealItem = MacroSolver.calculateMacros(item.food, item.grams)
      mealsByType[item.mealType].items.push(mealItem)
    }

    // Calculate meal totals
    for (const mealType of Object.keys(mealsByType) as MealType[]) {
      mealsByType[mealType].totals = MacroSolver.sumMacros(mealsByType[mealType].items)
    }

    // Convert to array, filtering out empty meals
    const meals = Object.values(mealsByType).filter((m) => m.items.length > 0)

    return {
      id: menu.id,
      date: menu.date.toISODate() || '',
      meals,
      totals: {
        calories: menu.totalCalories,
        protein: menu.proteinTotal,
        carbs: menu.carbsTotal,
        fat: menu.fatTotal,
      },
    }
  }
}
