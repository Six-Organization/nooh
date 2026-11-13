"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import {
  ALL_SIZES,
  DEFAULT_CAPACITY_MATRIX,
  type CapacityMatrix,
  type Size,
} from "@/lib/capacity";
import type { Size as PrismaSize } from "@/generated/prisma/enums";

async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Tidak diizinkan. Silakan login sebagai admin.");
  }
}

/** Ambil matrix kapasitas dari DB, lengkapi yang kosong dengan default. */
export async function getCapacityMatrix(): Promise<CapacityMatrix> {
  const rows = await prisma.capacityRule.findMany();
  const matrix: CapacityMatrix = {
    KECIL: { ...DEFAULT_CAPACITY_MATRIX.KECIL },
    SEDANG: { ...DEFAULT_CAPACITY_MATRIX.SEDANG },
    BESAR: { ...DEFAULT_CAPACITY_MATRIX.BESAR },
  };
  for (const r of rows) {
    matrix[r.alasSize as Size][r.packingSize as Size] = r.capacity;
  }
  return matrix;
}

/** Simpan seluruh matrix (9 kombinasi) — admin. */
export async function saveCapacityMatrix(matrix: CapacityMatrix) {
  await requireAdmin();
  const ops = [];
  for (const alasSize of ALL_SIZES) {
    for (const packingSize of ALL_SIZES) {
      const capacity = matrix[alasSize]?.[packingSize];
      if (!Number.isInteger(capacity) || capacity < 0)
        throw new Error(
          `Kapasitas ${alasSize}×${packingSize} tidak valid.`
        );
      ops.push(
        prisma.capacityRule.upsert({
          where: {
            alasSize_packingSize: {
              alasSize: alasSize as PrismaSize,
              packingSize: packingSize as PrismaSize,
            },
          },
          create: {
            alasSize: alasSize as PrismaSize,
            packingSize: packingSize as PrismaSize,
            capacity,
          },
          update: { capacity },
        })
      );
    }
  }
  await prisma.$transaction(ops);
  revalidatePath("/admin/kapasitas");
  revalidatePath("/rakit");
}
