import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { connectToMongoDB } from "@/lib/db/mongodb";
import { Subcategory, Category } from "@/lib/db/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const { name, categoryId } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { message: "Subcategory name and category ID are required" },
        { status: 400 }
      );
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const existingSubcategory = await Subcategory.findOne({
      name,
      category: categoryId,
    });
    if (existingSubcategory) {
      return NextResponse.json(
        { message: "Subcategory already exists" },
        { status: 409 }
      );
    }

    const newSubcategory = new Subcategory({ name, category: categoryId });
    await newSubcategory.save();

    return NextResponse.json(
      {
        message: "Subcategory created successfully",
        subcategory: newSubcategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { message: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
