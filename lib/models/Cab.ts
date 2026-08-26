import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ICab extends Document {
  plateNumber: string;
  seatCapacity: 4 | 6 | 12;
  type: "sedan" | "suv" | "van";
  driverId: Types.ObjectId;
}

const CabSchema = new Schema<ICab>({
  plateNumber: { type: String, required: true },
  seatCapacity: { type: Number, enum: [4, 6, 12], required: true },
  type: { type: String, enum: ["sedan", "suv", "van"], required: true },
  driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
});

export default mongoose.models.Cab || mongoose.model<ICab>("Cab", CabSchema);
