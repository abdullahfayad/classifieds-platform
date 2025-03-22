import mongoose, { Schema, Document } from "mongoose";

export interface IAd extends Document {
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
  };
  price: number;
  category: mongoose.Types.ObjectId;
  subcategory: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [2000, "Description cannot be more than 2000 characters"],
    },
    location: {
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      required: [true, "Subcategory is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

AdSchema.index({ user: 1 });
AdSchema.index({ status: 1 });
AdSchema.index({ category: 1 });
AdSchema.index({ subcategory: 1 });
AdSchema.index({ "location.city": 1, "location.country": 1 });

export const Ad = mongoose.models.Ad || mongoose.model<IAd>("Ad", AdSchema);
