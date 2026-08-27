import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidRole, DASHBOARD_PATH } from "@/lib/auth/roles";
import { getUsersForRole, userExists } from "@/lib/auth/users";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");

  if (!isValidRole(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const users = await getUsersForRole(role);
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const role = body?.role;
  const id = body?.id;

  if (!isValidRole(role) || typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Invalid role or id" }, { status: 400 });
  }

  if (!(await userExists(role, id))) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify({ role, id }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ redirectTo: DASHBOARD_PATH[role] });
}
