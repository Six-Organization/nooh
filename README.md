# NOOH — Souvenir & Hampers

Website company profile + perakit **custom parcel**. Customer memilih alas (bokor/dulang),
mengisinya dengan dupa Lavanya & pelengkap, melihat estimasi harga + waktu pengerjaan,
lalu checkout via **WhatsApp**. Admin mengelola produk & kategori.

- `/` — landing company profile
- `/rakit` — perakit parcel
- `/admin` — dashboard admin (login)

## Stack

Next.js 16 (App Router, TS) · Tailwind v4 · shadcn/ui · Zustand · Prisma 7 → Neon Postgres · Vercel Blob.

## Menjalankan lokal

Butuh **Node 22** (lihat `.nvmrc`).

```bash
nvm use
npm install
cp .env.example .env   # lalu isi nilainya
npx prisma migrate dev
npm run dev
```

## Environment variables

Lihat `.env.example`:

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Koneksi Neon (pooled) untuk runtime |
| `DIRECT_URL` | Koneksi Neon langsung (non-pooled) untuk migrasi |
| `ADMIN_PASSWORD` | Password login admin |
| `SESSION_SECRET` | Secret cookie sesi (acak) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Nomor WA admin, format `6281234567890` |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob (upload foto produk) |

## Deploy ke Vercel

1. Import repo ini di Vercel (framework terdeteksi otomatis: Next.js).
2. Isi **semua** environment variables di atas pada Project Settings → Environment Variables.
3. Buat **Blob store** (Storage → Blob) agar `BLOB_READ_WRITE_TOKEN` terisi (untuk upload foto).
4. Deploy. Node 22 dipakai otomatis via `engines` / `.nvmrc`.
   `prisma generate` berjalan saat build (`postinstall` + build script).

Database Neon sudah berisi skema terbaru. Jika ada migrasi baru, jalankan
`npx prisma migrate deploy` terhadap database produksi.
