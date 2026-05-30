import { NextRequest } from "next/server";

const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";
const API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";

export const dynamic = "force-dynamic";

interface RawPortion {
  id: number;
  gramWeight: number;
  amount: number;
  modifier: string;
  sequenceNumber: number;
  measureUnit?: {
    name?: string;
    abbreviation?: string;
  };
}

export async function GET(request: NextRequest) {
  const fdcId = request.nextUrl.searchParams.get("id");

  if (!fdcId) {
    return Response.json({ error: "Food ID is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${USDA_API_BASE}/food/${fdcId}?api_key=${API_KEY}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("USDA API error:", response.status, errorText);
      return Response.json(
        { error: "Failed to fetch food details from USDA" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract food portions with gram weights
    const rawPortions: RawPortion[] = data.foodPortions || [];
    const portions = rawPortions
      .sort((a: RawPortion, b: RawPortion) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0))
      .map((p: RawPortion) => ({
        id: p.id,
        gramWeight: p.gramWeight,
        amount: p.amount || 1,
        modifier: p.modifier || "serving",
        description: `${p.amount || 1} ${p.modifier || "serving"} (${p.gramWeight}g)`,
      }));

    // Also check for servingSize at top level (branded foods)
    const servingSize = data.servingSize || null;
    const servingSizeUnit = data.servingSizeUnit || null;
    const householdServingFullText = data.householdServingFullText || null;

    return Response.json({
      fdcId: data.fdcId,
      description: data.description,
      dataType: data.dataType,
      portions,
      servingSize,
      servingSizeUnit,
      householdServingFullText,
    });
  } catch (error) {
    console.error("Food detail error:", error);
    return Response.json(
      { error: "Internal server error while fetching food details" },
      { status: 500 }
    );
  }
}
