@AGENTS.md

# noh-app

Website rakit **custom parcel**: customer memilih & mencampur produk satuan, melihat estimasi harga (Σ harga jual × qty), lalu checkout via **WhatsApp**. Admin (login) mengelola produk & kategori.

## Stack
Next.js 16 (App Router, TS, `src/`, alias `@/*`) · Tailwind v4 · shadcn/ui (pakai `@base-ui`, jadi gunakan prop `render`, BUKAN `asChild`) · Zustand · Prisma 7 → Neon Postgres · Vercel Blob (foto).

## Tema brand (NOOH × Lavanya) — light + dark
Maroon + emas, dua mode. `src/app/globals.css`: `:root` = LIGHT (parchment/cream, emas dalam), `.dark` = NIGHT (maroon) → semua komponen shadcn ikut otomatis. Toggle: `next-themes` via `src/components/theme-provider.tsx` (di `layout.tsx`, `attribute="class"`, `defaultTheme="dark"`, `enableSystem=false`, `html suppressHydrationWarning`) + `src/components/theme-toggle.tsx` (pakai guard `mounted` + aria-label stabil agar tak mismatch hidrasi) di topbar customer, admin dash, & login.
Token theme-aware: `--gold`/`--gold-hi` (emas dalam di light untuk kontras teks), `--page-bg`, `--topbar-bg`, `--footer-bg`. `.thumb-bg` sengaja tetap maroon gelap di kedua mode (tile produk). Font di `layout.tsx`: Jost (`--font-jost`), Cormorant Garamond (`--font-cormorant`, `font-serif`/heading), Great Vibes (`--font-great-vibes`, `font-script`). Helper: `.gold-text`, `.btn-gold-grad`, `.thumb-bg`, `.eyebrow`. Ornamen batik: `src/components/brand/ornament.tsx`; wordmark: `src/components/brand/wordmark.tsx`. Hero + topbar + footer di `page.tsx`.

## Wajib
- **Node 22** (`.nvmrc`). Jalankan `nvm use` sebelum `npm`/`next`. Node 21 bikin Prisma 7 gagal.
- Prisma 7 pakai driver adapter `@prisma/adapter-pg` (`src/lib/prisma.ts`) + generator baru `prisma-client` → output `src/generated/prisma` (gitignored; `postinstall: prisma generate`). Config di `prisma7.config.ts` (datasource hanya `url`).

## Struktur
- `src/app/page.tsx` — **landing company profile** (statis): hero + foto, Tentang, Koleksi (galeri), Keunggulan, CTA. Foto di `public/assets/*.jpeg` (bokor/dulang).
- `src/app/rakit/page.tsx` — **penyusun parcel** (`force-dynamic`) → `src/components/customer/customer-store.tsx`
- Header/footer dipakai-ulang: `src/components/site/{site-header,site-footer}.tsx` (header punya CTA "Rakit Parcel" → `/rakit` + toggle tema + Admin)
- `src/app/admin/login` — login; `src/app/admin/(dash)/{products,categories}` — dashboard (dilindungi `src/middleware.ts`). Products page punya stat tiles (total produk/alas/kategori/nilai stok). Nav aktif: `src/components/admin/admin-nav.tsx`. Form produk: `MoneyInput` (prefix Rp) + indikator untung/markup live; tabel dibungkus `overflow-x-auto` (responsif).
- `src/lib/actions/{products,categories,auth}.ts` — server actions (cek `isAuthenticated()` untuk mutasi)
- `src/store/parcel.ts` — Zustand (persist localStorage)
- `src/app/api/upload/route.ts` — upload foto ke Vercel Blob

## Data
Model `Product` (name, hpp, sellPrice, stock, imageUrl?, `size` enum `Size?`, `isBase` bool) ↔ `Category` (many-to-many). Alas (`isBase=true`) juga punya `LeadTimeTier[]` (waktu pengerjaan: `{minQty, maxQty?, days}`, `maxQty` null = tanpa batas atas). `size` = ukuran item / kapasitas alas. Item non-alas wajib punya `size` (divalidasi di `products.ts` & form). Migrasi: `npx prisma migrate dev`.

## Aturan parcel (customer)
1 alas per parcel + sistem **poin**. Angka di `src/lib/capacity.ts`: `ITEM_POINTS` (kecil=1, sedang=2, besar=3), `ALAS_CAPACITY` (kecil=4, sedang=8, besar=12). Customer pilih alas → isi item (total poin ≤ kapasitas) → isi **pcs** & **tanggal ambil**. Waktu pengerjaan dihitung dari tier alas sesuai pcs (helper `src/lib/leadtime.ts`, hari kalender). Kalau `tanggal < hari ini + leadDays` → popup blokir checkout + tombol "Nego via WA". Total = (alas + item) × pcs. Semua di `customer-store.tsx`.

## Env (`.env`, contoh di `.env.example`)
`DATABASE_URL`, `DIRECT_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `BLOB_READ_WRITE_TOKEN`.
