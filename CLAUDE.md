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
- `src/app/page.tsx` — **landing company profile** (`force-dynamic`): hero (kanan = kolase 2×2 produk **bundle** → klik ke `/katalog`, fallback foto `public/assets/*.jpeg`), Tentang, Koleksi (galeri), Keunggulan, CTA.
- `src/app/rakit/page.tsx` — **penyusun parcel** custom (`force-dynamic`) → `src/components/customer/customer-store.tsx`
- `src/app/katalog/page.tsx` — **katalog produk bundle/jadi** (`force-dynamic`) → `src/components/customer/bundle-catalog.tsx`. Alur: pilih **tanggal acara** dulu → produk difilter by sisa waktu (jenjang yang lead time-nya > sisa waktu dicoret) → input pcs → harga/pcs & total per jenjang → checkout WA / Nego WA.
- Header/footer dipakai-ulang: `src/components/site/{site-header,site-footer}.tsx` (header punya CTA "Rakit Parcel" → `/rakit` + toggle tema + Admin)
- `src/app/admin/login` — login; `src/app/admin/(dash)/{products,categories,kapasitas,bookings}` — dashboard (dilindungi `src/middleware.ts`). **Kapasitas**: editor matrix 3×3 (ukuran alas × packing → poin). **Bookings**: daftar nomor WA + ringkasan pesanan customer (model `Booking`), tombol salin nomor ber-consent (bekal broadcast). Products page punya stat tiles (total produk/alas/kategori/nilai stok). Nav aktif: `src/components/admin/admin-nav.tsx`. Form produk: `MoneyInput` (prefix Rp) + indikator untung/markup live; tabel dibungkus `overflow-x-auto` (responsif).
- `src/lib/actions/{products,categories,auth,bookings}.ts` — server actions (cek `isAuthenticated()` untuk mutasi; `createBooking` publik). Checkout customer (katalog & rakit) lewat `src/components/customer/checkout-dialog.tsx`: minta nama + nomor WA + consent → simpan `Booking` → buka WhatsApp.
- `src/store/parcel.ts` — Zustand (persist localStorage)
- `src/app/api/upload/route.ts` — upload foto ke Vercel Blob

## Data
Model `Product` (name, hpp, sellPrice, stock, imageUrl?, `size` enum `Size?`, `isBase` bool, `type` enum `ProductType`) ↔ `Category` (many-to-many). **`ProductType`**: `COMPONENT` (item satuan rakit), `ALAS` (base parcel), `PACKING` (pembungkus, dipilih bareng alas; punya ukuran+harga), `BUNDLE` (produk jadi/katalog). Model `CapacityRule` (`alasSize`,`packingSize`,`capacity`, unique) = matrix kapasitas rakit custom. `isBase` disinkron otomatis dengan `type=ALAS` (server action set keduanya). Alas punya `LeadTimeTier[]` (`{minQty, maxQty?, days}`). Bundle punya `QuantityTier[]` (`{minQty, maxQty?, unitPrice, leadDays}`) — jenjang harga+lead time per pcs; divalidasi di `products.ts` (mulai dari 1, nyambung tanpa celah, tepat satu tanpa batas atas). Bundle `sellPrice` diisi otomatis = harga jenjang terendah (tampilan "mulai dari"), `size` null. Helper harga bundle: `src/lib/pricing.ts` (`tierFor`, `bundleTotal`, `priceFrom`, `maxQtyWithinDays`, `isOrderableWithinDays`). `maxQty` null = tanpa batas atas. Item `COMPONENT` wajib punya `size`. Migrasi: `npx prisma migrate dev`.

## Aturan parcel (customer)
1 alas + **1 packing** per parcel + sistem **poin**. `src/lib/capacity.ts`: `ITEM_POINTS` (kecil=1, sedang=2, besar=3). **Kapasitas = matrix kombinasi ukuran alas × ukuran packing** (`capacityFor`), bukan lagi `ALAS_CAPACITY` (konstanta lama masih ada tapi tak dipakai custom). Matrix disimpan di model `CapacityRule` (9 baris 3×3), default `DEFAULT_CAPACITY_MATRIX` kalau DB kosong; dikelola admin di `/admin/kapasitas` (`src/lib/actions/capacity.ts`). Customer: pilih alas → pilih packing → isi item (total poin ≤ kapasitas matrix) → isi **pcs** & **tanggal ambil**. Waktu pengerjaan dari tier alas sesuai pcs (`src/lib/leadtime.ts`). Kalau `tanggal < hari ini + leadDays` → popup blokir + "Nego via WA". Total = (alas + packing + item) × pcs. Store `src/store/parcel.ts` (punya `base`, `packing`, `items`); UI `customer-store.tsx` (matrix via context, `getCapacityMatrix` dari `rakit/page.tsx`).

## Env (`.env`, contoh di `.env.example`)
`DATABASE_URL`, `DIRECT_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `BLOB_READ_WRITE_TOKEN`.
