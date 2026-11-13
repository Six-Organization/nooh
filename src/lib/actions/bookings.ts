"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Tidak diizinkan. Silakan login sebagai admin.");
  }
}

export type BookingInput = {
  name: string | null;
  whatsapp: string;
  kind: "BUNDLE" | "CUSTOM";
  summary: string;
  total: number | null;
  eventDate: string | null;
  consent: boolean;
};

/** Normalisasi nomor WA Indonesia ke format 62xxxx (hanya digit). */
function normalizeWa(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("620")) d = "62" + d.slice(3);
  else if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

/** Simpan booking customer (publik, tanpa login). */
export async function createBooking(input: BookingInput) {
  const wa = normalizeWa(input.whatsapp);
  if (wa.length < 10 || wa.length > 15 || !wa.startsWith("62"))
    throw new Error("Nomor WhatsApp tidak valid.");
  if (!input.summary.trim()) throw new Error("Ringkasan pesanan kosong.");

  await prisma.booking.create({
    data: {
      name: input.name?.trim() || null,
      whatsapp: wa,
      kind: input.kind,
      summary: input.summary,
      total: input.total,
      eventDate: input.eventDate,
      consent: input.consent,
    },
  });
  revalidatePath("/admin/bookings");
  return { ok: true };
}

/** Daftar booking untuk admin (terbaru dulu). */
export async function getBookings() {
  await requireAdmin();
  return prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
}

export async function deleteBooking(id: number) {
  await requireAdmin();
  await prisma.booking.delete({ where: { id } });
  revalidatePath("/admin/bookings");
}
