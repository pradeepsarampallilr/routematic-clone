import { isValidObjectId } from "mongoose";
import dbConnect from "@/lib/db/connect";
import Employee from "@/lib/models/Employee";
import Driver from "@/lib/models/Driver";
import type { Role } from "./roles";

export interface SelectableUser {
  id: string;
  name: string;
}

// No Admin collection exists in the data model — the prototype uses a fixed
// roster instead of a seeded one.
const ADMIN_USERS: SelectableUser[] = [
  { id: "admin-1", name: "Priyanka Menon" },
  { id: "admin-2", name: "Karthik Rao" },
];

export async function getUsersForRole(role: Role): Promise<SelectableUser[]> {
  if (role === "admin") {
    return ADMIN_USERS;
  }

  await dbConnect();
  const Model = role === "employee" ? Employee : Driver;
  const docs = await Model.find().sort({ name: 1 }).select("name").lean();
  return docs.map((doc) => ({ id: String(doc._id), name: doc.name }));
}

export async function userExists(role: Role, id: string): Promise<boolean> {
  if (role === "admin") {
    return ADMIN_USERS.some((user) => user.id === id);
  }

  if (!isValidObjectId(id)) {
    return false;
  }

  await dbConnect();
  const Model = role === "employee" ? Employee : Driver;
  return (await Model.exists({ _id: id })) !== null;
}
