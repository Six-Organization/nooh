import { getTestimonials } from "@/lib/actions/testimonials";
import { TestimonialManager } from "@/components/admin/testimonial-manager";

export const dynamic = "force-dynamic";

export default async function TestimoniPage() {
  const testimonials = await getTestimonials();

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Testimoni</h1>
      <p className="mb-6 max-w-[60ch] text-sm text-muted-foreground">
        Foto &amp; video testimoni yang tampil di landing page. Konversi media ke
        WebP (foto) / WebM (video) biar ringan; video diputar otomatis.
      </p>

      <TestimonialManager
        testimonials={testimonials.map((t) => ({
          id: t.id,
          name: t.name,
          caption: t.caption,
          kind: t.kind,
          mediaUrl: t.mediaUrl,
          posterUrl: t.posterUrl,
          active: t.active,
          sortOrder: t.sortOrder,
        }))}
      />
    </div>
  );
}
