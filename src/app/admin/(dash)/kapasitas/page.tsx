import { getCapacityMatrix } from "@/lib/actions/capacity";
import { CapacityMatrixEditor } from "@/components/admin/capacity-matrix-editor";

export const dynamic = "force-dynamic";

export default async function KapasitasPage() {
  const matrix = await getCapacityMatrix();

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">
        Kapasitas Rakit
      </h1>
      <p className="mb-6 max-w-[60ch] text-sm text-muted-foreground">
        Matrix kapasitas custom parcel: berapa poin item yang muat untuk tiap
        kombinasi ukuran alas × ukuran packing. Customer memilih alas + packing,
        lalu mengisi item sampai total poin mencapai nilai di sini.
      </p>
      <CapacityMatrixEditor initial={matrix} />
    </div>
  );
}
