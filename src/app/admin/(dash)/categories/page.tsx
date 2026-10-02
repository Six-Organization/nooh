import { getCategories } from "@/lib/actions/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Kategori</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Tag untuk mengelompokkan produk (mis. dupa, alas sok, isian).
      </p>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          count: c._count.products,
        }))}
      />
    </div>
  );
}
