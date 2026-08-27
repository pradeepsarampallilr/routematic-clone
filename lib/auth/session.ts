import { cookies } from "next/headers";
import { isValidRole, type Role } from "./roles";

export interface Session {
  role: Role;
  id: string;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (isValidRole(parsed?.role) && typeof parsed?.id === "string" && parsed.id) {
      return { role: parsed.role, id: parsed.id };
    }
  } catch {
    // fall through to null
  }

  return null;
}
