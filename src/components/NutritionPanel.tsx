"use client";

import { useState, useEffect } from "react";
import { FoodItem, FoodPortion, FoodDetail, DAILY_VALUES } from "@/types/food";

interface NutritionPanelProps {
  food: FoodItem;
}

type ServingMode = "100g" | "servings" | "custom_grams";

function getDvPercent(
  nutrientKey: string,
  valuePerHundredGrams: number | null,
  multiplier: number
): number | null {
  if (valuePerHundredGrams === null) return null;
  const dv = DAILY_VALUES[nutrientKey];
  if (!dv || dv.value === 0) return null;
  const adjustedValue = valuePerHundredGrams * multiplier;
  return Math.round((adjustedValue / dv.value) * 100);
}

function formatValue(
  val: number | null,
  multiplier: number,
  decimals: number = 1
): string {
  if (val === null) return "—";
  return (val * multiplier).toFixed(decimals);
}

function DvBar({ percent }: { percent: number | null }) {
  if (percent === null) return null;
  const clampedWidth = Math.min(percent, 100);
  let barColor = "bg-emerald-400";
  if (percent > 100) barColor = "bg-red-400";
  else if (percent > 50) barColor = "bg-amber-400";

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>
      <span
        className={`text-xs font-semibold tabular-nums ${
          percent > 100
            ? "text-red-600"
            : percent > 50
              ? "text-amber-600"
              : "text-slate-500"
        }`}
      >
        {percent}%
      </span>
    </div>
  );
}

interface NutrientRowProps {
  label: string;
  nutrientKey: string;
  value: number | null;
  unit: string;
  multiplier: number;
  indent?: boolean;
  bold?: boolean;
  borderTop?: boolean;
}

