import { NextRequest } from "next/server";

const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";
const API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";

export const dynamic = "force-dynamic";

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
    return Response.json(data);
  } catch (error) {
    console.error("Food detail error:", error);
    return Response.json(
      { error: "Internal server error while fetching food details" },
      { status: 500 }
    );
  }
}
