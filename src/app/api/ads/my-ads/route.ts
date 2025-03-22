import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { Ad } from "@/lib/db/models";
import { connectToMongoDB } from "@/lib/db/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const userAds = await Ad.find({ user: session.user.id })
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(userAds);
  } catch (error) {
    console.error("Error fetching user ads:", error);
    return NextResponse.json(
      { message: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}
