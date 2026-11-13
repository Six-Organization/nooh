"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import type { Size, ProductType } from "@/generated/prisma/enums";

async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Tidak diizinkan. Silakan login sebagai admin.");
  }
}

export type LeadTierInput = {
  minQty: number;
  maxQty: number | null;
  days: number;
};

export type QtyTierInput = {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
  leadDays: number;
};

export type ProductInput = {
  name: string;
  hpp: number;
  sellPrice: number;
  stock: number;
  imageUrl: string | null;
  size: Size | null;
  type: ProductType;
  categoryIds: number[];
  leadTimeTiers: LeadTierInput[]; // khusus ALAS
  quantityTiers: QtyTierInput[]; // khusus BUNDLE
};

/** Untuk halaman admin (semua field, termasuk HPP). */
export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: true,
      leadTimeTiers: { orderBy: { minQty: "asc" } },
      quantityTiers: { orderBy: { minQty: "asc" } },
    },
  });
}

/** Untuk halaman customer rakit (komponen + alas, tanpa HPP/modal). */
export async function getCustomerProducts() {
  return prisma.product.findMany({
    where: { type: { in: ["COMPONENT", "ALAS"] } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sellPrice: true,
      stock: true,
      imageUrl: true,
      size: true,
      isBase: true,
      type: true,
      categories: { select: { id: true, name: true } },
      leadTimeTiers: {
        orderBy: { minQty: "asc" },
        select: { minQty: true, maxQty: true, days: true },
      },
    },
  });
}

/** Untuk halaman katalog bundle (tanpa HPP/modal). */
export async function getBundleProducts() {
  return prisma.product.findMany({
    where: { type: "BUNDLE" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sellPrice: true,
      stock: true,
      imageUrl: true,
      categories: { select: { id: true, name: true } },
      quantityTiers: {
        orderBy: { minQty: "asc" },
        select: { minQty: true, maxQty: true, unitPrice: true, leadDays: true },
      },
    },
  });
}

function validate(input: ProductInput) {
  if (!input.name.trim()) throw new Error("Nama produk wajib diisi.");
  if (!Number.isFinite(input.hpp) || input.hpp < 0)
    throw new Error("HPP tidak valid.");
  if (!Number.isFinite(input.sellPrice) || input.sellPrice < 0)
    throw new Error("Harga jual tidak valid.");
  if (!Number.isInteger(input.stock) || input.stock < 0)
    throw new Error("Stok tidak valid.");

  if (input.type === "COMPONENT" && !input.size)
    throw new Error("Item satuan wajib punya ukuran (kecil/sedang/besar).");

  if (input.type === "ALAS") {
    for (const t of input.leadTimeTiers) {
      if (!Number.isInteger(t.minQty) || t.minQty < 1)
        throw new Error("Tier waktu pengerjaan: minimal pcs harus >= 1.");
      if (
        t.maxQty != null &&
        (!Number.isInteger(t.maxQty) || t.maxQty < t.minQty)
      )
        throw new Error("Tier waktu pengerjaan: maks pcs harus >= min pcs.");
      if (!Number.isInteger(t.days) || t.days < 0)
        throw new Error("Tier waktu pengerjaan: hari tidak valid.");
    }
  }

  if (input.type === "BUNDLE") validateBundleTiers(input.quantityTiers);
}

/**
 * Jenjang bundle wajib: minimal 1 baris, mulai dari pcs 1, nyambung tanpa
 * celah/tumpang-tindih, dan tepat satu bracket tanpa batas atas (paling akhir).
 */
function validateBundleTiers(tiers: QtyTierInput[]) {
  if (tiers.length === 0)
    throw new Error("Produk bundle wajib punya minimal 1 jenjang harga.");

  for (const t of tiers) {
    if (!Number.isInteger(t.minQty) || t.minQty < 1)
      throw new Error("Jenjang: minimal pcs harus >= 1.");
    if (t.maxQty != null && (!Number.isInteger(t.maxQty) || t.maxQty < t.minQty))
      throw new Error("Jenjang: maks pcs harus >= min pcs.");
    if (!Number.isFinite(t.unitPrice) || t.unitPrice <= 0)
      throw new Error("Jenjang: harga/pcs harus lebih dari 0.");
    if (!Number.isInteger(t.leadDays) || t.leadDays < 0)
      throw new Error("Jenjang: hari tidak valid.");
  }

  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  if (sorted[0].minQty !== 1)
    throw new Error("Jenjang pertama harus mulai dari 1 pcs.");

  const openEnded = sorted.filter((t) => t.maxQty == null);
  if (openEnded.length !== 1)
    throw new Error(
      "Harus ada tepat satu jenjang tanpa batas atas (mis. 100+)."
    );
  if (sorted[sorted.length - 1].maxQty != null)
    throw new Error("Jenjang tanpa batas atas harus berada di urutan terakhir.");

  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    if (cur.maxQty == null)
      throw new Error("Hanya jenjang terakhir yang boleh tanpa batas atas.");
    if (next.minQty !== cur.maxQty + 1)
      throw new Error(
        `Jenjang harus nyambung tanpa celah: setelah ${cur.maxQty} pcs harus mulai ${cur.maxQty + 1}.`
      );
  }
}

function leadTierData(input: ProductInput) {
  if (input.type !== "ALAS") return [];
  return input.leadTimeTiers.map((t) => ({
    minQty: t.minQty,
    maxQty: t.maxQty,
    days: t.days,
  }));
}

function qtyTierData(input: ProductInput) {
  if (input.type !== "BUNDLE") return [];
  return input.quantityTiers.map((t) => ({
    minQty: t.minQty,
    maxQty: t.maxQty,
    unitPrice: t.unitPrice,
    leadDays: t.leadDays,
  }));
}

export async function createProduct(input: ProductInput) {
  await requireAdmin();
  validate(input);
  await prisma.product.create({
    data: {
      name: input.name.trim(),
      hpp: input.hpp,
      sellPrice: input.sellPrice,
      stock: input.stock,
      imageUrl: input.imageUrl,
      size: input.type === "BUNDLE" ? null : input.size,
      isBase: input.type === "ALAS",
      type: input.type,
      categories: { connect: input.categoryIds.map((id) => ({ id })) },
      leadTimeTiers: { create: leadTierData(input) },
      quantityTiers: { create: qtyTierData(input) },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProduct(id: number, input: ProductInput) {
  await requireAdmin();
  validate(input);
  await prisma.product.update({
    where: { id },
    data: {
      name: input.name.trim(),
      hpp: input.hpp,
      sellPrice: input.sellPrice,
      stock: input.stock,
      imageUrl: input.imageUrl,
      size: input.type === "BUNDLE" ? null : input.size,
      isBase: input.type === "ALAS",
      type: input.type,
      categories: { set: input.categoryIds.map((id) => ({ id })) },
      leadTimeTiers: { deleteMany: {}, create: leadTierData(input) },
      quantityTiers: { deleteMany: {}, create: qtyTierData(input) },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}
