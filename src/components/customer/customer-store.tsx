"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBasket,
  Send,
  Package,
  CalendarDays,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { rupiah } from "@/lib/format";
import {
  ITEM_POINTS,
  SIZE_LABELS,
  capacityFor,
  type Size,
  type CapacityMatrix,
} from "@/lib/capacity";
import {
  leadDaysFor,
  earliestDateISO,
  todayISO,
  formatDateID,
} from "@/lib/leadtime";
import {
  useParcel,
  parcelItemList,
  parcelUnitTotal,
  parcelTotal,
  usedPoints,
  capacityOf,
} from "@/store/parcel";
import {
  CheckoutDialog,
  type CheckoutPayload,
} from "@/components/customer/checkout-dialog";

type Category = { id: number; name: string };
type LeadTier = { minQty: number; maxQty: number | null; days: number };
type ProductType = "COMPONENT" | "ALAS" | "PACKING" | "BUNDLE";
type Product = {
  id: number;
  name: string;
  sellPrice: number;
  stock: number;
  imageUrl: string | null;
  size: Size | null;
  isBase: boolean;
  type: ProductType;
  categories: Category[];
  leadTimeTiers: LeadTier[];
};

const MatrixCtx = createContext<CapacityMatrix | null>(null);
function useMatrix(): CapacityMatrix {
  const m = useContext(MatrixCtx);
  if (!m) throw new Error("MatrixCtx tidak tersedia.");
  return m;
}

