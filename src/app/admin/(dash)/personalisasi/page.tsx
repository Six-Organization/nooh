import { getPersonalizationFields } from "@/lib/actions/personalization";
import { PersonalizationManager } from "@/components/admin/personalization-manager";

export const dynamic = "force-dynamic";

export default async function PersonalisasiPage() {
  const fields = await getPersonalizationFields();

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Personalisasi</h1>
      <p className="mb-6 max-w-[60ch] text-sm text-muted-foreground">
        Field personalisasi untuk rakit (tipe kartu ucapan, warna pita, warna
        bunga, pesan kartu, dll). Pilihan diisi di sini, lalu dihubungkan ke
        jenis rakit. Tampil ke customer saat merakit.
      </p>

      <PersonalizationManager
        fields={fields.map((f) => ({
          id: f.id,
          name: f.name,
          kind: f.kind,
          required: f.required,
          sortOrder: f.sortOrder,
          options: f.options.map((o) => o.value),
          rakitTypeNames: f.rakitTypes.map((t) => t.name),
        }))}
      />
    </div>
  );
}
