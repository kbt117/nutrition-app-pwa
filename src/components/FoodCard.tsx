"use client";

import { FoodItem } from "@/types/food";

interface FoodCardProps {
  food: FoodItem;
  isSelected: boolean;
  onClick: () => void;
}

export default function FoodCard({ food, isSelected, onClick }: FoodCardProps) {
  const cal = food.nutrients.calories;
  const protein = food.nutrients.protein;
  const fat = food.nutrients.totalFat;
  const carbs = food.nutrients.carbohydrates;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "bg-emerald-50 border-emerald-300 shadow-md ring-2 ring-emerald-200"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm leading-snug truncate ${
              isSelected ? "text-emerald-900" : "text-slate-800"
            }`}
          >
            {food.description}
          </h3>
          {food.foodCategory && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {food.foodCategory}
            </p>
          )}
          {food.brandOwner && (
            <p className="text-xs text-slate-400 truncate">{food.brandOwner}</p>
          )}
        </div>
        {cal !== null && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap ${
              isSelected
                ? "bg-emerald-200 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {Math.round(cal)} cal
          </span>
        )}
      </div>

      {/* Quick macro bar */}
      {(protein !== null || fat !== null || carbs !== null) && (
        <div className="flex gap-3 mt-2 text-xs text-slate-500">
          {protein !== null && (
            <span>
              P: <strong className="text-slate-700">{protein.toFixed(1)}g</strong>
            </span>
          )}
          {fat !== null && (
            <span>
              F: <strong className="text-slate-700">{fat.toFixed(1)}g</strong>
            </span>
          )}
          {carbs !== null && (
            <span>
              C: <strong className="text-slate-700">{carbs.toFixed(1)}g</strong>
            </span>
          )}
        </div>
      )}

      {/* Per 100g note */}
      <p className="text-[10px] text-slate-400 mt-1">per 100g</p>
    </button>
  );
}
