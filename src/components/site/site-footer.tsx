import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[color:var(--footer-bg)]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <h4 className="gold-text font-serif text-2xl">NOOH</h4>
          <p className="mt-2 max-w-[36ch] text-sm font-light text-muted-foreground">
            Souvenir &amp; Hampers untuk setiap momen sakral dan perayaan.
            Dirangkai tangan, dipersembahkan dengan hati.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Dupa oleh{" "}
            <span className="font-script text-2xl text-[color:var(--gold-hi)]">
              Lavanya
            </span>{" "}
            — Dupa Grosir.
          </p>
        </div>
        <FooterCol
          title="Jelajah"
          links={[
            { label: "Rakit Parcel", href: "/rakit" },
            { label: "Koleksi", href: "/#koleksi" },
            { label: "Tentang", href: "/#tentang" },
          ]}
        />
        <FooterCol
          title="Hubungi"
          links={[
            { label: "WhatsApp", href: "#" },
            { label: "Instagram", href: "#" },
            { label: "Bali, Indonesia", href: "#" },
          ]}
        />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 border-t border-border px-4 py-4 text-xs text-muted-foreground sm:px-6">
        <span>© 2026 NOOH Souvenir &amp; Hampers</span>
        <span>Dirangkai di Pulau Dewata</span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="mb-3 text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]">
        {title}
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <Link key={l.label} href={l.href} className="hover:text-[color:var(--gold-hi)]">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
