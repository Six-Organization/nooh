"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/products", label: "Produk" },
  { href: "/admin/categories", label: "Kategori" },
  { href: "/admin/rakit", label: "Jenis Rakit" },
  { href: "/admin/personalisasi", label: "Personalisasi" },
  { href: "/admin/kapasitas", label: "Kapasitas" },
  { href: "/admin/bookings", label: "Booking" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 text-sm">
      {items.map((it) => {
        const active = pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`rounded-md px-3 py-1.5 transition ${
              active
                ? "bg-accent font-medium text-[color:var(--gold-hi)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
