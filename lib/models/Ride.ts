import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IRide extends Document {
  rosterId: Types.ObjectId;
  routeIndex: number;
  startedAt: Date;
  completedAt?: Date;
  actualDistanceKm: number;
  status: "in_progress" | "completed";
}

const RideSchema = new Schema<IRide>({
  rosterId: { type: Schema.Types.ObjectId, ref: "Roster", required: true },
  routeIndex: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
  actualDistanceKm: { type: Number, required: true },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
});

export default mongoose.models.Ride || mongoose.model<IRide>("Ride", RideSchema);
