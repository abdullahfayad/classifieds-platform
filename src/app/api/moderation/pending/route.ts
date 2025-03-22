import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { Ad } from "@/lib/db/models";
import { authOptions } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const pendingAds = await Ad.find({ status: "pending" })
      .populate("user", "name")
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pendingAds);
  } catch (error) {
    console.error("Error fetching pending ads:", error);
    return NextResponse.json(
      { message: "Failed to fetch pending ads" },
      { status: 500 }
    );
  }
}
