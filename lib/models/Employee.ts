import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  gender: "male" | "female";
  email: string;
  phone: string;
  address: string;
  location?: { lat: number; lng: number };
  department: string;
  shift: "morning" | "evening" | "night";
  assignedCabId: Types.ObjectId | null;
  requiresEscort: boolean;
}

const EmployeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { lat: Number, lng: Number, _id: false },
    required: false,
    default: undefined,
  },
  department: { type: String, required: true },
  shift: { type: String, enum: ["morning", "evening", "night"], required: true },
  assignedCabId: { type: Schema.Types.ObjectId, ref: "Cab", default: null },
  requiresEscort: { type: Boolean, default: false },
});

export default mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);
