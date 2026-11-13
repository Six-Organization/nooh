"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, ImageIcon, Clock, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rupiah } from "@/lib/format";
import { todayISO, formatDateID } from "@/lib/leadtime";
import {
  tierFor,
  priceFrom,
  maxQtyWithinDays,
  isOrderableWithinDays,
  type QtyTier,
} from "@/lib/pricing";

type Category = { id: number; name: string };
type BundleProduct = {
  id: number;
  name: string;
  sellPrice: number;
  stock: number;
  imageUrl: string | null;
  categories: Category[];
  quantityTiers: QtyTier[];
};

function daysBetween(fromISO: string, toISODate: string): number {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISODate + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function tierRangeLabel(t: QtyTier): string {
  return t.maxQty == null ? `${t.minQty}+` : `${t.minQty}–${t.maxQty}`;
}

export function BundleCatalog({ products }: { products: BundleProduct[] }) {
  const today = todayISO();
  const [eventDate, setEventDate] = useState("");

  const remainingDays =
    eventDate && eventDate >= today ? daysBetween(today, eventDate) : null;

  return (
    <div className="space-y-6">
      {/* Langkah 1: tanggal acara */}
      <Card className="gap-3 p-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[color:var(--gold-hi)]" />
          <h2 className="font-semibold">Kapan acaramu?</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Pilih tanggal acara dulu. Kami tampilkan produk yang masih bisa
          dikerjakan sampai tanggal itu.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="eventDate">Tanggal acara</Label>
            <Input
              id="eventDate"
              type="date"
              min={today}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-[200px]"
            />
          </div>
          {remainingDays !== null && (
            <p className="pb-2 text-sm text-muted-foreground">
              Sisa waktu:{" "}
              <span className="font-medium text-foreground">
                {remainingDays} hari
              </span>{" "}
              ({formatDateID(eventDate)})
            </p>
          )}
        </div>
      </Card>

      {remainingDays === null ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Pilih tanggal acara di atas untuk melihat produk.
        </p>
      ) : (
        <CatalogList
          products={products}
          remainingDays={remainingDays}
          eventDate={eventDate}
        />
      )}
    </div>
  );
}

