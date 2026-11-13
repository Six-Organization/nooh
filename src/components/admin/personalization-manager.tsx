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
  createField,
  updateField,
  deleteField,
  type FieldInput,
} from "@/lib/actions/personalization";

type FieldKind = "SELECT" | "TEXT";
type Field = {
  id: number;
  name: string;
  kind: FieldKind;
  required: boolean;
  sortOrder: number;
  options: string[];
  rakitTypeNames: string[];
};

export function PersonalizationManager({ fields }: { fields: Field[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Field | null>(null);

  function handleDelete(f: Field) {
    if (!confirm(`Hapus field "${f.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteField(f.id);
        toast.success("Field dihapus.");
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
          <Plus className="h-4 w-4" /> Tambah Field
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Field" : "Tambah Field Personalisasi"}
              </DialogTitle>
            </DialogHeader>
            <FieldForm
              key={editing?.id ?? "new"}
              field={editing}
              onDone={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
          Belum ada field personalisasi.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{f.name}</span>
                    <Badge variant={f.kind === "TEXT" ? "outline" : "default"}>
                      {f.kind === "TEXT" ? "Teks bebas" : "Pilihan"}
                    </Badge>
                    {f.required && <Badge variant="secondary">Wajib</Badge>}
                  </div>
                  {f.kind === "SELECT" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {f.options.join(" · ") || "(belum ada opsi)"}
                    </p>
                  )}
                  {f.rakitTypeNames.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Dipakai: {f.rakitTypeNames.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(f);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => handleDelete(f)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Hubungkan field ke jenis rakit lewat menu <strong>Jenis Rakit</strong>.
      </p>
    </div>
  );
}

function FieldForm({
  field,
  onDone,
}: {
  field: Field | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(field?.name ?? "");
  const [kind, setKind] = useState<FieldKind>(field?.kind ?? "SELECT");
  const [required, setRequired] = useState(field?.required ?? false);
  const [sortOrder, setSortOrder] = useState(String(field?.sortOrder ?? 0));
  const [options, setOptions] = useState<string[]>(
    field?.options.length ? field.options : [""]
  );
  const [saving, setSaving] = useState(false);

  function setOpt(i: number, v: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: FieldInput = {
      name,
      kind,
      required,
      sortOrder: Number(sortOrder) || 0,
      options: kind === "SELECT" ? options : [],
    };
    setSaving(true);
    try {
      if (field) {
        await updateField(field.id, input);
        toast.success("Field diperbarui.");
      } else {
        await createField(input);
        toast.success("Field ditambahkan.");
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
        <Label htmlFor="pf-name">Nama field</Label>
        <Input
          id="pf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Warna Pita"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="pf-kind">Jenis</Label>
          <select
            id="pf-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as FieldKind)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="SELECT">Pilihan (dropdown)</option>
            <option value="TEXT">Teks bebas</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-sort">Urutan</Label>
          <Input
            id="pf-sort"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        Wajib diisi
      </label>

      {kind === "SELECT" && (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <Label>Opsi pilihan</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setOptions((p) => [...p, ""])}
            >
              <Plus className="h-3 w-3" /> Opsi
            </Button>
          </div>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={o}
                onChange={(e) => setOpt(i, e.target.value)}
                placeholder={`Opsi ${i + 1} (mis. Merah)`}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="w-8 shrink-0"
                onClick={() =>
                  setOptions((p) => p.filter((_, idx) => idx !== i))
                }
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan…" : field ? "Simpan Perubahan" : "Tambah"}
        </Button>
      </DialogFooter>
    </form>
  );
}
