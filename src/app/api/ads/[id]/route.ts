import { uploadImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { Ad } from "@/lib/db/models";
import { authOptions } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/db/mongodb";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToMongoDB();

    const ad = await Ad.findById(id)
      .populate("category")
      .populate("subcategory")
      .lean();

    if (!ad) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { message: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const existingAd = await Ad.findById(id);

    if (!existingAd) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    if (existingAd.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const existingImages = JSON.parse(
      (formData.get("existingImages") as string) || "[]"
    );

    if (
      !title ||
      !description ||
      isNaN(price) ||
      !category ||
      !subcategory ||
      !city ||
      !country
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const imageFiles = formData.getAll("images") as File[];
    const images = existingImages || [];

    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const buffer = await imageFile.arrayBuffer();
        const imageUrl = await uploadImage(buffer);
        images.push(imageUrl);
      }
    }

    const updatedAd = await Ad.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        category,
        subcategory,
        location: {
          city,
          country,
        },
        images,
        status: "pending", // Reset to pending for moderation
        rejectionReason: undefined, // Clear any rejection reason
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Ad updated successfully and pending approval",
      ad: updatedAd,
    });
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { message: "Failed to update ad" },
      { status: 500 }
    );
  }
}
