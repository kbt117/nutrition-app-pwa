"use client";

import { useState, useCallback } from "react";

interface FoodNutrients {
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

interface FoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner: string | null;
  brandName: string | null;
  ingredients: string | null;
  foodCategory: string | null;
  score: number | null;
  nutrients: FoodNutrients;
}

interface SearchResponse {
  query: string;
  totalHits: number;
  foods: FoodItem[];
}

function NutrientRow({
  label,
  value,
  unit,
  indent = false,
  bold = false,
}: {
  label: string;
  value: number | null;
  unit: string;
  indent?: boolean;
  bold?: boolean;
}) {
  if (value === null) return null;
  return (
    <div
      className={`flex items-center justify-between py-1.5 border-b border-slate-100 ${
        indent ? "pl-4" : ""
      }`}
    >
      <span className={`text-sm ${bold ? "font-semibold text-slate-900" : "text-slate-600"}`}>
        {label}
      </span>
      <span className={`text-sm font-medium ${bold ? "text-slate-900" : "text-slate-700"}`}>
        {typeof value === "number" ? value.toFixed(1) : value} {unit}
      </span>
    </div>
  );
}

function NutrientBar({
  label,
  value,
  max,
  color,
  unit,
}: {
  label: string;
  value: number | null;
  max: number;
  color: string;
  unit: string;
}) {
  if (value === null) return null;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-800 font-semibold">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MacroChart({ nutrients }: { nutrients: FoodNutrients }) {
  const protein = nutrients.protein || 0;
  const fat = nutrients.totalFat || 0;
  const carbs = nutrients.carbohydrates || 0;
  const total = protein * 4 + fat * 9 + carbs * 4;

  if (total === 0) return null;

  const proteinPct = ((protein * 4) / total) * 100;
  const fatPct = ((fat * 9) / total) * 100;
  const carbsPct = ((carbs * 4) / total) * 100;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h4 className="text-sm font-semibold text-slate-800 mb-3">
        Calorie Breakdown
      </h4>
      <div className="h-4 rounded-full overflow-hidden flex bg-slate-100">
        <div
          className="bg-blue-500 transition-all duration-500"
          style={{ width: `${proteinPct}%` }}
        />
        <div
          className="bg-amber-500 transition-all duration-500"
          style={{ width: `${fatPct}%` }}
        />
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${carbsPct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-600">
            Protein {proteinPct.toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600">Fat {fatPct.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Carbs {carbsPct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

function FoodCard({
  food,
  isSelected,
  onClick,
}: {
  food: FoodItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cal = food.nutrients.calories;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-emerald-400 bg-emerald-50 shadow-md ring-2 ring-emerald-200"
          : "border-slate-200 bg-white hover:border-emerald-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">
            {food.description}
          </h3>
          {food.foodCategory && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
              {food.foodCategory}
            </span>
          )}
          {food.brandOwner && (
            <p className="text-xs text-slate-400 mt-1 truncate">
              {food.brandOwner}
            </p>
          )}
        </div>
        {cal !== null && (
          <div className="shrink-0 text-right">
            <span className="text-lg font-bold text-emerald-600">
              {cal.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400 block">kcal</span>
          </div>
        )}
      </div>
    </button>
  );
}

function NutritionPanel({ food }: { food: FoodItem }) {
  const n = food.nutrients;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 leading-tight">
          {food.description}
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {food.foodCategory && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              {food.foodCategory}
            </span>
          )}
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
            {food.dataType}
          </span>
          {food.dataType === "Foundation" && (
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              🌿 Non-GMO Standard Reference
            </span>
          )}
        </div>
        {food.brandOwner && (
          <p className="text-sm text-slate-500 mt-2">
            Brand: {food.brandOwner}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          Per 100g serving · USDA FDC ID: {food.fdcId}
        </p>
      </div>

      {/* Calories highlight */}
      {n.calories !== null && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-80 font-medium">Calories</p>
          <p className="text-4xl font-extrabold mt-1">
            {n.calories.toFixed(0)}{" "}
            <span className="text-lg font-normal opacity-70">kcal</span>
          </p>
        </div>
      )}

      {/* Macro chart */}
      <MacroChart nutrients={n} />

      {/* Macro bars */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
        <h4 className="text-sm font-semibold text-slate-800 mb-2">
          Macronutrients
        </h4>
        <NutrientBar
          label="Protein"
          value={n.protein}
          max={50}
          color="bg-blue-500"
          unit="g"
        />
        <NutrientBar
          label="Total Fat"
          value={n.totalFat}
          max={78}
          color="bg-amber-500"
          unit="g"
        />
        <NutrientBar
          label="Carbohydrates"
          value={n.carbohydrates}
          max={325}
          color="bg-emerald-500"
          unit="g"
        />
        <NutrientBar
          label="Dietary Fiber"
          value={n.fiber}
          max={28}
          color="bg-purple-500"
          unit="g"
        />
        <NutrientBar
          label="Sugars"
          value={n.sugar}
          max={50}
          color="bg-pink-500"
          unit="g"
        />
      </div>

      {/* Fat breakdown */}
      {(n.saturatedFat !== null ||
        n.monounsaturatedFat !== null ||
        n.polyunsaturatedFat !== null ||
        n.transFat !== null) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">
            Fat Breakdown
          </h4>
          <NutrientRow
            label="Total Fat"
            value={n.totalFat}
            unit="g"
            bold
          />
          <NutrientRow
            label="Saturated Fat"
            value={n.saturatedFat}
            unit="g"
            indent
          />
          <NutrientRow
            label="Trans Fat"
            value={n.transFat}
            unit="g"
            indent
          />
          <NutrientRow
            label="Monounsaturated Fat"
            value={n.monounsaturatedFat}
            unit="g"
            indent
          />
          <NutrientRow
            label="Polyunsaturated Fat"
            value={n.polyunsaturatedFat}
            unit="g"
            indent
          />
          <NutrientRow
            label="Cholesterol"
            value={n.cholesterol}
            unit="mg"
          />
        </div>
      )}

      {/* Key minerals & sodium */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800 mb-2">
          Minerals & Sodium
        </h4>
        <NutrientBar
          label="🧂 Sodium"
          value={n.sodium}
          max={2300}
          color="bg-red-500"
          unit="mg"
        />
        <div className="mt-3 space-y-0">
          <NutrientRow
            label="Potassium"
            value={n.potassium}
            unit="mg"
          />
          <NutrientRow label="Calcium" value={n.calcium} unit="mg" />
          <NutrientRow label="Iron" value={n.iron} unit="mg" />
          <NutrientRow
            label="Magnesium"
            value={n.magnesium}
            unit="mg"
          />
          <NutrientRow label="Zinc" value={n.zinc} unit="mg" />
        </div>
      </div>

      {/* Vitamins */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800 mb-2">
          Vitamins
        </h4>
        <NutrientRow
          label="Vitamin A"
          value={n.vitaminA}
          unit="µg RAE"
        />
        <NutrientRow
          label="Vitamin C"
          value={n.vitaminC}
          unit="mg"
        />
        <NutrientRow
          label="Vitamin D"
          value={n.vitaminD}
          unit="µg"
        />
        <NutrientRow
          label="Vitamin B-6"
          value={n.vitaminB6}
          unit="mg"
        />
        <NutrientRow
          label="Vitamin B-12"
          value={n.vitaminB12}
          unit="µg"
        />
      </div>

      {/* Water content */}
      {n.water !== null && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">
            Other
          </h4>
          <NutrientRow label="💧 Water" value={n.water} unit="g" />
        </div>
      )}

      {/* Data source */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          Data sourced from USDA FoodData Central · Values per 100g · {food.dataType === "Foundation" ? "🌿 Foundation (Standard Reference — Non-GMO)" : food.dataType === "SR Legacy" ? "📋 Standard Reference Legacy" : food.dataType}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!query.trim()) return;

      setLoading(true);
      setError(null);
      setSelectedFood(null);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `Search failed with status ${res.status}`
          );
        }
        const data: SearchResponse = await res.json();
        setResults(data);
        if (data.foods.length > 0) {
          setSelectedFood(data.foods[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                NutriScan
              </h1>
            </div>
            <p className="hidden sm:block text-sm text-slate-500">
              Powered by USDA FoodData Central
            </p>
          </div>
        </div>
      </header>

      {/* Hero / Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <section className="text-center py-10 sm:py-14">
          <div className="text-4xl mb-3">🌎🥗🍏</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find Nutrition Info
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Search any food to get detailed nutrition facts including sodium,
            sugar, fat breakdown, GMO &amp; organic info
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-xl mx-auto flex gap-2"
          >
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods... e.g. chicken breast, avocado, rice"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Search"
              )}
            </button>
          </form>

          {/* Quick suggestions */}
          {!results && !loading && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "Chicken Breast",
                "Avocado",
                "Brown Rice",
                "Salmon",
                "Broccoli",
                "Egg",
                "Sweet Potato",
                "Banana",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    setTimeout(() => {
                      const form = document.querySelector("form");
                      if (form)
                        form.dispatchEvent(
                          new Event("submit", {
                            cancelable: true,
                            bubbles: true,
                          })
                        );
                    }, 50);
                  }}
                  className="px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <p className="font-medium">⚠️ {error}</p>
            <p className="text-xs mt-1 text-red-500">
              This may be due to API rate limiting. The DEMO_KEY allows 30
              requests/hour. Try again later.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="max-w-xl mx-auto space-y-3 pb-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="h-8 w-12 bg-emerald-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <section className="pb-16">
            <p className="text-sm text-slate-500 mb-4">
              Found{" "}
              <span className="font-semibold text-slate-700">
                {results.totalHits.toLocaleString()}
              </span>{" "}
              results for &ldquo;
              <span className="font-medium text-slate-700">
                {results.query}
              </span>
              &rdquo;
            </p>

            {results.foods.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-500">
                  No foods found. Try a different search term.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Food list */}
                <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {results.foods.map((food) => (
                    <FoodCard
                      key={food.fdcId}
                      food={food}
                      isSelected={selectedFood?.fdcId === food.fdcId}
                      onClick={() => setSelectedFood(food)}
                    />
                  ))}
                </div>

                {/* Nutrition panel */}
                <div className="lg:col-span-3">
                  {selectedFood ? (
                    <NutritionPanel food={selectedFood} />
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-200">
                      <p className="text-slate-400 text-sm">
                        Select a food to view nutrition details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-slate-400">
            U.S. Department of Agriculture, Agricultural Research Service.
            FoodData Central. fdc.nal.usda.gov
          </p>
          <p className="text-xs text-slate-300 mt-1">
            NutriScan — Food Nutrition Lookup · Data in the public domain (CC0
            1.0)
          </p>
        </div>
      </footer>
    </main>
  );
}
