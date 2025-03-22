import mongoose, { Schema, Document } from "mongoose";

export interface ISubcategory extends Document {
  _id: string;
  name: string;
  category: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategory>(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const Subcategory =
  mongoose.models.Subcategory ||
  mongoose.model<ISubcategory>("Subcategory", SubcategorySchema);
