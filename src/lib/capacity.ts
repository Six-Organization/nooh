// Aturan kapasitas parcel (sistem poin/slot).
// Ubah angka di sini untuk menyesuaikan bisnis.

export type Size = "KECIL" | "SEDANG" | "BESAR";

export const SIZE_LABELS: Record<Size, string> = {
  KECIL: "Kecil",
  SEDANG: "Sedang",
  BESAR: "Besar",
};

/** Berapa poin yang dimakan tiap item berdasarkan ukurannya. */
export const ITEM_POINTS: Record<Size, number> = {
  KECIL: 1,
  SEDANG: 2,
  BESAR: 3,
};

/** Total poin kapasitas tiap alas (lama; kini kapasitas pakai matrix alas×packing). */
export const ALAS_CAPACITY: Record<Size, number> = {
  KECIL: 4,
  SEDANG: 8,
  BESAR: 12,
};

/** Matrix kapasitas = poin untuk tiap kombinasi ukuran alas × ukuran packing. */
export type CapacityMatrix = Record<Size, Record<Size, number>>;

/** Default matrix (dipakai kalau admin belum set). Baris = alas, kolom = packing. */
export const DEFAULT_CAPACITY_MATRIX: CapacityMatrix = {
  KECIL: { KECIL: 6, SEDANG: 8, BESAR: 10 },
  SEDANG: { KECIL: 10, SEDANG: 12, BESAR: 14 },
  BESAR: { KECIL: 14, SEDANG: 16, BESAR: 18 },
};

/** Kapasitas poin untuk kombinasi alas×packing; 0 kalau tak ada. */
export function capacityFor(
  matrix: CapacityMatrix,
  alasSize: Size | null,
  packingSize: Size | null
): number {
  if (!alasSize || !packingSize) return 0;
  return matrix[alasSize]?.[packingSize] ?? 0;
}

export const ALL_SIZES: Size[] = ["KECIL", "SEDANG", "BESAR"];
