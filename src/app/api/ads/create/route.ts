import { uploadImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { Ad } from "@/lib/db/models";
import { connectToMongoDB } from "@/lib/db/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;

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
    const images: string[] = [];

    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const buffer = await imageFile.arrayBuffer();
        const imageUrl = await uploadImage(buffer);
        images.push(imageUrl);
      }
    }

    const newAd = new Ad({
      title,
      description,
      price,
      category,
      subcategory,
      location: {
        city,
        country,
      },
      user: session.user.id,
      images,
    });

    await newAd.save();

    return NextResponse.json(
      {
        message: "Ad created successfully and pending approval",
        adId: newAd._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { message: "Failed to create ad" },
      { status: 500 }
    );
  }
}
