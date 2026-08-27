export const ROLES = ["employee", "driver", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const DASHBOARD_PATH: Record<Role, string> = {
  employee: "/company/employee/dashboard",
  driver: "/vendor/driver/dashboard",
  admin: "/admin/dashboard",
};

export function isValidRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}
