import { Card } from "@/components/ui/card";

type Testimonial = {
  id: number;
  name: string | null;
  caption: string | null;
  kind: "PHOTO" | "VIDEO";
  mediaUrl: string;
  posterUrl: string | null;
};

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimoni" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <span className="eyebrow">Kata Mereka</span>
          <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,3rem)] font-semibold">
            Testimoni Pelanggan
          </h2>
          <p className="mx-auto mt-3 max-w-[48ch] text-sm text-muted-foreground">
            Momen bahagia dari parcel &amp; hampers yang sudah dirangkai.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {testimonials.map((t) => (
            <Card key={t.id} className="gap-0 overflow-hidden p-0">
              <div className="thumb-bg aspect-[3/4] w-full overflow-hidden">
                {t.kind === "VIDEO" ? (
                  <video
                    src={t.mediaUrl}
                    poster={t.posterUrl ?? undefined}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.mediaUrl}
                    alt={t.caption ?? t.name ?? "Testimoni"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              {(t.caption || t.name) && (
                <div className="space-y-0.5 p-3">
                  {t.caption && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {t.caption}
                    </p>
                  )}
                  {t.name && (
                    <p className="text-xs font-medium text-[color:var(--gold-hi)]">
                      — {t.name}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
