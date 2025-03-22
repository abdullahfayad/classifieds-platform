import { NextRequest, NextResponse } from "next/server";

import { Subcategory } from "@/lib/db/models";
import { connectToMongoDB } from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const query = categoryId ? { category: categoryId } : {};

    const subcategories = await Subcategory.find(query)
      .populate("category", "name")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { message: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}