function NutrientRow({
  label,
  nutrientKey,
  value,
  unit,
  multiplier,
  indent = false,
  bold = false,
  borderTop = false,
}: NutrientRowProps) {
  const dvPercent = getDvPercent(nutrientKey, value, multiplier);
  const displayVal = formatValue(value, multiplier);

  return (
    <div
      className={`flex items-center justify-between py-1.5 ${
        borderTop ? "border-t border-slate-200" : ""
      } ${indent ? "pl-4" : ""}`}
    >
      <span
        className={`text-sm ${
          bold ? "font-semibold text-slate-800" : "text-slate-600"
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700 tabular-nums min-w-[60px] text-right">
          {displayVal} {unit}
        </span>
        <DvBar percent={dvPercent} />
      </div>
    </div>
  );
}

export default function NutritionPanel({ food }: NutritionPanelProps) {
  const [servingMode, setServingMode] = useState<ServingMode>("servings");
  const [servingCount, setServingCount] = useState(1);
  const [customGrams, setCustomGrams] = useState(100);
  const [selectedPortionIdx, setSelectedPortionIdx] = useState(0);
  const [portions, setPortions] = useState<FoodPortion[]>([]);
  const [loadingPortions, setLoadingPortions] = useState(false);
  const [fallbackServingGrams, setFallbackServingGrams] = useState(100);
  const [householdText, setHouseholdText] = useState<string | null>(null);

  // Fetch food detail to get proper portions whenever food changes
  useEffect(() => {
    let cancelled = false;
    setLoadingPortions(true);
    setPortions([]);
    setSelectedPortionIdx(0);
    setServingCount(1);
    setServingMode("servings");

    fetch(`/api/food?id=${food.fdcId}`)
      .then((res) => res.json())
      .then((detail: FoodDetail) => {
        if (cancelled) return;

        if (detail.portions && detail.portions.length > 0) {
          setPortions(detail.portions);
          setSelectedPortionIdx(0);
          setFallbackServingGrams(detail.portions[0].gramWeight);
        } else if (detail.servingSize) {
          // Branded food with a flat servingSize
          setFallbackServingGrams(detail.servingSize);
          setHouseholdText(detail.householdServingFullText);
        } else {
          // No portion data at all — fallback to 100g
          setFallbackServingGrams(100);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFallbackServingGrams(100);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPortions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [food.fdcId]);

  // The gram weight of one "serving" based on the selected portion
  const currentPortionGrams =
    portions.length > 0
      ? portions[selectedPortionIdx]?.gramWeight ?? fallbackServingGrams
      : fallbackServingGrams;

  const currentPortionLabel =
    portions.length > 0
      ? `${portions[selectedPortionIdx]?.amount ?? 1} ${portions[selectedPortionIdx]?.modifier ?? "serving"}`
      : householdText || "serving";

  // Calculate multiplier: all USDA search data is per 100g
  const getMultiplier = (): number => {
    switch (servingMode) {
      case "100g":
        return 1;
      case "servings":
        return (currentPortionGrams * servingCount) / 100;
      case "custom_grams":
        return customGrams / 100;
      default:
        return 1;
    }
  };

  const multiplier = getMultiplier();
  const n = food.nutrients;

  const effectiveGrams =
    servingMode === "100g"
      ? 100
      : servingMode === "servings"
        ? currentPortionGrams * servingCount
        : customGrams;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4">
        <h2 className="text-lg font-bold text-white leading-snug">
          {food.description}
        </h2>
        {food.foodCategory && (
          <p className="text-emerald-100 text-xs mt-0.5">{food.foodCategory}</p>
        )}
        {food.brandOwner && (
          <p className="text-emerald-200 text-xs">{food.brandOwner}</p>
        )}
      </div>

      {/* Serving Size Selector */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Serving Size
        </label>

        {/* Mode tabs */}
        <div className="flex gap-1 mt-2 bg-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => setServingMode("100g")}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
              servingMode === "100g"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            100g
          </button>
          <button
            onClick={() => setServingMode("servings")}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
              servingMode === "servings"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Servings
          </button>
          <button
            onClick={() => setServingMode("custom_grams")}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
              servingMode === "custom_grams"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Custom (g)
          </button>
        </div>

        {/* Mode-specific controls */}
        {servingMode === "servings" && (
          <div className="mt-3 space-y-2">
            {/* Portion picker — only if we have multiple portions */}
            {loadingPortions ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading serving sizes…
              </div>
            ) : portions.length > 0 ? (
              <div>
                <label className="text-[11px] text-slate-500 font-medium">
                  Portion type
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {portions.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPortionIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedPortionIdx === idx
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                      }`}
                    >
                      {p.modifier} ({p.gramWeight}g)
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Number of servings */}
            <div>
              <label className="text-[11px] text-slate-500 font-medium">
                Number of servings
              </label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setServingCount(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      servingCount === num
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={servingCount}
                  onChange={(e) =>
                    setServingCount(
                      Math.max(1, Math.min(99, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-16 h-8 rounded-lg border border-slate-200 text-xs text-center font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-1">
              1 serving = {currentPortionLabel} = {currentPortionGrams}g
            </p>
          </div>
        )}

        {servingMode === "custom_grams" && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={9999}
              value={customGrams}
              onChange={(e) =>
                setCustomGrams(
                  Math.max(1, Math.min(9999, parseInt(e.target.value) || 1))
                )
              }
              className="w-20 h-8 rounded-lg border border-slate-200 text-xs text-center font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
            />
            <span className="text-xs text-slate-500">grams</span>
          </div>
        )}

        {/* Summary line */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Showing values for{" "}
            <strong className="text-slate-700">
              {Math.round(effectiveGrams)}g
            </strong>
            {servingMode === "servings" && (
              <>
                {" "}
                ({servingCount} × {currentPortionLabel})
              </>
            )}
          </span>
        </div>
      </div>

      {/* Calorie Banner */}
      <div className="px-5 py-4 flex items-baseline justify-between border-b-4 border-slate-800">
        <span className="text-xl font-extrabold text-slate-900">Calories</span>
        <div className="text-right">
          <span className="text-3xl font-black text-slate-900 tabular-nums">
            {n.calories !== null ? Math.round(n.calories * multiplier) : "—"}
          </span>
          {n.calories !== null && (
            <span className="ml-2 text-xs text-slate-400 font-semibold">
              {getDvPercent("calories", n.calories, multiplier) ?? "—"}% DV
            </span>
          )}
        </div>
      </div>

      {/* Nutrient Details */}
      <div className="px-5 py-3 space-y-0">
        {/* Column Header */}
        <div className="flex items-center justify-between pb-1 border-b-2 border-slate-300 mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Nutrient
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[60px] text-right">
              Amount
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[120px] text-left">
              % Daily Value
            </span>
          </div>
        </div>

        <NutrientRow
          label="Total Fat"
          nutrientKey="totalFat"
          value={n.totalFat}
          unit="g"
          multiplier={multiplier}
          bold
          borderTop
        />
        <NutrientRow
          label="Saturated Fat"
          nutrientKey="saturatedFat"
          value={n.saturatedFat}
          unit="g"
          multiplier={multiplier}
          indent
        />
        <NutrientRow
          label="Trans Fat"
          nutrientKey="transFat"
          value={n.transFat}
          unit="g"
          multiplier={multiplier}
          indent
        />
        <NutrientRow
          label="Monounsat. Fat"
          nutrientKey="monounsaturatedFat"
          value={n.monounsaturatedFat}
          unit="g"
          multiplier={multiplier}
          indent
        />
        <NutrientRow
          label="Polyunsat. Fat"
          nutrientKey="polyunsaturatedFat"
          value={n.polyunsaturatedFat}
          unit="g"
          multiplier={multiplier}
          indent
        />
        <NutrientRow
          label="Cholesterol"
          nutrientKey="cholesterol"
          value={n.cholesterol}
          unit="mg"
          multiplier={multiplier}
          bold
          borderTop
        />
        <NutrientRow
          label="Sodium"
          nutrientKey="sodium"
          value={n.sodium}
          unit="mg"
          multiplier={multiplier}
          bold
          borderTop
        />
        <NutrientRow
          label="Total Carbohydrates"
          nutrientKey="carbohydrates"
          value={n.carbohydrates}
          unit="g"
          multiplier={multiplier}
          bold
          borderTop
        />
        <NutrientRow
          label="Dietary Fiber"
          nutrientKey="fiber"
          value={n.fiber}
          unit="g"
          multiplier={multiplier}
          indent
        />
        <NutrientRow
          label="Total Sugars"
          nutrientKey="sugar"
          value={n.sugar}
          unit="g"
          multiplier={multiplier}
          indent
        />
        <NutrientRow
          label="Protein"
          nutrientKey="protein"
          value={n.protein}
          unit="g"
          multiplier={multiplier}
          bold
          borderTop
        />

        {/* Thick divider */}
        <div className="border-t-8 border-slate-800 my-2" />

        <NutrientRow
          label="Vitamin A"
          nutrientKey="vitaminA"
          value={n.vitaminA}
          unit="mcg"
          multiplier={multiplier}
        />
        <NutrientRow
          label="Vitamin C"
          nutrientKey="vitaminC"
          value={n.vitaminC}
          unit="mg"
          multiplier={multiplier}
          borderTop
        />
        <NutrientRow
          label="Vitamin D"
          nutrientKey="vitaminD"
          value={n.vitaminD}
          unit="mcg"
          multiplier={multiplier}
          borderTop
        />
        <NutrientRow
          label="Vitamin B6"
          nutrientKey="vitaminB6"
          value={n.vitaminB6}
          unit="mg"
          multiplier={multiplier}
          borderTop
        />
        <NutrientRow
          label="Vitamin B12"
          nutrientKey="vitaminB12"
          value={n.vitaminB12}
          unit="mcg"
          multiplier={multiplier}
          borderTop
        />
        <NutrientRow
          label="Calcium"
          nutrientKey="calcium"
          value={n.calcium}
          unit="mg"
          multiplier={multiplier}
          borderTop
        />
        <NutrientRow
          label="Iron"
          nutrientKey="iron"
          value={n.iron}
          unit="mg"
          multiplier={multiplier}
          borderTop
        />
        <NutrientRow
          label="Potassium"
          nutrientKey="potassium"
          value={n.potassium}
          unit="mg"
          multiplier={multiplier}
          borderTop
        />
        <NutrientRow
          label="Magnesium"
          nutrientKey="magnesium"
          value={n.magnesium}
          unit="mg"
          multiplier={multiplier}
          borderTop
        />
        <NutrientRow
          label="Zinc"
          nutrientKey="zinc"
          value={n.zinc}
          unit="mg"
          multiplier={multiplier}
          borderTop
        />
      </div>

      {/* Water */}
      {n.water !== null && (
        <div className="px-5 py-2 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">Water</span>
          <span className="text-sm font-medium text-slate-600 tabular-nums">
            {formatValue(n.water, multiplier)} g
          </span>
        </div>
      )}

      {/* Footer note */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          % Daily Values are based on a 2,000 calorie diet. Your daily values
          may be higher or lower depending on your calorie needs. Source: USDA
          FoodData Central.
        </p>
      </div>
    </div>
  );
}
