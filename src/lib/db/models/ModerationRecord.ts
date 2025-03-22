import mongoose, { Schema, Document } from "mongoose";

export interface IModerationRecord extends Document {
  ad: mongoose.Types.ObjectId;
  moderator: mongoose.Types.ObjectId;
  status: "approved" | "rejected";
  reason?: string;
  createdAt: Date;
}

const ModerationRecordSchema = new Schema<IModerationRecord>(
  {
    ad: {
      type: Schema.Types.ObjectId,
      ref: "Ad",
      required: [true, "Ad is required"],
    },
    moderator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Moderator is required"],
    },
    status: {
      type: String,
      enum: ["approved", "rejected"],
      required: [true, "Status is required"],
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ModerationRecord =
  mongoose.models.ModerationRecord ||
  mongoose.model<IModerationRecord>("ModerationRecord", ModerationRecordSchema);
