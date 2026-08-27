import { NextRequest, NextResponse } from "next/server";
import { confirmPickupOtp } from "@/lib/rides/confirmPickupOtp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const employeeId = body?.employeeId;
  const otp = body?.otp;
  const role = body?.role;

  if (
    typeof employeeId !== "string" ||
    typeof otp !== "string" ||
    !employeeId ||
    !otp ||
    (role !== "employee" && role !== "driver")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await confirmPickupOtp(id, employeeId, otp, role);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ rideId: result.rideId, status: result.status });
}
