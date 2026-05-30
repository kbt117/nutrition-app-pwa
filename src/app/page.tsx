"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import FoodCard from "@/components/FoodCard";
import NutritionPanel from "@/components/NutritionPanel";
import { FoodItem, SearchResults } from "@/types/food";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nutritionPanelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const q = (searchQuery || query).trim();
      if (!q) return;

      setLoading(true);
      setError(null);
      setSelectedFood(null);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}`
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Search failed");
        }
        const data: SearchResults = await res.json();
        setResults(data);

        // Auto-select the first food if available
        if (data.foods.length > 0) {
          setSelectedFood(data.foods[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  const handleSelectFood = useCallback((food: FoodItem) => {
    setSelectedFood(food);
  }, []);

  // Scroll to nutrition panel when a food is selected
  useEffect(() => {
    if (selectedFood && nutritionPanelRef.current) {
      // Small delay to allow React to render
      const timer = setTimeout(() => {
        nutritionPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedFood]);

  const handleSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <span className="text-xl sm:text-2xl">🥗</span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Eat Well
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero / Search */}
        <section className="text-center py-10 sm:py-14">
          <p className="text-4xl sm:text-5xl">🌎🥗🍏</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Find Nutrition Info
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Search any food to get detailed nutrition facts including sodium,
            sugar, fat breakdown, GMO &amp; organic info
          </p>

          {/* Search bar */}
          <form
            className="mt-8 max-w-lg mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods... (e.g. chicken breast, avocado)"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm transition-all"
              />
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
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 5.65 5.65a7.5 7.5 0 0 0 10.99 10.99z"
                />
              </svg>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 animate-spin"
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
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>

          {/* Quick suggestions */}
          {!results && !loading && (
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
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
                  onClick={() => handleSuggestion(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 font-medium hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"
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
                  <div className="h-6 w-14 bg-slate-200 rounded-lg" />
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
                      onClick={() => handleSelectFood(food)}
                    />
                  ))}
                </div>

                {/* Nutrition panel */}
                <div className="lg:col-span-3" ref={nutritionPanelRef}>
                  {selectedFood ? (
                    <NutritionPanel food={selectedFood} />
                  ) : (
                    <div className="flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200">
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
      <footer className="border-t border-slate-200 bg-white/60 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-slate-400">
            Data from USDA FoodData Central · Built with Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}
