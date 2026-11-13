"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Boxes } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useParcel } from "@/store/parcel";

type RakitTypeCard = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  count: number;
};

export function RakitChooser({ types }: { types: RakitTypeCard[] }) {
  const router = useRouter();
  const clear = useParcel((s) => s.clear);

  function open(slug: string) {
    // Reset rakitan sebelumnya saat ganti jenis.
    clear();
    router.push(`/rakit/${slug}`);
  }

  if (types.length === 0)
    return (
      <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        Belum ada jenis rakitan tersedia.
      </p>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {types.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => open(t.slug)}
          className="text-left"
        >
          <Card className="group h-full gap-3 p-5 transition hover:-translate-y-1 hover:ring-2 hover:ring-[color:var(--gold)]">
            <span className="btn-gold-grad flex h-11 w-11 items-center justify-center rounded-full">
              <Boxes className="h-5 w-5" />
            </span>
            <h3 className="font-serif text-xl font-semibold">{t.name}</h3>
            {t.description && (
              <p className="text-sm text-muted-foreground">{t.description}</p>
            )}
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[color:var(--gold-hi)]">
              Mulai rakit <ArrowRight className="h-4 w-4" />
            </span>
          </Card>
        </button>
      ))}
    </div>
  );
}