const emptySubscribe = () => () => {};
/** true hanya setelah hidrasi klien (aman untuk store yang dipersist). */
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function daysBetween(fromISO: string, toISODate: string): number {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISODate + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Lead time minimal sebuah alas (tier dengan hari terkecil). */
function minLeadOf(tiers: LeadTier[]): number | null {
  if (tiers.length === 0) return null;
  return Math.min(...tiers.map((t) => t.days));
}

export function CustomerStore({
  products,
  categories,
  matrix,
}: {
  products: Product[];
  categories: Category[];
  matrix: CapacityMatrix;
}) {
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const mounted = useMounted();
  const deliveryDate = useParcel((s) => s.deliveryDate);
  const setDeliveryDate = useParcel((s) => s.setDeliveryDate);

  const bases = products.filter((p) => p.type === "ALAS");
  const packings = products.filter((p) => p.type === "PACKING");
  const items = products.filter((p) => p.type === "COMPONENT");
  const filteredItems =
    activeCat === null
      ? items
      : items.filter((p) => p.categories.some((c) => c.id === activeCat));

  // Hindari mismatch hidrasi: tunggu mount (store dipersist di localStorage).
  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ParcelSkeleton />
      </div>
    );
  }

  const today = todayISO();
  const dateChosen = deliveryDate !== "" && deliveryDate >= today;
  const remainingDays = dateChosen ? daysBetween(today, deliveryDate) : null;

  return (
    <MatrixCtx.Provider value={matrix}>
      {/* Langkah 0: tanggal acara dulu */}
      <Card className="mb-8 gap-3 p-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[color:var(--gold-hi)]" />
          <h2 className="font-semibold">Kapan acaramu?</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Pilih tanggal acara dulu. Kami tandai alas yang masih keburu
          dikerjakan sampai tanggal itu.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="eventDate">Tanggal acara</Label>
            <Input
              id="eventDate"
              type="date"
              min={today}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-[200px]"
            />
          </div>
          {remainingDays !== null && (
            <p className="pb-2 text-sm text-muted-foreground">
              Sisa waktu:{" "}
              <span className="font-medium text-foreground">
                {remainingDays} hari
              </span>{" "}
              ({formatDateID(deliveryDate)})
            </p>
          )}
        </div>
      </Card>

      {remainingDays === null ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Pilih tanggal acara di atas untuk mulai merakit.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-14">
            {/* Langkah 1: pilih alas */}
            <section>
              <SectionTitle step={1} title="Pilih Alas" hint="Dasar parcel" />
              {bases.length === 0 ? (
                <EmptyNote>Belum ada alas tersedia.</EmptyNote>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {bases.map((b) => (
                    <BaseCard
                      key={b.id}
                      product={b}
                      enabled={mounted}
                      remainingDays={remainingDays}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Langkah 2: pilih packing */}
            <section>
              <SectionTitle
                step={2}
                title="Pilih Packing"
                hint="Menentukan kapasitas"
              />
              {packings.length === 0 ? (
                <EmptyNote>Belum ada packing tersedia.</EmptyNote>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {packings.map((p) => (
                    <PackingCard key={p.id} product={p} enabled={mounted} />
                  ))}
                </div>
              )}
            </section>

            {/* Langkah 3: isi item */}
            <section>
              <SectionTitle
                step={3}
                title="Isi Item"
                hint="Dupa · isian · pelengkap"
              />
              <div className="mb-4 flex flex-wrap gap-2">
                <FilterChip
                  active={activeCat === null}
                  onClick={() => setActiveCat(null)}
                >
                  Semua
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip
                    key={c.id}
                    active={activeCat === c.id}
                    onClick={() => setActiveCat(c.id)}
                  >
                    {c.name}
                  </FilterChip>
                ))}
              </div>
              {filteredItems.length === 0 ? (
                <EmptyNote>Belum ada item di kategori ini.</EmptyNote>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {filteredItems.map((p) => (
                    <ItemCard key={p.id} product={p} enabled={mounted} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:sticky lg:top-[88px] lg:self-start">
            <ParcelPanel />
          </div>
        </div>
      )}
    </MatrixCtx.Provider>
  );
}

function SectionTitle({
  step,
  title,
  hint,
}: {
  step: number;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="btn-gold-grad flex h-9 w-9 flex-none items-center justify-center rounded-full font-serif text-lg font-bold">
        {step}
      </span>
      <h2 className="font-serif text-3xl font-semibold leading-none">{title}</h2>
      {hint && (
        <span className="ml-auto text-right text-[13px] text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}

/* Pilih motif dekoratif berdasar jenis produk */
function Motif({ product, className }: { product: Product; className?: string }) {
  const isDupa = product.categories.some((c) =>
    c.name.toLowerCase().includes("dupa")
  );
  if (product.isBase) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-hi)" strokeWidth="1.2" className={className}>
        <ellipse cx="12" cy="13" rx="9" ry="4.4" />
        <path d="M3 13c0 3 4 5 9 5s9-2 9-5" />
        <path d="M8 10c1-1 3-1.6 4-1.6S15 9 16 10" />
      </svg>
    );
  }
  if (isDupa) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-hi)" strokeWidth="1.3" className={className}>
        <path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1.2-3 2-4 .3 1.2 1.2 1.6 2 2 .2-2-1-4-0-6Z" />
        <path d="M6 21h12" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-hi)" strokeWidth="1.2" className={className}>
      <path d="M5 19c8 1 14-4 14-14C10 5 4 11 5 19Z" />
      <path d="M5 19C9 14 13 11 17 9" />
    </svg>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function ProductImage({ product }: { product: Product }) {
  return (
    <div className="thumb-bg relative grid aspect-square w-full place-items-center border-b border-border">
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <span className="absolute font-serif text-5xl font-bold text-[color:rgba(243,231,204,0.12)]">
            {product.name.charAt(0)}
          </span>
          <Motif product={product} className="h-[44%] w-[44%] opacity-60" />
        </>
      )}
    </div>
  );
}

function BaseCard({
  product,
  enabled,
  remainingDays,
}: {
  product: Product;
  enabled: boolean;
  remainingDays: number;
}) {
  const base = useParcel((s) => s.base);
  const packing = useParcel((s) => s.packing);
  const setBase = useParcel((s) => s.setBase);
  const items = useParcel((s) => s.items);
  const removeItem = useParcel((s) => s.remove);
  const matrix = useMatrix();
  const selected = enabled && base?.id === product.id;

  const minLead = minLeadOf(product.leadTimeTiers);
  const tooLate = minLead != null && minLead > remainingDays;

  function choose() {
    if (!product.size) return;
    const hasItems = Object.keys(items).length > 0;
    if (base && base.id !== product.id && hasItems && packing) {
      const cap = capacityFor(matrix, product.size, packing.size);
      const used = usedPoints(items);
      if (used > cap) {
        if (
          !confirm(
            "Item di parcel melebihi kapasitas kombinasi alas baru. Ganti alas akan mengosongkan item. Lanjut?"
          )
        )
          return;
        Object.keys(items).forEach((id) => removeItem(Number(id)));
      }
    }
    setBase({
      id: product.id,
      name: product.name,
      sellPrice: product.sellPrice,
      imageUrl: product.imageUrl,
      size: product.size,
      tiers: product.leadTimeTiers,
    });
    toast.success(`Alas "${product.name}" dipilih.`);
  }

  return (
    <Card
      className={`gap-0 overflow-hidden p-0 transition ${
        tooLate ? "opacity-60" : "hover:-translate-y-1"
      } ${selected ? "ring-2 ring-[color:var(--gold)]" : ""}`}
    >
      <div className="relative">
        <ProductImage product={product} />
        {product.size && (
          <div className="absolute left-2.5 top-2.5">
            <span className="rounded-full border border-[color:var(--line-strong)] bg-[rgba(30,6,11,0.6)] px-2.5 py-1 text-[10.5px] text-[color:var(--gold-hi)] backdrop-blur-sm">
              Alas {SIZE_LABELS[product.size]}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="line-clamp-2 font-serif text-lg font-semibold leading-tight">
          {product.name}
        </p>
        <p className="text-sm font-medium text-[color:var(--gold-hi)]">
          {rupiah(product.sellPrice)}
        </p>
        {tooLate ? (
          <div className="mt-auto space-y-1">
            <p className="text-[11px] text-destructive">
              Butuh min {minLead} hari — tak keburu untuk tanggal ini.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="w-full cursor-not-allowed"
              disabled
            >
              <Lock className="h-3.5 w-3.5" /> Tidak keburu
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className={`mt-auto ${selected ? "" : "btn-gold-grad"}`}
            variant={selected ? "outline" : "default"}
            disabled={!enabled}
            onClick={choose}
          >
            {selected ? "✓ Terpilih" : "Pilih Alas"}
          </Button>
        )}
      </div>
    </Card>
  );
}

function PackingCard({
  product,
  enabled,
}: {
  product: Product;
  enabled: boolean;
}) {
  const base = useParcel((s) => s.base);
  const packing = useParcel((s) => s.packing);
  const setPacking = useParcel((s) => s.setPacking);
  const items = useParcel((s) => s.items);
  const removeItem = useParcel((s) => s.remove);
  const matrix = useMatrix();
  const selected = enabled && packing?.id === product.id;

  function choose() {
    if (!product.size) return;
    const hasItems = Object.keys(items).length > 0;
    if (packing && packing.id !== product.id && hasItems && base) {
      const cap = capacityFor(matrix, base.size, product.size);
      const used = usedPoints(items);
      if (used > cap) {
        if (
          !confirm(
            "Item di parcel melebihi kapasitas kombinasi packing baru. Ganti packing akan mengosongkan item. Lanjut?"
          )
        )
          return;
        Object.keys(items).forEach((id) => removeItem(Number(id)));
      }
    }
    setPacking({
      id: product.id,
      name: product.name,
      sellPrice: product.sellPrice,
      imageUrl: product.imageUrl,
      size: product.size,
    });
    toast.success(`Packing "${product.name}" dipilih.`);
  }

  return (
    <Card
      className={`gap-0 overflow-hidden p-0 transition hover:-translate-y-1 ${
        selected ? "ring-2 ring-[color:var(--gold)]" : ""
      }`}
    >
      <div className="relative">
        <ProductImage product={product} />
        {product.size && (
          <div className="absolute left-2.5 top-2.5">
            <span className="rounded-full border border-[color:var(--line-strong)] bg-[rgba(30,6,11,0.6)] px-2.5 py-1 text-[10.5px] text-[color:var(--gold-hi)] backdrop-blur-sm">
              Packing {SIZE_LABELS[product.size]}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="line-clamp-2 font-serif text-lg font-semibold leading-tight">
          {product.name}
        </p>
        <p className="text-sm font-medium text-[color:var(--gold-hi)]">
          {rupiah(product.sellPrice)}
        </p>
        <Button
          size="sm"
          className={`mt-auto ${selected ? "" : "btn-gold-grad"}`}
          variant={selected ? "outline" : "default"}
          disabled={!enabled}
          onClick={choose}
        >
          {selected ? "✓ Terpilih" : "Pilih Packing"}
        </Button>
      </div>
    </Card>
  );
}

function ItemCard({ product, enabled }: { product: Product; enabled: boolean }) {
  const base = useParcel((s) => s.base);
  const packing = useParcel((s) => s.packing);
  const items = useParcel((s) => s.items);
  const add = useParcel((s) => s.add);
  const matrix = useMatrix();

  const ready = base != null && packing != null;
  const cost = product.size ? ITEM_POINTS[product.size] : 0;
  const remaining = ready
    ? capacityOf(base, packing, matrix) - usedPoints(items)
    : null;
  // Tidak muat: alas+packing sudah dipilih tapi sisa poin < kebutuhan item ini.
  const tooBig = remaining !== null && cost > remaining;

  function tryAdd() {
    if (!base || !packing) {
      toast.error("Pilih alas & packing dulu sebelum menambah item.");
      return;
    }
    if (!product.size) return;
    const cap = capacityOf(base, packing, matrix);
    const used = usedPoints(items);
    const cost = ITEM_POINTS[product.size];
    if (used + cost > cap) {
      toast.error(
        `Kapasitas tidak cukup (sisa ${cap - used} poin, item ini butuh ${cost}).`
      );
      return;
    }
    add({
      id: product.id,
      name: product.name,
      sellPrice: product.sellPrice,
      imageUrl: product.imageUrl,
      size: product.size,
    });
  }

  return (
    <Card
      className={`gap-0 overflow-hidden p-0 transition ${
        tooBig ? "opacity-60" : "hover:-translate-y-1"
      }`}
    >
      <div className="relative">
        <ProductImage product={product} />
        {product.size && (
          <div className="absolute left-2.5 top-2.5">
            <span className="btn-gold-grad rounded-full px-2.5 py-1 text-[10.5px] font-semibold">
              {SIZE_LABELS[product.size]} · {ITEM_POINTS[product.size]}p
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="line-clamp-2 font-serif text-lg font-semibold leading-tight">
          {product.name}
        </p>
        <div className="flex flex-wrap gap-1">
          {product.categories.map((c) => (
            <span
              key={c.id}
              className="rounded-md border border-border px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
            >
              {c.name}
            </span>
          ))}
        </div>
        <p className="text-sm font-medium text-[color:var(--gold-hi)]">
          {rupiah(product.sellPrice)}
        </p>
        {tooBig ? (
          <Button
            size="sm"
            variant="secondary"
            className="mt-auto cursor-not-allowed"
            disabled
            title={`Butuh ${cost} poin, sisa ${remaining} poin`}
          >
            Tidak muat ({cost}p)
          </Button>
        ) : (
          <Button
            size="sm"
            className="btn-gold-grad mt-auto"
            disabled={!enabled}
            onClick={tryAdd}
          >
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        )}
      </div>
    </Card>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function ParcelSkeleton() {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">Memuat parcel…</p>
    </Card>
  );
}

function ParcelPanel() {
  const base = useParcel((s) => s.base);
  const packing = useParcel((s) => s.packing);
  const items = useParcel((s) => s.items);
  const pcs = useParcel((s) => s.pcs);
  const deliveryDate = useParcel((s) => s.deliveryDate);
  const setPcs = useParcel((s) => s.setPcs);
  const setQty = useParcel((s) => s.setQty);
  const remove = useParcel((s) => s.remove);
  const clear = useParcel((s) => s.clear);
  const matrix = useMatrix();

  const [warnOpen, setWarnOpen] = useState(false);
  const [coOpen, setCoOpen] = useState(false);
  const [payload, setPayload] = useState<CheckoutPayload | null>(null);

  const ready = base != null && packing != null;
  const list = parcelItemList(items);
  const unit = parcelUnitTotal(base, packing, items);
  const total = parcelTotal(base, packing, items, pcs);
  const cap = capacityOf(base, packing, matrix);
  const used = usedPoints(items);
  const pct = cap > 0 ? Math.min(100, (used / cap) * 100) : 0;

  const baseTiers = base?.tiers ?? [];
  const hasTiers = baseTiers.length > 0;
  const leadDays = hasTiers ? leadDaysFor(baseTiers, pcs) : 0;
  const earliest = leadDays != null ? earliestDateISO(leadDays) : null;
  const dateChosen = deliveryDate !== "";
  const sufficient =
    !hasTiers ||
    (leadDays != null &&
      dateChosen &&
      earliest != null &&
      deliveryDate >= earliest);

  function increase(id: number, size: Size, qty: number) {
    if (used + ITEM_POINTS[size] > cap) {
      toast.error("Kapasitas parcel penuh.");
      return;
    }
    setQty(id, qty + 1);
  }

  function buildMessage(nego: boolean) {
    if (!base) return "";
    const lines = list.map(
      (i) => `• ${i.name} x${i.qty} = ${rupiah(i.sellPrice * i.qty)}`
    );
    return [
      nego
        ? "Halo, saya mau NEGO custom parcel (waktu agak mepet):"
        : "Halo, saya mau pesan custom parcel ini:",
      "",
      `Alas: ${base.name} (${rupiah(base.sellPrice)})`,
      packing ? `Packing: ${packing.name} (${rupiah(packing.sellPrice)})` : "",
      "Isi:",
      ...(lines.length ? lines : ["(belum ada item)"]),
      "",
      `Jumlah: ${pcs} pcs`,
      `Tanggal diminta: ${dateChosen ? formatDateID(deliveryDate) : "-"}`,
      hasTiers && leadDays != null
        ? `Estimasi pengerjaan: ${leadDays} hari (paling cepat ${
            earliest ? formatDateID(earliest) : "-"
          })`
        : "",
      `Total estimasi: ${rupiah(total)}`,
      nego ? "\nApakah bisa dikerjakan lebih cepat? Saya siap nego harga." : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function startCheckout(nego: boolean) {
    if (!base) return;
    setPayload({
      kind: "CUSTOM",
      summary: `Custom parcel: ${base.name}${
        packing ? ` + ${packing.name}` : ""
      } + ${list.length} item · ${pcs} pcs = ${rupiah(total)}${
        nego ? " (nego)" : ""
      }`,
      total,
      eventDate: dateChosen ? deliveryDate : null,
      waMessage: buildMessage(nego),
    });
    setCoOpen(true);
  }

  function checkout() {
    if (!base) return;
    if (!packing) {
      toast.error("Pilih packing dulu.");
      return;
    }
    if (!dateChosen) {
      toast.error("Pilih tanggal ambil/kirim dulu.");
      return;
    }
    if (!sufficient) {
      setWarnOpen(true);
      return;
    }
    startCheckout(false);
  }

  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center gap-2 border-b p-4">
        <ShoppingBasket className="h-5 w-5" />
        <h2 className="font-semibold">Parcel Kamu</h2>
      </div>

      {!base ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Pilih alas dulu untuk mulai merakit parcel.
        </p>
      ) : (
        <>
          {/* Alas terpilih */}
          <div className="flex items-center gap-3 border-b p-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
              {base.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={base.imageUrl}
                  alt={base.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Alas</p>
              <p className="truncate text-sm font-medium">{base.name}</p>
              <p className="text-xs text-muted-foreground">
                {rupiah(base.sellPrice)}
              </p>
            </div>
          </div>

          {/* Packing terpilih / prompt */}
          {packing ? (
            <div className="flex items-center gap-3 border-b p-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {packing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={packing.imageUrl}
                    alt={packing.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Package className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Packing</p>
                <p className="truncate text-sm font-medium">{packing.name}</p>
                <p className="text-xs text-muted-foreground">
                  {rupiah(packing.sellPrice)}
                </p>
              </div>
            </div>
          ) : (
            <p className="border-b p-4 text-center text-sm text-muted-foreground">
              Pilih packing untuk menentukan kapasitas.
            </p>
          )}

          {/* Meter kapasitas */}
          {ready && (
            <div className="space-y-1 border-b p-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Kapasitas terpakai</span>
                <span className="font-medium">
                  {used} / {cap} poin
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    used >= cap ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Item */}
          {list.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Belum ada item. Tambahkan item ke alas.
            </p>
          ) : (
            <ul className="divide-y">
              {list.map((i) => (
                <li key={i.id} className="flex items-center gap-3 p-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                    {i.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={i.imageUrl}
                        alt={i.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ShoppingBasket className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rupiah(i.sellPrice)} · {ITEM_POINTS[i.size]} poin
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <IconBtn onClick={() => setQty(i.id, i.qty - 1)}>
                        <Minus className="h-3 w-3" />
                      </IconBtn>
                      <span className="w-7 text-center text-sm">{i.qty}</span>
                      <IconBtn onClick={() => increase(i.id, i.size, i.qty)}>
                        <Plus className="h-3 w-3" />
                      </IconBtn>
                      <button
                        onClick={() => remove(i.id)}
                        className="ml-2 text-muted-foreground hover:text-destructive"
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    {rupiah(i.sellPrice * i.qty)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Jumlah & tanggal (tanggal dipilih di atas) */}
          <div className="space-y-3 border-t p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="pcs" className="text-xs">
                  Jumlah (pcs)
                </Label>
                <Input
                  id="pcs"
                  type="number"
                  min={1}
                  value={pcs}
                  onChange={(e) => setPcs(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">
                  Tanggal acara
                </span>
                <p className="flex h-9 items-center text-sm font-medium">
                  {dateChosen ? formatDateID(deliveryDate) : "-"}
                </p>
              </div>
            </div>
            {hasTiers &&
              (leadDays != null ? (
                <p
                  className={`text-xs ${
                    dateChosen && !sufficient
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  Estimasi pengerjaan {leadDays} hari · paling cepat{" "}
                  {earliest ? formatDateID(earliest) : "-"}
                </p>
              ) : (
                <p className="text-xs text-destructive">
                  Jumlah ini di luar tier waktu — silakan nego via WA.
                </p>
              ))}
          </div>

          {/* Total & aksi */}
          <div className="space-y-3 border-t p-4">
            {pcs > 1 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {rupiah(unit)} × {pcs} pcs
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total estimasi
              </span>
              <span className="text-lg font-bold">{rupiah(total)}</span>
            </div>
            <Button className="w-full" onClick={checkout}>
              <Send className="h-4 w-4" /> Pesan via WhatsApp
            </Button>
            {hasTiers && dateChosen && !sufficient && (
              <p className="text-center text-xs text-destructive">
                Tanggal terlalu mepet untuk {pcs} pcs.
              </p>
            )}
            <button
              onClick={clear}
              className="w-full text-center text-xs text-muted-foreground hover:text-destructive"
            >
              Kosongkan parcel
            </button>
          </div>
        </>
      )}

      {/* Popup waktu tidak cukup */}
      <Dialog open={warnOpen} onOpenChange={setWarnOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Waktu pengerjaan tidak cukup</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Untuk <strong>{pcs} pcs</strong>, estimasi pengerjaan{" "}
              <strong>{leadDays ?? "-"} hari</strong>. Paling cepat bisa diambil{" "}
              <strong>{earliest ? formatDateID(earliest) : "-"}</strong>, tapi kamu
              memilih{" "}
              <strong>
                {deliveryDate ? formatDateID(deliveryDate) : "-"}
              </strong>
              .
            </p>
            <p>
              Kamu bisa ubah tanggal, atau nego langsung ke admin lewat WhatsApp
              (siapa tahu bisa dikebut dengan biaya tambahan).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarnOpen(false)}>
              Ubah tanggal
            </Button>
            <Button
              onClick={() => {
                setWarnOpen(false);
                startCheckout(true);
              }}
            >
              <Send className="h-4 w-4" /> Nego via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CheckoutDialog open={coOpen} onOpenChange={setCoOpen} payload={payload} />
    </Card>
  );
}

function IconBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded border hover:bg-accent"
    >
      {children}
    </button>
  );
}
