import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Upload foto belum aktif: BLOB_READ_WRITE_TOKEN belum di-set. Buat Blob store di Vercel lalu isi token-nya.",
      },
      { status: 400 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const folderRaw = form.get("folder");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "File harus berupa gambar atau video." },
      { status: 400 }
    );
  }

  // Folder di-whitelist agar tidak sembarang path.
  const folder =
    folderRaw === "testimonials" ? "testimonials" : "products";

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url, kind: isVideo ? "VIDEO" : "PHOTO" });
}
