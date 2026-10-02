"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { rupiah } from "@/lib/format";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductInput,
} from "@/lib/actions/products";

type Size = "KECIL" | "SEDANG" | "BESAR";
const SIZE_LABELS: Record<Size, string> = {
  KECIL: "Kecil",
  SEDANG: "Sedang",
  BESAR: "Besar",
};

type Category = { id: number; name: string };
type LeadTier = { minQty: number; maxQty: number | null; days: number };
type Product = {
  id: number;
  name: string;
  hpp: number;
  sellPrice: number;
  stock: number;
  imageUrl: string | null;
  size: Size | null;
  isBase: boolean;
  categories: Category[];
  leadTimeTiers: LeadTier[];
};

export function ProductManager({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setOpen(true);
  }

  function handleDelete(p: Product) {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteProduct(p.id);
        toast.success("Produk dihapus.");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menghapus.");
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Produk" : "Tambah Produk"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              key={editing?.id ?? "new"}
              product={editing}
              categories={categories}
              onDone={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Foto</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe / Ukuran</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">HPP</TableHead>
              <TableHead className="text-right">Harga Jual</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  Belum ada produk.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.isBase && <Badge>Alas</Badge>}
                      {p.size && (
                        <Badge variant="outline">{SIZE_LABELS[p.size]}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.categories.map((c) => (
                        <Badge key={c.id} variant="secondary">
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {rupiah(p.hpp)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {rupiah(p.sellPrice)}
                  </TableCell>
                  <TableCell className="text-right">{p.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => handleDelete(p)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onDone,
}: {
  product: Product | null;
  categories: Category[];
  onDone: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [hpp, setHpp] = useState(product ? String(product.hpp) : "");
  const [sellPrice, setSellPrice] = useState(
    product ? String(product.sellPrice) : ""
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.imageUrl ?? null
  );
  const [selectedCats, setSelectedCats] = useState<number[]>(
    product?.categories.map((c) => c.id) ?? []
  );
  const [isBase, setIsBase] = useState(product?.isBase ?? false);
  const [size, setSize] = useState<Size | "">(product?.size ?? "");
  const [tiers, setTiers] = useState<
    { minQty: string; maxQty: string; days: string }[]
  >(
    product?.leadTimeTiers.map((t) => ({
      minQty: String(t.minQty),
      maxQty: t.maxQty == null ? "" : String(t.maxQty),
      days: String(t.days),
    })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const profit = (Number(sellPrice) || 0) - (Number(hpp) || 0);
  const markup =
    Number(hpp) > 0 ? Math.round((profit / Number(hpp)) * 100) : null;

  function addTier() {
    setTiers((prev) => [...prev, { minQty: "", maxQty: "", days: "" }]);
  }
  function updateTier(i: number, field: "minQty" | "maxQty" | "days", val: string) {
    setTiers((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, [field]: val } : t))
    );
  }
  function removeTier(i: number) {
    setTiers((prev) => prev.filter((_, idx) => idx !== i));
  }

  function toggleCat(id: number) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload gagal.");
      setImageUrl(data.url);
      toast.success("Foto terunggah.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBase && !size) {
      toast.error("Item non-alas wajib punya ukuran.");
      return;
    }
    const parsedTiers = isBase
      ? tiers.map((t) => ({
          minQty: Number(t.minQty),
          maxQty: t.maxQty.trim() === "" ? null : Number(t.maxQty),
          days: Number(t.days),
        }))
      : [];
    const input: ProductInput = {
      name,
      hpp: Number(hpp),
      sellPrice: Number(sellPrice),
      stock: Number(stock),
      imageUrl,
      size: size === "" ? null : size,
      isBase,
      categoryIds: selectedCats,
      leadTimeTiers: parsedTiers,
    };
    setSaving(true);
    try {
      if (product) {
        await updateProduct(product.id, input);
        toast.success("Produk diperbarui.");
      } else {
        await createProduct(input);
        toast.success("Produk ditambahkan.");
      }
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama produk</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="hpp">HPP / modal</Label>
          <MoneyInput
            id="hpp"
            value={hpp}
            onChange={setHpp}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sell">Harga jual</Label>
          <MoneyInput
            id="sell"
            value={sellPrice}
            onChange={setSellPrice}
            required
          />
        </div>
      </div>

      {hpp !== "" && sellPrice !== "" && (
        <p
          className={`-mt-1 text-xs ${
            profit < 0 ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {profit < 0 ? (
            "Harga jual di bawah modal."
          ) : (
            <>
              Untung{" "}
              <span className="font-medium text-foreground">
                {rupiah(profit)}
              </span>
              /unit
              {markup !== null && ` · markup ${markup}%`}
            </>
          )}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="stock">Stok</Label>
        <Input
          id="stock"
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
      </div>

      <div className="space-y-3 rounded-lg border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isBase}
            onChange={(e) => setIsBase(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Produk ini adalah alas (base parcel)
        </label>
        <div className="space-y-2">
          <Label htmlFor="size">
            {isBase ? "Kapasitas alas" : "Ukuran item"}
          </Label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value as Size | "")}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">
              {isBase ? "— pilih kapasitas —" : "— pilih ukuran (wajib) —"}
            </option>
            <option value="KECIL">Kecil</option>
            <option value="SEDANG">Sedang</option>
            <option value="BESAR">Besar</option>
          </select>
          {!isBase && (
            <p className="text-xs text-muted-foreground">
              Item non-alas wajib punya ukuran.
            </p>
          )}
        </div>

        {isBase && (
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <Label>Waktu pengerjaan (per pcs)</Label>
              <Button type="button" size="sm" variant="outline" onClick={addTier}>
                <Plus className="h-3 w-3" /> Tier
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Contoh: 1–10 pcs = 3 hari, 11–50 pcs = 7 hari. Kosongkan &quot;maks&quot;
              untuk tanpa batas atas (mis. 51+).
            </p>
            {tiers.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Belum ada tier. Tanpa tier, alas bisa dipesan kapan saja tanpa
                cek waktu.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="flex-1">Min pcs</span>
                  <span className="flex-1">Maks pcs</span>
                  <span className="flex-1">Hari</span>
                  <span className="w-8" />
                </div>
                {tiers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      value={t.minQty}
                      onChange={(e) => updateTier(i, "minQty", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="∞"
                      value={t.maxQty}
                      onChange={(e) => updateTier(i, "maxQty", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="hari"
                      value={t.days}
                      onChange={(e) => updateTier(i, "days", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="w-8 shrink-0"
                      onClick={() => removeTier(i)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Kategori</Label>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada kategori. Buat dulu di menu Kategori.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = selectedCats.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="foto">Foto produk</Label>
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded bg-muted">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Input
              id="foto"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
            {uploading && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Mengunggah…
              </p>
            )}
            {imageUrl && !uploading && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Hapus foto
              </button>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Menyimpan…" : product ? "Simpan Perubahan" : "Tambah"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function MoneyInput({
  id,
  value,
  onChange,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        Rp
      </span>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="pl-9 tabular-nums"
      />
    </div>
  );
}
