"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createRakitType,
  updateRakitType,
  deleteRakitType,
  type RakitTypeInput,
} from "@/lib/actions/rakit-types";

type ProductLite = { id: number; name: string; type: string };
type FieldLite = { id: number; name: string };
type RakitType = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
  productIds: number[];
  fieldIds: number[];
};

const TYPE_GROUPS: { key: string; label: string }[] = [
  { key: "ALAS", label: "Alas" },
  { key: "PACKING", label: "Packing" },
  { key: "COMPONENT", label: "Komponen" },
];

export function RakitTypeManager({
  types,
  products,
  fields,
}: {
  types: RakitType[];
  products: ProductLite[];
  fields: FieldLite[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RakitType | null>(null);

  function handleDelete(t: RakitType) {
    if (!confirm(`Hapus jenis rakit "${t.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteRakitType(t.id);
        toast.success("Jenis rakit dihapus.");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menghapus.");
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Tambah Jenis
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Jenis Rakit" : "Tambah Jenis Rakit"}
              </DialogTitle>
            </DialogHeader>
            <RakitTypeForm
              key={editing?.id ?? "new"}
              type={editing}
              products={products}
              fields={fields}
              onDone={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {types.length === 0 ? (
        <p className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
          Belum ada jenis rakit. Tambah minimal satu (mis. Parcel).
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {types.map((t) => (
            <div key={t.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-semibold">
                      {t.name}
                    </span>
                    {t.active ? (
                      <Badge variant="secondary">Aktif</Badge>
                    ) : (
                      <Badge variant="outline">Nonaktif</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">/rakit/{t.slug}</p>
                </div>
                <div className="flex shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(t);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => handleDelete(t)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {t.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1 text-xs">
                <Badge variant="outline">{t.productIds.length} produk</Badge>
                <Badge variant="outline">
                  {t.fieldIds.length} field personalisasi
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RakitTypeForm({
  type,
  products,
  fields,
  onDone,
}: {
  type: RakitType | null;
  products: ProductLite[];
  fields: FieldLite[];
  onDone: () => void;
}) {
  const [name, setName] = useState(type?.name ?? "");
  const [slug, setSlug] = useState(type?.slug ?? "");
  const [description, setDescription] = useState(type?.description ?? "");
  const [active, setActive] = useState(type?.active ?? true);
  const [sortOrder, setSortOrder] = useState(String(type?.sortOrder ?? 0));
  const [productIds, setProductIds] = useState<number[]>(
    type?.productIds ?? []
  );
  const [fieldIds, setFieldIds] = useState<number[]>(type?.fieldIds ?? []);
  const [saving, setSaving] = useState(false);

  function toggle(list: number[], id: number): number[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: RakitTypeInput = {
      name,
      slug: slug || name,
      description: description || null,
      active,
      sortOrder: Number(sortOrder) || 0,
      productIds,
      fieldIds,
    };
    setSaving(true);
    try {
      if (type) {
        await updateRakitType(type.id, input);
        toast.success("Jenis rakit diperbarui.");
      } else {
        await createRakitType(input);
        toast.success("Jenis rakit ditambahkan.");
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="rt-name">Nama</Label>
          <Input
            id="rt-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Parcel"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rt-slug">Slug (URL)</Label>
          <Input
            id="rt-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="parcel"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rt-desc">Deskripsi (opsional)</Label>
        <Input
          id="rt-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Rangkai parcel dengan bokor & dupa"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Aktif (tampil ke customer)
        </label>
        <div className="space-y-1">
          <Label htmlFor="rt-sort" className="text-xs">
            Urutan
          </Label>
          <Input
            id="rt-sort"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <Label>Produk yang dipakai</Label>
        {products.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada produk.</p>
        ) : (
          TYPE_GROUPS.map((g) => {
            const group = products.filter((p) => p.type === g.key);
            if (group.length === 0) return null;
            return (
              <div key={g.key} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.map((p) => {
                    const on = productIds.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setProductIds((l) => toggle(l, p.id))}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <Label>Field personalisasi</Label>
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Belum ada field. Buat di menu Personalisasi.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fields.map((f) => {
              const on = fieldIds.includes(f.id);
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFieldIds((l) => toggle(l, f.id))}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan…" : type ? "Simpan Perubahan" : "Tambah"}
        </Button>
      </DialogFooter>
    </form>
  );
}
