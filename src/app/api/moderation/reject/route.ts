import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { connectToMongoDB } from "@/lib/db/mongodb";
import { Ad, ModerationRecord } from "@/lib/db/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const body = await req.json();
    const { adId, reason } = body;

    if (!adId || !reason) {
      return NextResponse.json(
        { message: "Ad ID and reason are required" },
        { status: 400 }
      );
    }

    const ad = await Ad.findById(adId);

    if (!ad) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    ad.status = "rejected";
    ad.rejectionReason = reason;
    await ad.save();

    const moderationRecord = new ModerationRecord({
      ad: adId,
      moderator: session.user.id,
      status: "rejected",
      reason,
    });

    await moderationRecord.save();

    return NextResponse.json(
      { message: "Ad rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting ad:", error);
    return NextResponse.json(
      { message: "Failed to reject ad" },
      { status: 500 }
    );
  }
}
