"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_SIZES,
  SIZE_LABELS,
  type CapacityMatrix,
  type Size,
} from "@/lib/capacity";
import { saveCapacityMatrix } from "@/lib/actions/capacity";

export function CapacityMatrixEditor({ initial }: { initial: CapacityMatrix }) {
  const router = useRouter();
  const [matrix, setMatrix] = useState<Record<Size, Record<Size, string>>>(
    () => {
      const m = {} as Record<Size, Record<Size, string>>;
      for (const a of ALL_SIZES) {
        m[a] = {} as Record<Size, string>;
        for (const p of ALL_SIZES) m[a][p] = String(initial[a][p]);
      }
      return m;
    }
  );
  const [saving, setSaving] = useState(false);

  function update(a: Size, p: Size, val: string) {
    setMatrix((prev) => ({ ...prev, [a]: { ...prev[a], [p]: val } }));
  }

  async function save() {
    const parsed = {} as CapacityMatrix;
    for (const a of ALL_SIZES) {
      parsed[a] = {} as Record<Size, number>;
      for (const p of ALL_SIZES) {
        const n = Number(matrix[a][p]);
        if (!Number.isInteger(n) || n < 0) {
          toast.error(
            `Kapasitas ${SIZE_LABELS[a]} × ${SIZE_LABELS[p]} tidak valid.`
          );
          return;
        }
        parsed[a][p] = n;
      }
    }
    setSaving(true);
    try {
      await saveCapacityMatrix(parsed);
      toast.success("Matrix kapasitas disimpan.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border p-4">
        <table className="w-full min-w-[420px] border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                Alas ↓ / Packing →
              </th>
              {ALL_SIZES.map((p) => (
                <th
                  key={p}
                  className="text-center text-xs font-medium text-[color:var(--gold-hi)]"
                >
                  {SIZE_LABELS[p]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_SIZES.map((a) => (
              <tr key={a}>
                <td className="whitespace-nowrap text-sm font-medium text-[color:var(--gold-hi)]">
                  {SIZE_LABELS[a]}
                </td>
                {ALL_SIZES.map((p) => (
                  <td key={p}>
                    <Input
                      type="number"
                      min={0}
                      value={matrix[a][p]}
                      onChange={(e) => update(a, p, e.target.value)}
                      className="w-20 text-center tabular-nums"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Angka = total poin item yang muat untuk kombinasi itu. Poin item: Kecil
        1 · Sedang 2 · Besar 3.
      </p>
      <Button onClick={save} disabled={saving}>
        {saving ? "Menyimpan…" : "Simpan Matrix"}
      </Button>
    </div>
  );
}
