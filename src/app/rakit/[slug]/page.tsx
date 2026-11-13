import { notFound } from "next/navigation";
import { getRakitBuilderData } from "@/lib/actions/rakit-types";
import { getCapacityMatrix } from "@/lib/actions/capacity";
import { CustomerStore } from "@/components/customer/customer-store";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Ornament } from "@/components/brand/ornament";

export const dynamic = "force-dynamic";

export default async function RakitBuilderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [type, matrix] = await Promise.all([
    getRakitBuilderData(slug),
    getCapacityMatrix(),
  ]);

  if (!type) notFound();

  // Kategori diambil dari produk jenis ini (hindari chip kategori kosong).
  const catMap = new Map<number, string>();
  for (const p of type.products)
    for (const c of p.categories) catMap.set(c.id, c.name);
  const categories = Array.from(catMap, ([id, name]) => ({ id, name })).sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  return (
    <>
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border">
        <Ornament className="pointer-events-none absolute -right-10 -top-8 w-[min(34vw,300px)] opacity-25" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <span className="eyebrow">Rakit · {type.name}</span>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.05]">
            Rakit {type.name}
          </h1>
          <p className="mt-3 max-w-[56ch] text-sm font-light text-muted-foreground sm:text-base">
            {type.description ??
              "Pilih tanggal acara, alas & packing, isi item, lalu pesan lewat WhatsApp."}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <CustomerStore
          products={type.products}
          categories={categories}
          matrix={matrix}
          rakitTypeName={type.name}
          fields={type.fields}
        />
      </main>

      <SiteFooter />
    </>
  );
}
