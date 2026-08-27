import { NextRequest, NextResponse } from "next/server";
import { completeRide } from "@/lib/rides/completeRide";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await completeRide(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ rideId: result.rideId, invoiceId: result.invoiceId });
}
