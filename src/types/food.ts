export interface FoodNutrients {
  calories: number | null;
  protein: number | null;
  totalFat: number | null;
  saturatedFat: number | null;
  transFat: number | null;
  monounsaturatedFat: number | null;
  polyunsaturatedFat: number | null;
  cholesterol: number | null;
  carbohydrates: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  potassium: number | null;
  calcium: number | null;
  iron: number | null;
  vitaminA: number | null;
  vitaminC: number | null;
  vitaminD: number | null;
  vitaminB6: number | null;
  vitaminB12: number | null;
  magnesium: number | null;
  zinc: number | null;
  water: number | null;
}

export interface FoodPortion {
  id: number;
  gramWeight: number;
  amount: number;
  modifier: string;
  description: string;
}

export interface FoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner: string | null;
  brandName: string | null;
  ingredients: string | null;
  foodCategory: string | null;
  servingSize: number | null;
  servingSizeUnit: string | null;
  householdServingFullText: string | null;
  score: number | null;
  nutrients: FoodNutrients;
}

export interface FoodDetail {
  fdcId: number;
  description: string;
  dataType: string;
  portions: FoodPortion[];
  servingSize: number | null;
  servingSizeUnit: string | null;
  householdServingFullText: string | null;
}

export interface SearchResults {
  query: string;
  totalHits: number;
  foods: FoodItem[];
}

// FDA Daily Values (based on 2,000 calorie diet)
// https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrient-nutrition-and-supplement-facts-labels
export const DAILY_VALUES: Record<string, { value: number; unit: string }> = {
  calories: { value: 2000, unit: "kcal" },
  totalFat: { value: 78, unit: "g" },
  saturatedFat: { value: 20, unit: "g" },
  transFat: { value: 0, unit: "g" }, // no DV established
  cholesterol: { value: 300, unit: "mg" },
  sodium: { value: 2300, unit: "mg" },
  carbohydrates: { value: 275, unit: "g" },
  fiber: { value: 28, unit: "g" },
  sugar: { value: 50, unit: "g" },
  protein: { value: 50, unit: "g" },
  vitaminA: { value: 900, unit: "mcg" },
  vitaminC: { value: 90, unit: "mg" },
  vitaminD: { value: 20, unit: "mcg" },
  vitaminB6: { value: 1.7, unit: "mg" },
  vitaminB12: { value: 2.4, unit: "mcg" },
  calcium: { value: 1300, unit: "mg" },
  iron: { value: 18, unit: "mg" },
  potassium: { value: 4700, unit: "mg" },
  magnesium: { value: 420, unit: "mg" },
  zinc: { value: 11, unit: "mg" },
};
