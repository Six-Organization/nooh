import { getActiveRakitTypes } from "@/lib/actions/rakit-types";
import { RakitChooser } from "@/components/customer/rakit-chooser";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Ornament } from "@/components/brand/ornament";

export const dynamic = "force-dynamic";

export default async function RakitPage() {
  const types = await getActiveRakitTypes();

  return (
    <>
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border">
        <Ornament className="pointer-events-none absolute -right-10 -top-8 w-[min(34vw,300px)] opacity-25" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <span className="eyebrow">Rakit sendiri</span>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.05]">
            Mau Rakit Apa?
          </h1>
          <p className="mt-3 max-w-[56ch] text-sm font-light text-muted-foreground sm:text-base">
            Pilih jenis rakitan, lalu susun sendiri sesuai hati — lihat estimasi
            harga &amp; waktu, pesan lewat WhatsApp.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <RakitChooser
          types={types.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            description: t.description,
            count: t._count.products,
          }))}
        />
      </main>

      <SiteFooter />
    </>
  );
}
