"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ALAS_CAPACITY, ITEM_POINTS, type Size } from "@/lib/capacity";
import type { LeadTier } from "@/lib/leadtime";

export type ParcelBase = {
  id: number;
  name: string;
  sellPrice: number;
  imageUrl: string | null;
  size: Size; // kapasitas alas
  tiers: LeadTier[]; // waktu pengerjaan per pcs
};

export type ParcelItem = {
  id: number;
  name: string;
  sellPrice: number;
  imageUrl: string | null;
  size: Size; // ukuran item
  qty: number;
};

type ParcelState = {
  base: ParcelBase | null;
  items: Record<number, ParcelItem>;
  pcs: number; // jumlah salinan parcel yang dipesan
  deliveryDate: string; // yyyy-mm-dd tanggal ambil/kirim
  setBase: (base: ParcelBase) => void;
  clearBase: () => void;
  setPcs: (pcs: number) => void;
  setDeliveryDate: (date: string) => void;
  add: (item: Omit<ParcelItem, "qty">) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

export const useParcel = create<ParcelState>()(
  persist(
    (set) => ({
      base: null,
      items: {},
      pcs: 1,
      deliveryDate: "",
      setBase: (base) => set({ base }),
      clearBase: () => set({ base: null, items: {}, pcs: 1, deliveryDate: "" }),
      setPcs: (pcs) => set({ pcs: pcs < 1 ? 1 : Math.floor(pcs) }),
      setDeliveryDate: (deliveryDate) => set({ deliveryDate }),
      add: (item) =>
        set((state) => {
          const existing = state.items[item.id];
          return {
            items: {
              ...state.items,
              [item.id]: existing
                ? { ...existing, qty: existing.qty + 1 }
                : { ...item, qty: 1 },
            },
          };
        }),
      setQty: (id, qty) =>
        set((state) => {
          if (qty <= 0) {
            const rest = { ...state.items };
            delete rest[id];
            return { items: rest };
          }
          const current = state.items[id];
          if (!current) return state;
          return { items: { ...state.items, [id]: { ...current, qty } } };
        }),
      remove: (id) =>
        set((state) => {
          const rest = { ...state.items };
          delete rest[id];
          return { items: rest };
        }),
      clear: () => set({ base: null, items: {}, pcs: 1, deliveryDate: "" }),
    }),
    { name: "noh-parcel" }
  )
);

export function parcelItemList(items: Record<number, ParcelItem>): ParcelItem[] {
  return Object.values(items);
}

/** Total poin yang sudah dipakai item di dalam parcel. */
export function usedPoints(items: Record<number, ParcelItem>): number {
  return parcelItemList(items).reduce(
    (sum, i) => sum + ITEM_POINTS[i.size] * i.qty,
    0
  );
}

/** Kapasitas poin alas terpilih (0 kalau belum pilih alas). */
export function capacityOf(base: ParcelBase | null): number {
  return base ? ALAS_CAPACITY[base.size] : 0;
}

/** Harga satu parcel = harga alas + total harga item. */
export function parcelUnitTotal(
  base: ParcelBase | null,
  items: Record<number, ParcelItem>
): number {
  const itemsTotal = parcelItemList(items).reduce(
    (sum, i) => sum + i.sellPrice * i.qty,
    0
  );
  return (base?.sellPrice ?? 0) + itemsTotal;
}

/** Total harga = harga per parcel x jumlah pcs. */
export function parcelTotal(
  base: ParcelBase | null,
  items: Record<number, ParcelItem>,
  pcs: number
): number {
  return parcelUnitTotal(base, items) * Math.max(1, pcs);
}
