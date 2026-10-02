import { getCustomerProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { CustomerStore } from "@/components/customer/customer-store";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Ornament } from "@/components/brand/ornament";

export const dynamic = "force-dynamic";

export default async function RakitPage() {
  const [products, categories] = await Promise.all([
    getCustomerProducts(),
    getCategories(),
  ]);

  return (
    <>
      <SiteHeader />

      {/* Header ringkas */}
      <section className="relative overflow-hidden border-b border-border">
        <Ornament className="pointer-events-none absolute -right-10 -top-8 w-[min(34vw,300px)] opacity-25" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <span className="eyebrow">Langkah demi langkah</span>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.05]">
            Rakit Parcel Kamu
          </h1>
          <p className="mt-3 max-w-[56ch] text-sm font-light text-muted-foreground sm:text-base">
            Pilih alas, isi dengan dupa Lavanya &amp; pelengkap, lihat estimasi
            harga dan waktu pengerjaan, lalu pesan lewat WhatsApp.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <CustomerStore
          products={products}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </main>

      <SiteFooter />
    </>
  );
}
