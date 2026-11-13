"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Tidak diizinkan. Silakan login sebagai admin.");
  }
}

export type RakitTypeInput = {
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
  productIds: number[];
  fieldIds: number[];
};

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CUSTOMER_PRODUCT_SELECT = {
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
    orderBy: { minQty: "asc" as const },
    select: { minQty: true, maxQty: true, days: true },
  },
} as const;

/** Admin: semua jenis rakit + relasi. */
export async function getRakitTypes() {
  return prisma.rakitType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      products: { select: { id: true } },
      fields: { select: { id: true, name: true } },
    },
  });
}

/** Publik: jenis rakit aktif untuk halaman pemilih. */
export async function getActiveRakitTypes() {
  return prisma.rakitType.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { products: true } },
    },
  });
}

/** Publik: data builder untuk satu jenis (produk + field personalisasi). */
export async function getRakitBuilderData(slug: string) {
  const type = await prisma.rakitType.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      products: {
        where: { type: { in: ["COMPONENT", "ALAS", "PACKING"] } },
        orderBy: { name: "asc" },
        select: CUSTOMER_PRODUCT_SELECT,
      },
      fields: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          kind: true,
          required: true,
          options: {
            orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
            select: { id: true, value: true },
          },
        },
      },
    },
  });
  return type;
}

function validate(input: RakitTypeInput) {
  if (!input.name.trim()) throw new Error("Nama jenis rakit wajib diisi.");
  if (!input.slug.trim()) throw new Error("Slug wajib diisi.");
  if (!/^[a-z0-9-]+$/.test(input.slug))
    throw new Error("Slug hanya huruf kecil, angka, dan tanda hubung.");
}

export async function createRakitType(input: RakitTypeInput) {
  await requireAdmin();
  const slug = slugify(input.slug || input.name);
  validate({ ...input, slug });
  await prisma.rakitType.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      active: input.active,
      sortOrder: input.sortOrder,
      products: { connect: input.productIds.map((id) => ({ id })) },
      fields: { connect: input.fieldIds.map((id) => ({ id })) },
    },
  });
  revalidatePath("/admin/rakit");
  revalidatePath("/rakit");
}

export async function updateRakitType(id: number, input: RakitTypeInput) {
  await requireAdmin();
  const slug = slugify(input.slug || input.name);
  validate({ ...input, slug });
  await prisma.rakitType.update({
    where: { id },
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      active: input.active,
      sortOrder: input.sortOrder,
      products: { set: input.productIds.map((id) => ({ id })) },
      fields: { set: input.fieldIds.map((id) => ({ id })) },
    },
  });
  revalidatePath("/admin/rakit");
  revalidatePath("/rakit");
}

export async function deleteRakitType(id: number) {
  await requireAdmin();
  await prisma.rakitType.delete({ where: { id } });
  revalidatePath("/admin/rakit");
  revalidatePath("/rakit");
}
