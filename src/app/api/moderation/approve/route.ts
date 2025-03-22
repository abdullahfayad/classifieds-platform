import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/db/mongodb";
import { Ad, ModerationRecord } from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const body = await req.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json(
        { message: "Ad ID is required" },
        { status: 400 }
      );
    }

    const ad = await Ad.findById(adId);

    if (!ad) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    ad.status = "approved";
    await ad.save();

    const moderationRecord = new ModerationRecord({
      ad: adId,
      moderator: session.user.id,
      status: "approved",
    });

    await moderationRecord.save();

    return NextResponse.json(
      { message: "Ad approved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving ad:", error);
    return NextResponse.json(
      { message: "Failed to approve ad" },
      { status: 500 }
    );
  }
}
