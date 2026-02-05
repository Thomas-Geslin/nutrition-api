import Food from '#models/food'
import type UserFoodPreference from '#models/user_food_preferences'
import { CategorizedFoods } from '../../types/menu.js'

/**
 * FoodSelector handles food selection logic based on user preferences
 * and dietary restrictions. It filters and prioritizes foods appropriately.
 */
export default class FoodSelector {
  private likedFoods: Set<string>
  private dislikedFoods: Set<string>
  private dietaryRestrictions: string[]
  private usedFoodIds: Set<number>

  constructor(
    preferences: UserFoodPreference[],
    dietaryRestrictions: string[] = []
  ) {
    this.likedFoods = new Set(
      preferences.filter((p) => p.liked).map((p) => p.foodName.toLowerCase())
    )
    this.dislikedFoods = new Set(
      preferences.filter((p) => !p.liked).map((p) => p.foodName.toLowerCase())
    )
    this.dietaryRestrictions = dietaryRestrictions.map((r) => r.toLowerCase())
    this.usedFoodIds = new Set()
  }

  /**
   * Get all available foods from database and filter/categorize them
   */
  async getCategorizedFoods(): Promise<CategorizedFoods> {
    const allFoods = await Food.all()
    const filtered = this.filterFoods(allFoods)
    return this.categorizeFoods(filtered)
  }

  /**
   * Filter foods based on preferences and dietary restrictions
   */
  private filterFoods(foods: Food[]): Food[] {
    return foods.filter((food) => {
      const foodNameLower = food.name.toLowerCase()

      // Exclude explicitly disliked foods
      if (this.dislikedFoods.has(foodNameLower)) {
        return false
      }

      // Check dietary restrictions against food tags
      if (!this.meetsRestrictions(food.tags)) {
        return false
      }

      return true
    })
  }

  /**
   * Check if food meets dietary restrictions
   * Restrictions are tags that must be present (e.g., 'vegan', 'gluten-free')
   */
  private meetsRestrictions(tags: string[]): boolean {
    if (this.dietaryRestrictions.length === 0) return true

    const tagsLower = tags.map((t) => t.toLowerCase())

    for (const restriction of this.dietaryRestrictions) {
      // Map common restriction names to expected tags
      const requiredTag = this.mapRestrictionToTag(restriction)
      if (!tagsLower.includes(requiredTag)) {
        return false
      }
    }
    return true
  }

  /**
   * Map dietary restriction names to food tags
   */
  private mapRestrictionToTag(restriction: string): string {
    const mappings: Record<string, string> = {
      vegan: 'vegan',
      vegetarian: 'vegetarian',
      'gluten-free': 'gluten-free',
      'dairy-free': 'dairy-free',
      halal: 'halal',
      kosher: 'kosher',
      'nut-free': 'nut-free',
    }
    return mappings[restriction] || restriction
  }

  /**
   * Categorize filtered foods by their category
   */
  private categorizeFoods(foods: Food[]): CategorizedFoods {
    const categorized: CategorizedFoods = {
      proteins: [],
      carbs: [],
      fats: [],
      vegetables: [],
      fruits: [],
    }

    for (const food of foods) {
      switch (food.category) {
        case 'protein':
          categorized.proteins.push(food)
          break
        case 'carb':
          categorized.carbs.push(food)
          break
        case 'fat':
          categorized.fats.push(food)
          break
        case 'vegetable':
          categorized.vegetables.push(food)
          break
        case 'fruit':
          categorized.fruits.push(food)
          break
        case 'mixed':
          // Mixed foods can serve as carbs or proteins depending on composition
          if (food.proteinPer100g >= 10) {
            categorized.proteins.push(food)
          } else {
            categorized.carbs.push(food)
          }
          break
      }
    }

    // Sort each category: liked foods first, then alphabetically
    for (const key of Object.keys(categorized) as (keyof CategorizedFoods)[]) {
      categorized[key] = this.sortByPreference(categorized[key])
    }

    return categorized
  }

  /**
   * Sort foods prioritizing liked foods first
   */
  private sortByPreference(foods: Food[]): Food[] {
    return foods.sort((a, b) => {
      const aLiked = this.likedFoods.has(a.name.toLowerCase())
      const bLiked = this.likedFoods.has(b.name.toLowerCase())

      if (aLiked && !bLiked) return -1
      if (!aLiked && bLiked) return 1
      return a.name.localeCompare(b.name)
    })
  }

  /**
   * Select a food from a category, avoiding already used foods in this menu
   */
  selectFood(foods: Food[]): Food | null {
    for (const food of foods) {
      if (!this.usedFoodIds.has(food.id)) {
        this.usedFoodIds.add(food.id)
        return food
      }
    }
    // If all foods used, allow repeats from liked foods
    const likedAvailable = foods.filter((f) =>
      this.likedFoods.has(f.name.toLowerCase())
    )
    if (likedAvailable.length > 0) {
      return likedAvailable[0]
    }
    // Fallback to first available
    return foods.length > 0 ? foods[0] : null
  }

  /**
   * Reset used foods tracker (call when generating new menu)
   */
  resetUsedFoods(): void {
    this.usedFoodIds.clear()
  }
}
