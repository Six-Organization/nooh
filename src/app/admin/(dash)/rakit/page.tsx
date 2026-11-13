import { getRakitTypes } from "@/lib/actions/rakit-types";
import { getCustomerProducts } from "@/lib/actions/products";
import { getPersonalizationFields } from "@/lib/actions/personalization";
import { RakitTypeManager } from "@/components/admin/rakit-type-manager";

export const dynamic = "force-dynamic";

export default async function RakitTypesPage() {
  const [types, products, fields] = await Promise.all([
    getRakitTypes(),
    getCustomerProducts(),
    getPersonalizationFields(),
  ]);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Jenis Rakit</h1>
      <p className="mb-6 max-w-[60ch] text-sm text-muted-foreground">
        Jenis rakitan custom (parcel, buket, dll). Tiap jenis punya kumpulan
        produk & field personalisasi sendiri, tampil di <code>/rakit</code>.
      </p>

      <RakitTypeManager
        types={types.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          active: t.active,
          sortOrder: t.sortOrder,
          productIds: t.products.map((p) => p.id),
          fieldIds: t.fields.map((f) => f.id),
        }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.type,
        }))}
        fields={fields.map((f) => ({ id: f.id, name: f.name }))}
      />
    </div>
  );
}
