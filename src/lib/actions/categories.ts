"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Tidak diizinkan. Silakan login sebagai admin.");
  }
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(name: string) {
  await requireAdmin();
  const clean = name.trim();
  if (!clean) throw new Error("Nama kategori wajib diisi.");
  await prisma.category.create({ data: { name: clean } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateCategory(id: number, name: string) {
  await requireAdmin();
  const clean = name.trim();
  if (!clean) throw new Error("Nama kategori wajib diisi.");
  await prisma.category.update({ where: { id }, data: { name: clean } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
