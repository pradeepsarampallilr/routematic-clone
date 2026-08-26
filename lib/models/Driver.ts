import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IDriver extends Document {
  name: string;
  phone: string;
  licenseNumber: string;
  cabId: Types.ObjectId;
}

const DriverSchema = new Schema<IDriver>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  cabId: { type: Schema.Types.ObjectId, ref: "Cab", required: true },
});

export default mongoose.models.Driver ||
  mongoose.model<IDriver>("Driver", DriverSchema);
