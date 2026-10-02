"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/categories";

type Cat = { id: number; name: string; count: number };

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  function run(fn: () => Promise<void>, ok: string) {
    startTransition(async () => {
      try {
        await fn();
        toast.success(ok);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Terjadi kesalahan.");
      }
    });
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newName.trim()) return;
            run(async () => {
              await createCategory(newName);
              setNewName("");
            }, "Kategori ditambahkan.");
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Nama kategori baru…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit" disabled={pending}>
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </form>
      </Card>

      <Card className="divide-y p-0">
        {categories.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Belum ada kategori.
          </p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3">
              {editId === c.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        await updateCategory(c.id, editName);
                        setEditId(null);
                      }, "Kategori diperbarui.")
                    }
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium">{c.name}</span>
                  <Badge variant="secondary">{c.count} produk</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditId(c.id);
                      setEditName(c.name);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => {
                      if (
                        confirm(
                          `Hapus kategori "${c.name}"? Produk tidak ikut terhapus.`
                        )
                      ) {
                        run(
                          () => deleteCategory(c.id),
                          "Kategori dihapus."
                        );
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
