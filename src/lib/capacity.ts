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

/** Total poin kapasitas tiap alas berdasarkan ukurannya. */
export const ALAS_CAPACITY: Record<Size, number> = {
  KECIL: 4,
  SEDANG: 8,
  BESAR: 12,
};
