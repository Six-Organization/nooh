import { getProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { ProductManager } from "@/components/admin/product-manager";
import { Card } from "@/components/ui/card";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const totalProduk = products.length;
  const totalAlas = products.filter((p) => p.isBase).length;
  const totalKategori = categories.length;
  const nilaiStok = products.reduce((s, p) => s + p.hpp * p.stock, 0);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Produk</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Kelola produk: modal (HPP), harga jual, stok, foto, ukuran, dan kategori.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Produk" value={String(totalProduk)} />
        <StatTile label="Alas" value={String(totalAlas)} />
        <StatTile label="Kategori" value={String(totalKategori)} />
        <StatTile label="Nilai Stok (modal)" value={rupiah(nilaiStok)} />
      </div>

      <ProductManager
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          hpp: p.hpp,
          sellPrice: p.sellPrice,
          stock: p.stock,
          imageUrl: p.imageUrl,
          size: p.size,
          isBase: p.isBase,
          categories: p.categories.map((c) => ({ id: c.id, name: c.name })),
          leadTimeTiers: p.leadTimeTiers.map((t) => ({
            minQty: t.minQty,
            maxQty: t.maxQty,
            days: t.days,
          })),
        }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 p-4">
      <div className="font-serif text-2xl font-semibold tabular-nums text-[color:var(--gold-hi)]">
        {value}
      </div>
      <div className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
    </Card>
  );
}
