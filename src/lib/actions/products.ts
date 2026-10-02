"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import type { Size } from "@/generated/prisma/enums";

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

export type ProductInput = {
  name: string;
  hpp: number;
  sellPrice: number;
  stock: number;
  imageUrl: string | null;
  size: Size | null;
  isBase: boolean;
  categoryIds: number[];
  leadTimeTiers: LeadTierInput[];
};

/** Untuk halaman admin (semua field, termasuk HPP). */
export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: true,
      leadTimeTiers: { orderBy: { minQty: "asc" } },
    },
  });
}

/** Untuk halaman customer (tanpa HPP/modal). */
export async function getCustomerProducts() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sellPrice: true,
      stock: true,
      imageUrl: true,
      size: true,
      isBase: true,
      categories: { select: { id: true, name: true } },
      leadTimeTiers: {
        orderBy: { minQty: "asc" },
        select: { minQty: true, maxQty: true, days: true },
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
  if (!input.isBase && !input.size)
    throw new Error("Item non-alas wajib punya ukuran (kecil/sedang/besar).");
  for (const t of input.leadTimeTiers) {
    if (!Number.isInteger(t.minQty) || t.minQty < 1)
      throw new Error("Tier waktu pengerjaan: minimal pcs harus >= 1.");
    if (t.maxQty != null && (!Number.isInteger(t.maxQty) || t.maxQty < t.minQty))
      throw new Error("Tier waktu pengerjaan: maks pcs harus >= min pcs.");
    if (!Number.isInteger(t.days) || t.days < 0)
      throw new Error("Tier waktu pengerjaan: hari tidak valid.");
  }
}

/** Tier hanya untuk alas; item non-alas tidak menyimpan tier. */
function tierData(input: ProductInput) {
  if (!input.isBase) return [];
  return input.leadTimeTiers.map((t) => ({
    minQty: t.minQty,
    maxQty: t.maxQty,
    days: t.days,
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
      size: input.size,
      isBase: input.isBase,
      categories: { connect: input.categoryIds.map((id) => ({ id })) },
      leadTimeTiers: { create: tierData(input) },
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
      size: input.size,
      isBase: input.isBase,
      categories: { set: input.categoryIds.map((id) => ({ id })) },
      leadTimeTiers: { deleteMany: {}, create: tierData(input) },
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
