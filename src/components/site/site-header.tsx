import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = { href: string; label: string };

const DEFAULT_NAV: NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/#koleksi", label: "Koleksi" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/rakit", label: "Rakit Parcel" },
];

export function SiteHeader({ nav = DEFAULT_NAV }: { nav?: NavItem[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[color:var(--topbar-bg)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="NOOH beranda">
          <Wordmark />
        </Link>
        <nav className="ml-6 hidden gap-7 text-sm text-[color:var(--muted-foreground)] md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-[color:var(--gold-hi)]">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/rakit"
            className="btn-gold-grad hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition hover:-translate-y-0.5 sm:inline-block"
          >
            Rakit Parcel
          </Link>
          <Link
            href="/admin/login"
            className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--gold-hi)]"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
