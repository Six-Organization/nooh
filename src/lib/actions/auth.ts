"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { error: "ADMIN_PASSWORD belum di-set di server." };
  }
  if (password !== expected) {
    return { error: "Password salah." };
  }

  await createSession();
  redirect("/admin/products");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
