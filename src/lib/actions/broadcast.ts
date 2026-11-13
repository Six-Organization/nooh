"use server";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Tidak diizinkan. Silakan login sebagai admin.");
  }
}

export type BroadcastContact = { whatsapp: string; name: string | null };

/** Nomor WA ber-consent (unik) untuk broadcast. */
export async function getBroadcastAudience(): Promise<BroadcastContact[]> {
  await requireAdmin();
  const rows = await prisma.booking.findMany({
    where: { consent: true },
    select: { whatsapp: true, name: true },
    orderBy: { createdAt: "desc" },
  });
  const seen = new Set<string>();
  const out: BroadcastContact[] = [];
  for (const r of rows) {
    if (seen.has(r.whatsapp)) continue;
    seen.add(r.whatsapp);
    out.push({ whatsapp: r.whatsapp, name: r.name });
  }
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export type BroadcastResult = {
  total: number;
  sent: number;
  failed: number;
  errors: string[];
};

/**
 * Kirim broadcast ke semua nomor ber-consent via Fonnte.
 * Butuh env FONNTE_TOKEN. Hanya dipicu admin dari dashboard (tidak otomatis).
 */
export async function sendBroadcast(message: string): Promise<BroadcastResult> {
  await requireAdmin();

  const text = message.trim();
  if (!text) throw new Error("Pesan broadcast kosong.");

  const token = process.env.FONNTE_TOKEN;
  if (!token)
    throw new Error(
      "Broadcast belum aktif: FONNTE_TOKEN belum di-set. Daftar di Fonnte, salin token device, lalu isi di environment."
    );

  const audience = await getBroadcastAudience();
  const numbers = audience.map((a) => a.whatsapp);
  if (numbers.length === 0)
    throw new Error("Belum ada nomor dengan izin promo.");

  const result: BroadcastResult = {
    total: numbers.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  // Fonnte menerima banyak target (dipisah koma). Chunk agar aman.
  for (const batch of chunk(numbers, 50)) {
    try {
      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: { Authorization: token },
        body: new URLSearchParams({
          target: batch.join(","),
          message: text,
          countryCode: "62",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: boolean;
        reason?: string;
      };
      if (res.ok && data.status !== false) {
        result.sent += batch.length;
      } else {
        result.failed += batch.length;
        if (data.reason) result.errors.push(data.reason);
      }
    } catch (e) {
      result.failed += batch.length;
      result.errors.push(e instanceof Error ? e.message : "Gagal kirim batch.");
    }
  }

  return result;
}
