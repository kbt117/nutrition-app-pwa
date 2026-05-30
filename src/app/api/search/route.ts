import { NextRequest } from "next/server";
import { db } from "@/db";
import { searchHistory } from "@/db/schema";

const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";
const API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return Response.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${USDA_API_BASE}/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(query)}&pageSize=20&dataType=Foundation,SR%20Legacy`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("USDA API error:", response.status, errorText);
      return Response.json(
        { error: "Failed to fetch nutrition data from USDA" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Log search to history
    try {
      await db.insert(searchHistory).values({
        query: query.trim(),
        resultCount: data.totalHits || 0,
      });
    } catch (dbError) {
      console.error("Failed to log search history:", dbError);
    }

    // Transform the response to a cleaner format
    const foods = (data.foods || []).map(
      (food: Record<string, unknown>) => {
        const nutrients: Record<string, unknown>[] =
          (food.foodNutrients as Record<string, unknown>[]) || [];

        const getNutrient = (name: string): number | null => {
          const n = nutrients.find(
            (nutrient) => (nutrient.nutrientName as string) === name
          );
          return n ? (n.value as number) : null;
        };

        return {
          fdcId: food.fdcId,
          description: food.description,
          dataType: food.dataType,
          brandOwner: food.brandOwner || null,
          brandName: food.brandName || null,
          ingredients: food.ingredients || null,
          foodCategory: food.foodCategory || null,
          servingSize: food.servingSize || null,
          servingSizeUnit: food.servingSizeUnit || null,
          householdServingFullText: food.householdServingFullText || null,
          score: food.score || null,
          nutrients: {
            calories: getNutrient("Energy"),
            protein: getNutrient("Protein"),
            totalFat: getNutrient("Total lipid (fat)"),
            saturatedFat: getNutrient("Fatty acids, total saturated"),
            transFat: getNutrient("Fatty acids, total trans"),
            monounsaturatedFat: getNutrient(
              "Fatty acids, total monounsaturated"
            ),
            polyunsaturatedFat: getNutrient(
              "Fatty acids, total polyunsaturated"
            ),
            cholesterol: getNutrient("Cholesterol"),
            carbohydrates: getNutrient("Carbohydrate, by difference"),
            fiber: getNutrient("Fiber, total dietary"),
            sugar: getNutrient("Sugars, total including NLEA"),
            sodium: getNutrient("Sodium, Na"),
            potassium: getNutrient("Potassium, K"),
            calcium: getNutrient("Calcium, Ca"),
            iron: getNutrient("Iron, Fe"),
            vitaminA: getNutrient("Vitamin A, RAE"),
            vitaminC: getNutrient("Vitamin C, total ascorbic acid"),
            vitaminD: getNutrient("Vitamin D (D2 + D3)"),
            vitaminB6: getNutrient("Vitamin B-6"),
            vitaminB12: getNutrient("Vitamin B-12"),
            magnesium: getNutrient("Magnesium, Mg"),
            zinc: getNutrient("Zinc, Zn"),
            water: getNutrient("Water"),
          },
        };
      }
    );

    return Response.json({
      query,
      totalHits: data.totalHits || 0,
      foods,
    });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json(
      { error: "Internal server error while searching for food" },
      { status: 500 }
    );
  }
}
import { NextRequest } from "next/server";
import { getDb } from "@/db";
import { searchHistory } from "@/db/schema";

const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";
const API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return Response.json({ error: "Search query is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${USDA_API_BASE}/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(query)}&pageSize=20&dataType=Foundation,SR%20Legacy`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("USDA API error:", response.status, errorText);
      return Response.json(
        { error: "Failed to fetch nutrition data from USDA" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Log search to history
    try {
      const db = getDb();
      await db.insert(searchHistory).values({
        query: query.trim(),
        resultCount: data.totalHits || 0,
      });
    } catch (dbError) {
      console.error("Failed to log search history:", dbError);
      // Don't fail the request if logging fails
    }

    // Transform the response to a cleaner format
    const foods = (data.foods || []).map((food: Record<string, unknown>) => {
      const nutrients: Record<string, unknown>[] = (food.foodNutrients as Record<string, unknown>[]) || [];

      const getNutrient = (name: string): number | null => {
        const n = nutrients.find(
          (nutrient) => (nutrient.nutrientName as string) === name
        );
        return n ? (n.value as number) : null;
      };

      return {
        fdcId: food.fdcId,
        description: food.description,
        dataType: food.dataType,
        brandOwner: food.brandOwner || null,
        brandName: food.brandName || null,
        ingredients: food.ingredients || null,
        foodCategory: food.foodCategory || null,
        score: food.score || null,
        nutrients: {
          calories: getNutrient("Energy"),
          protein: getNutrient("Protein"),
          totalFat: getNutrient("Total lipid (fat)"),
          saturatedFat: getNutrient("Fatty acids, total saturated"),
          transFat: getNutrient("Fatty acids, total trans"),
          monounsaturatedFat: getNutrient("Fatty acids, total monounsaturated"),
          polyunsaturatedFat: getNutrient("Fatty acids, total polyunsaturated"),
          cholesterol: getNutrient("Cholesterol"),
          carbohydrates: getNutrient("Carbohydrate, by difference"),
          fiber: getNutrient("Fiber, total dietary"),
          sugar: getNutrient("Sugars, total including NLEA"),
          sodium: getNutrient("Sodium, Na"),
          potassium: getNutrient("Potassium, K"),
          calcium: getNutrient("Calcium, Ca"),
          iron: getNutrient("Iron, Fe"),
          vitaminA: getNutrient("Vitamin A, RAE"),
          vitaminC: getNutrient("Vitamin C, total ascorbic acid"),
          vitaminD: getNutrient("Vitamin D (D2 + D3)"),
          vitaminB6: getNutrient("Vitamin B-6"),
          vitaminB12: getNutrient("Vitamin B-12"),
          magnesium: getNutrient("Magnesium, Mg"),
          zinc: getNutrient("Zinc, Zn"),
          water: getNutrient("Water"),
        },
      };
    });

    return Response.json({
      query,
      totalHits: data.totalHits || 0,
      foods,
    });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json(
      { error: "Internal server error while searching for food" },
      { status: 500 }
    );
  }
}
