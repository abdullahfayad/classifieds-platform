import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { Subcategory } from "@/lib/db/models";
import { connectToMongoDB } from "@/lib/db/mongodb";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const { id } = await context.params;
    const subcategoryId = id;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Subcategory name is required" },
        { status: 400 }
      );
    }

    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      return NextResponse.json(
        { message: "Subcategory not found" },
        { status: 404 }
      );
    }

    const existingSubcategory = await Subcategory.findOne({
      name,
      category: subcategory.category,
      _id: { $ne: subcategoryId },
    });

    if (existingSubcategory) {
      return NextResponse.json(
        {
          message:
            "A subcategory with this name already exists in this category",
        },
        { status: 409 }
      );
    }

    await Subcategory.findByIdAndUpdate(subcategoryId, { name });

    return NextResponse.json(
      { message: "Subcategory updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { message: "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const { id } = await context.params;
    const subcategoryId = id;

    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      return NextResponse.json(
        { message: "Subcategory not found" },
        { status: 404 }
      );
    }

    await Subcategory.findByIdAndDelete(subcategoryId);

    return NextResponse.json(
      { message: "Subcategory deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { message: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
