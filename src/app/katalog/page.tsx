import { getBundleProducts } from "@/lib/actions/products";
import { BundleCatalog } from "@/components/customer/bundle-catalog";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Ornament } from "@/components/brand/ornament";

export const dynamic = "force-dynamic";

export default async function KatalogPage() {
  const products = await getBundleProducts();

  return (
    <>
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border">
        <Ornament className="pointer-events-none absolute -right-10 -top-8 w-[min(34vw,300px)] opacity-25" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <span className="eyebrow">Produk jadi</span>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.05]">
            Katalog Parcel
          </h1>
          <p className="mt-3 max-w-[56ch] text-sm font-light text-muted-foreground sm:text-base">
            Pilih tanggal acara, lalu lihat produk yang masih bisa dikerjakan
            tepat waktu. Makin banyak pcs, makin hemat per pcs-nya.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <BundleCatalog products={products} />
      </main>

      <SiteFooter />
    </>
  );
}
