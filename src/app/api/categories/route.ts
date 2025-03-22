import { NextResponse } from "next/server";

import { Category } from "@/lib/db/models";
import { connectToMongoDB } from "@/lib/db/mongodb";

export async function GET() {
  try {
    await connectToMongoDB();

    const categories = await Category.find().sort({ name: 1 }).lean();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
