import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IRosterStop {
  employeeId: Types.ObjectId;
  order: number;
  etaMinutes: number;
  otp: string;
  status: "pending" | "confirmed" | "picked_up";
}

export interface IRosterRoute {
  cabId: Types.ObjectId;
  driverId: Types.ObjectId;
  stops: IRosterStop[];
  geoJsonRoute: {
    type: "LineString";
    coordinates: [number, number][];
  };
  plannedDistanceKm: number;
  status: "scheduled" | "in_progress" | "completed";
}

export interface IRoster extends Document {
  date: Date;
  shift: "morning" | "evening" | "night";
  routes: IRosterRoute[];
}

const RosterStopSchema = new Schema<IRosterStop>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    order: { type: Number, required: true },
    etaMinutes: { type: Number, required: true },
    otp: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "picked_up"],
      default: "pending",
    },
  },
  { _id: false }
);

const RosterRouteSchema = new Schema<IRosterRoute>(
  {
    cabId: { type: Schema.Types.ObjectId, ref: "Cab", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    stops: { type: [RosterStopSchema], default: [] },
    geoJsonRoute: {
      type: {
        type: String,
        enum: ["LineString"],
        required: true,
      },
      coordinates: { type: [[Number]], required: true },
    },
    plannedDistanceKm: { type: Number, required: true },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed"],
      default: "scheduled",
    },
  },
  { _id: false }
);

const RosterSchema = new Schema<IRoster>({
  date: { type: Date, required: true },
  shift: { type: String, enum: ["morning", "evening", "night"], required: true },
  routes: { type: [RosterRouteSchema], default: [] },
});

export default mongoose.models.Roster ||
  mongoose.model<IRoster>("Roster", RosterSchema);
