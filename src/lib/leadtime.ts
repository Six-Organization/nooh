// Helper waktu pengerjaan (lead time) alas. Pakai hari kalender.

export type LeadTier = {
  minQty: number;
  maxQty: number | null; // null = tanpa batas atas
  days: number;
};

/** Cari tier yang cocok untuk jumlah pcs; null kalau tidak ada. */
export function leadDaysFor(tiers: LeadTier[], qty: number): number | null {
  const tier = tiers.find(
    (t) => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty)
  );
  return tier ? tier.days : null;
}

/** Tanggal hari ini (lokal) sebagai yyyy-mm-dd. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Tanggal paling cepat bisa jadi = hari ini + days (hari kalender). */
export function earliestDateISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Format Date -> yyyy-mm-dd berdasarkan waktu lokal (bukan UTC). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Format yyyy-mm-dd -> "24 Sep 2026". */
export function formatDateID(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
