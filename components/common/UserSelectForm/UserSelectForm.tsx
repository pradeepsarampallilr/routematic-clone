"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/auth/roles";
import styles from "./UserSelectForm.module.css";

interface SelectableUser {
  id: string;
  name: string;
}

interface UserSelectFormProps {
  role: Role;
  roleLabel: string;
}

type Status = "loading" | "ready" | "submitting" | "error";

export default function UserSelectForm({ role, roleLabel }: UserSelectFormProps) {
  const router = useRouter();
  const [users, setUsers] = useState<SelectableUser[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const res = await fetch(`/api/auth?role=${role}`);
        if (!res.ok) throw new Error("Failed to load users");
        const data: { users: SelectableUser[] } = await res.json();
        if (cancelled) return;
        setUsers(data.users);
        setSelectedId(data.users[0]?.id ?? "");
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setError("Couldn't load the list. Please try again.");
          setStatus("error");
        }
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [role]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedId) return;

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, id: selectedId }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data: { redirectTo: string } = await res.json();
      router.push(data.redirectTo);
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("ready");
    }
  }

  if (status === "loading") {
    return <p className={styles.message}>Loading {roleLabel.toLowerCase()}s…</p>;
  }

  if (status === "error" && users.length === 0) {
    return <p className={styles.messageError}>{error}</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="user-select">
        Select your name
      </label>
      <select
        id="user-select"
        className={styles.select}
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      {error && <p className={styles.messageError}>{error}</p>}
      <button
        type="submit"
        className={styles.button}
        disabled={status === "submitting" || !selectedId}
      >
        {status === "submitting" ? "Signing in…" : `Continue as ${roleLabel}`}
      </button>
    </form>
  );
}