function CatalogList({
  products,
  remainingDays,
  eventDate,
}: {
  products: BundleProduct[];
  remainingDays: number;
  eventDate: string;
}) {
  const { available, locked } = useMemo(() => {
    const available: BundleProduct[] = [];
    const locked: BundleProduct[] = [];
    for (const p of products) {
      if (p.quantityTiers.length === 0) continue;
      if (isOrderableWithinDays(p.quantityTiers, remainingDays))
        available.push(p);
      else locked.push(p);
    }
    return { available, locked };
  }, [products, remainingDays]);

  if (products.length === 0)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Belum ada produk bundle di katalog.
      </p>
    );

  return (
    <div className="space-y-8">
      {available.length === 0 ? (
        <Card className="gap-2 p-6 text-center">
          <p className="text-sm font-medium">
            Waktu terlalu dekat untuk semua produk.
          </p>
          <p className="text-sm text-muted-foreground">
            Tidak ada produk yang bisa selesai sebelum tanggal acaramu. Coba
            tanggal lebih jauh, atau langsung nego via WhatsApp.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((p) => (
            <BundleCard
              key={p.id}
              product={p}
              remainingDays={remainingDays}
              eventDate={eventDate}
            />
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Butuh waktu lebih lama (tidak muat untuk tanggal ini)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((p) => {
              const minLead = Math.min(
                ...p.quantityTiers.map((t) => t.leadDays)
              );
              return (
                <Card
                  key={p.id}
                  className="gap-2 p-4 opacity-60"
                  aria-disabled
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Butuh minimal {minLead} hari sebelum acara (sisa waktumu{" "}
                    {remainingDays} hari).
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BundleCard({
  product,
  remainingDays,
  eventDate,
}: {
  product: BundleProduct;
  remainingDays: number;
  eventDate: string;
}) {
  const [pcs, setPcs] = useState("1");
  const qty = Number(pcs) || 0;

  const from = priceFrom(product.quantityTiers);
  const maxQty = maxQtyWithinDays(product.quantityTiers, remainingDays);
  const tier = qty >= 1 ? tierFor(product.quantityTiers, qty) : null;
  const total = tier ? tier.unitPrice * qty : null;
  const feasible = tier != null && tier.leadDays <= remainingDays;

  function buildMessage(nego: boolean): string {
    return [
      "Halo NOOH, saya mau pesan produk:",
      `Produk: ${product.name}`,
      `Jumlah: ${qty} pcs`,
      tier ? `Harga: ${rupiah(tier.unitPrice)}/pcs` : "",
      `Tanggal acara: ${formatDateID(eventDate)}`,
      total ? `Total estimasi: ${rupiah(total)}` : "",
      tier ? `Estimasi pengerjaan: ${tier.leadDays} hari` : "",
      nego
        ? "\nUntuk jumlah ini waktunya mepet — apakah bisa dikerjakan lebih cepat? Saya siap nego."
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function openWA(nego: boolean) {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    if (!number) {
      toast.error("Nomor WhatsApp admin belum diatur.");
      return;
    }
    const url = `https://wa.me/${number}?text=${encodeURIComponent(
      buildMessage(nego)
    )}`;
    window.open(url, "_blank");
  }

  function order() {
    if (qty < 1) {
      toast.error("Isi jumlah pcs dulu.");
      return;
    }
    openWA(!feasible);
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="thumb-bg aspect-[4/3] w-full overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/60">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-semibold leading-tight">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {product.categories.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.name}
              </Badge>
            ))}
          </div>
          {from != null && (
            <p className="text-sm text-muted-foreground">
              Mulai{" "}
              <span className="font-medium text-[color:var(--gold-hi)]">
                {rupiah(from)}
              </span>
              /pcs
            </p>
          )}
        </div>

        {/* Jenjang harga */}
        <div className="rounded-md border bg-muted/30 p-2">
          <div className="mb-1 flex text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="flex-1">Jumlah</span>
            <span className="flex-1 text-right">Harga/pcs</span>
            <span className="w-14 text-right">Lead</span>
          </div>
          {product.quantityTiers.map((t, i) => {
            const active = tier === t;
            const fits = t.leadDays <= remainingDays;
            return (
              <div
                key={i}
                className={`flex items-center text-xs ${
                  active ? "font-semibold text-foreground" : ""
                } ${fits ? "" : "text-muted-foreground/50 line-through"}`}
              >
                <span className="flex-1">{tierRangeLabel(t)} pcs</span>
                <span className="flex-1 text-right tabular-nums">
                  {rupiah(t.unitPrice)}
                </span>
                <span className="w-14 text-right tabular-nums">
                  {t.leadDays}h
                </span>
              </div>
            );
          })}
        </div>

        {maxQty !== null && maxQty !== Infinity && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> Untuk tanggalmu, maks{" "}
            <span className="font-medium text-foreground">{maxQty} pcs</span>.
          </p>
        )}

        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor={`pcs-${product.id}`} className="text-xs">
              Jumlah (pcs)
            </Label>
            <Input
              id={`pcs-${product.id}`}
              type="number"
              min={1}
              value={pcs}
              onChange={(e) => setPcs(e.target.value)}
              className="w-24"
            />
          </div>
          <div className="flex-1 pb-1 text-right">
            {total != null && (
              <>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-serif text-lg font-semibold tabular-nums">
                  {rupiah(total)}
                </div>
              </>
            )}
          </div>
        </div>

        {tier && !feasible && (
          <p className="text-xs text-destructive">
            Untuk {qty} pcs butuh {tier.leadDays} hari, sisa waktumu{" "}
            {remainingDays} hari. Kurangi jumlah atau nego via WA.
          </p>
        )}

        <Button
          type="button"
          onClick={order}
          className="w-full"
          variant={feasible ? "default" : "outline"}
        >
          {feasible ? "Pesan via WhatsApp" : "Nego via WhatsApp"}
        </Button>
      </div>
    </Card>
  );
}
