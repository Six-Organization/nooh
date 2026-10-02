import Link from "next/link";
import { Sparkles, Gem, Package, MessageCircle, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Ornament } from "@/components/brand/ornament";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "NOOH — Souvenir & Hampers Bali",
  description:
    "Bokor, dulang, dan parcel upacara dirangkai tangan dengan dupa Lavanya. Rakit parcel istimewamu sendiri.",
};

const GALLERY = [
  { src: "/assets/bokor-maroon.jpeg", title: "Bokor Ukir Maroon", desc: "Baki bundar klasik dengan ukiran emas." },
  { src: "/assets/dulang-ungu.jpeg", title: "Dulang Kotak Ungu", desc: "Wadah persegi bertutup, elegan." },
  { src: "/assets/bokor-warna.jpeg", title: "Bokor Aneka Warna", desc: "Pilihan warna cerah untuk setiap acara." },
  { src: "/assets/dulang-hitam.jpeg", title: "Dulang Hitam Emas", desc: "Nuansa mewah untuk hampers istimewa." },
];

const FEATURES = [
  { icon: Sparkles, title: "Dirangkai Tangan", desc: "Tiap bokor & dulang dikerjakan dengan detail ukiran emas." },
  { icon: Gem, title: "Harga Grosir", desc: "Langsung dari perajin — ramah untuk reseller & acara besar." },
  { icon: Package, title: "Custom Parcel", desc: "Pilih alas, isi sendiri, lihat estimasi harga seketika." },
  { icon: MessageCircle, title: "Pesan via WhatsApp", desc: "Checkout cepat dan bisa nego langsung dengan admin." },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <Ornament className="pointer-events-none absolute -left-10 -top-8 w-[min(42vw,380px)] opacity-40" />
        <Ornament className="pointer-events-none absolute -bottom-20 -right-12 w-[min(38vw,340px)] rotate-180 opacity-20" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="eyebrow">Souvenir &amp; Hampers · Bali</span>
            <h1 className="mt-4 font-serif text-[clamp(2.6rem,6.5vw,4.8rem)] font-semibold leading-[1.02] text-balance">
              <span className="mb-[-0.15em] block font-script text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[0.8] text-[color:var(--gold-hi)]">
                kemewahan tradisi
              </span>
              Dalam Setiap Rangkaian.
            </h1>
            <p className="mt-6 max-w-[52ch] text-base font-light text-muted-foreground sm:text-lg">
              NOOH menghadirkan bokor, dulang, dan perlengkapan upacara bercita
              rasa tinggi — dipadukan dupa{" "}
              <span className="font-script text-xl text-[color:var(--gold-hi)]">
                Lavanya
              </span>
              . Rangkai parcel persembahanmu sendiri, sesuai hati.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/rakit"
                className="btn-gold-grad inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                Rakit Parcel Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#koleksi"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] px-6 py-3 text-sm font-medium text-[color:var(--gold-hi)] transition hover:-translate-y-0.5 hover:bg-accent"
              >
                Lihat Koleksi
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-7">
              <Stat n="120+" l="Item Pilihan" />
              <div className="w-px bg-border" />
              <Stat n="Handmade" l="Ukiran Emas" />
              <div className="w-px bg-border" />
              <Stat n="Grosir" l="Harga Perajin" />
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[26px] bg-[color:var(--gold)] opacity-10 blur-2xl" />
            <div className="overflow-hidden rounded-[22px] border border-[color:var(--line-strong)] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/bokor-maroon.jpeg"
                alt="Koleksi bokor ukir maroon & emas NOOH"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div className="order-2 overflow-hidden rounded-[22px] border border-[color:var(--line-strong)] lg:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/dulang-ungu.jpeg"
              alt="Dulang kotak ungu berukir emas"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow">Tentang NOOH</span>
            <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-tight text-balance">
              Warisan Rasa, Dirangkai dengan Hati.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Dari Pulau Dewata, kami merangkai bokor dan dulang berukir emas
              untuk persembahan, hantaran, dan hampers perayaan. Setiap keping
              dikerjakan perajin lokal dengan detail yang tak tergesa.
            </p>
            <p className="mt-3 text-muted-foreground">
              Bersama <span className="font-script text-xl text-[color:var(--gold-hi)]">Lavanya</span>{" "}
              Dupa Grosir, kami melengkapi setiap rangkaian dengan wangi dupa
              pilihan — menjadikan tiap parcel utuh, bermakna, dan siap
              dipersembahkan.
            </p>
            <Link
              href="/rakit"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--gold-hi)] hover:underline"
            >
              Mulai merangkai <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* KOLEKSI */}
      <section id="koleksi" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <span className="eyebrow">Koleksi Alas</span>
            <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3rem)] font-semibold">
              Pilihan Bokor &amp; Dulang
            </h2>
            <p className="mx-auto mt-3 max-w-[48ch] text-sm text-muted-foreground">
              Beragam bentuk, ukuran, dan warna — dasar sempurna untuk parcel
              pilihanmu.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {GALLERY.map((g) => (
              <Card key={g.src} className="gap-0 overflow-hidden p-0">
                <div className="overflow-hidden border-b border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.src}
                    alt={g.title}
                    className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold leading-tight">
                    {g.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{g.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <span className="eyebrow">Kenapa NOOH</span>
            <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3rem)] font-semibold">
              Dibuat untuk Momen Istimewa
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="gap-2 p-5">
                <span className="btn-gold-grad flex h-11 w-11 items-center justify-center rounded-full">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-2 font-serif text-xl font-semibold">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <Ornament className="pointer-events-none absolute -left-16 -bottom-20 w-[min(44vw,360px)] opacity-20" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-serif text-[clamp(2.2rem,5vw,3.4rem)] font-semibold text-balance">
            Siap merangkai parcel istimewamu?
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-muted-foreground">
            Pilih alas, isi sendiri, dan lihat estimasinya seketika — pesan
            langsung lewat WhatsApp.
          </p>
          <Link
            href="/rakit"
            className="btn-gold-grad mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            Rakit Parcel Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-serif text-3xl leading-none text-[color:var(--gold-hi)]">
        {n}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {l}
      </div>
    </div>
  );
}
