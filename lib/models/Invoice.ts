import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IInvoice extends Document {
  rideId: Types.ObjectId;
  driverId: Types.ObjectId;
  baseFare: number;
  deviationPercent: number;
  flagged: boolean;
  penaltyAmount: number;
  totalAmount: number;
  hrPayoutAmount: number;
  vendorPayoutAmount: number;
  generatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  rideId: { type: Schema.Types.ObjectId, ref: "Ride", required: true },
  driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
  baseFare: { type: Number, required: true },
  deviationPercent: { type: Number, required: true },
  flagged: { type: Boolean, default: false },
  penaltyAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  hrPayoutAmount: { type: Number, required: true },
  vendorPayoutAmount: { type: Number, required: true },
  generatedAt: { type: Date, required: true },
});

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);
