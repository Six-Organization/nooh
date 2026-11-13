"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import type { FieldKind } from "@/generated/prisma/enums";

async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Tidak diizinkan. Silakan login sebagai admin.");
  }
}

export type FieldInput = {
  name: string;
  kind: FieldKind;
  required: boolean;
  sortOrder: number;
  options: string[]; // hanya untuk kind SELECT
};

/** Admin: semua field personalisasi + opsinya. */
export async function getPersonalizationFields() {
  return prisma.personalizationField.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      options: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      rakitTypes: { select: { id: true, name: true } },
    },
  });
}

function validate(input: FieldInput) {
  if (!input.name.trim()) throw new Error("Nama field wajib diisi.");
  if (input.kind === "SELECT") {
    const opts = input.options.map((o) => o.trim()).filter(Boolean);
    if (opts.length === 0)
      throw new Error("Field pilihan wajib punya minimal 1 opsi.");
  }
}

function optionData(input: FieldInput) {
  if (input.kind !== "SELECT") return [];
  return input.options
    .map((o) => o.trim())
    .filter(Boolean)
    .map((value, i) => ({ value, sortOrder: i }));
}

export async function createField(input: FieldInput) {
  await requireAdmin();
  validate(input);
  await prisma.personalizationField.create({
    data: {
      name: input.name.trim(),
      kind: input.kind,
      required: input.required,
      sortOrder: input.sortOrder,
      options: { create: optionData(input) },
    },
  });
  revalidatePath("/admin/personalisasi");
  revalidatePath("/rakit");
}

export async function updateField(id: number, input: FieldInput) {
  await requireAdmin();
  validate(input);
  await prisma.personalizationField.update({
    where: { id },
    data: {
      name: input.name.trim(),
      kind: input.kind,
      required: input.required,
      sortOrder: input.sortOrder,
      options: { deleteMany: {}, create: optionData(input) },
    },
  });
  revalidatePath("/admin/personalisasi");
  revalidatePath("/rakit");
}

export async function deleteField(id: number) {
  await requireAdmin();
  await prisma.personalizationField.delete({ where: { id } });
  revalidatePath("/admin/personalisasi");
  revalidatePath("/rakit");
}
