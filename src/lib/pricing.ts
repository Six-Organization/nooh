// Helper harga + lead time produk bundle (jenjang per pcs).
// Satu bracket = rentang pcs dengan harga/pcs dan min. hari sebelum hari-H.

export type QtyTier = {
  minQty: number;
  maxQty: number | null; // null = tanpa batas atas
  unitPrice: number; // harga per pcs di bracket ini
  leadDays: number; // minimal hari sebelum hari-H
};

/** Cari bracket yang cocok untuk jumlah pcs; null kalau tidak ada. */
export function tierFor(tiers: QtyTier[], qty: number): QtyTier | null {
  return (
    tiers.find(
      (t) => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty)
    ) ?? null
  );
}

/** Harga satuan untuk jumlah tertentu; null kalau tak ada bracket cocok. */
export function unitPriceFor(tiers: QtyTier[], qty: number): number | null {
  return tierFor(tiers, qty)?.unitPrice ?? null;
}

/** Total harga = harga/pcs × pcs; null kalau tak ada bracket cocok. */
export function bundleTotal(tiers: QtyTier[], qty: number): number | null {
  const t = tierFor(tiers, qty);
  return t ? t.unitPrice * qty : null;
}

/** Min. hari sebelum hari-H untuk jumlah tertentu; null kalau tak ada bracket. */
export function leadDaysForQty(tiers: QtyTier[], qty: number): number | null {
  return tierFor(tiers, qty)?.leadDays ?? null;
}

/** Harga terendah ("mulai dari") dari seluruh bracket; null kalau kosong. */
export function priceFrom(tiers: QtyTier[]): number | null {
  if (tiers.length === 0) return null;
  return Math.min(...tiers.map((t) => t.unitPrice));
}

/**
 * Jumlah pcs maksimal yang masih bisa dikerjakan dalam sisa hari tertentu.
 * Dipakai untuk Ide 5 (filter produk by tanggal acara).
 * Mengembalikan null kalau tidak ada bracket yang muat (semua butuh waktu lebih).
 */
export function maxQtyWithinDays(
  tiers: QtyTier[],
  remainingDays: number
): number | null {
  // Bracket yang lead time-nya masih muat dalam sisa hari.
  const feasible = tiers.filter((t) => t.leadDays <= remainingDays);
  if (feasible.length === 0) return null;
  // Kalau ada bracket feasible tanpa batas atas → tak terbatas.
  if (feasible.some((t) => t.maxQty == null)) return Infinity;
  return Math.max(...feasible.map((t) => t.maxQty as number));
}

/** Apakah produk bundle ini masih bisa dipesan dalam sisa hari tertentu? */
export function isOrderableWithinDays(
  tiers: QtyTier[],
  remainingDays: number
): boolean {
  return tiers.some((t) => t.leadDays <= remainingDays);
}
