import { NextRequest, NextResponse } from "next/server";

import { fetchIntel } from "@/lib/intel";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query") || "Nancy Guthrie missing Arizona";

  try {
    const items = await fetchIntel(query);

    const timeline = Object.entries(
      items.reduce<Record<string, typeof items>>((acc, item) => {
        const key = item.minuteKey;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {})
    )
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([minute, minuteItems]) => ({
        minute,
        count: minuteItems.length,
        items: minuteItems,
      }));

    return NextResponse.json({
      query,
      fetchedAt: new Date().toISOString(),
      totalItems: items.length,
      timeline,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch intel feeds",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
