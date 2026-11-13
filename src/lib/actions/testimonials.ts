"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import type { MediaKind } from "@/generated/prisma/enums";

async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Tidak diizinkan. Silakan login sebagai admin.");
  }
}

export type TestimonialInput = {
  name: string | null;
  caption: string | null;
  kind: MediaKind;
  mediaUrl: string;
  posterUrl: string | null;
  active: boolean;
  sortOrder: number;
};

/** Admin: semua testimoni. */
export async function getTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

/** Publik: testimoni aktif untuk landing. */
export async function getActiveTestimonials() {
  return prisma.testimonial.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      caption: true,
      kind: true,
      mediaUrl: true,
      posterUrl: true,
    },
  });
}

function validate(input: TestimonialInput) {
  if (!input.mediaUrl.trim())
    throw new Error("Media (foto/video) wajib diisi.");
}

export async function createTestimonial(input: TestimonialInput) {
  await requireAdmin();
  validate(input);
  await prisma.testimonial.create({
    data: {
      name: input.name?.trim() || null,
      caption: input.caption?.trim() || null,
      kind: input.kind,
      mediaUrl: input.mediaUrl.trim(),
      posterUrl: input.posterUrl?.trim() || null,
      active: input.active,
      sortOrder: input.sortOrder,
    },
  });
  revalidatePath("/admin/testimoni");
  revalidatePath("/");
}

export async function updateTestimonial(id: number, input: TestimonialInput) {
  await requireAdmin();
  validate(input);
  await prisma.testimonial.update({
    where: { id },
    data: {
      name: input.name?.trim() || null,
      caption: input.caption?.trim() || null,
      kind: input.kind,
      mediaUrl: input.mediaUrl.trim(),
      posterUrl: input.posterUrl?.trim() || null,
      active: input.active,
      sortOrder: input.sortOrder,
    },
  });
  revalidatePath("/admin/testimoni");
  revalidatePath("/");
}

export async function deleteTestimonial(id: number) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimoni");
  revalidatePath("/");
}
