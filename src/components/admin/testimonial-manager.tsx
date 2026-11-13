"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ImageIcon } from "lucide-react";
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
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type TestimonialInput,
} from "@/lib/actions/testimonials";

type MediaKind = "PHOTO" | "VIDEO";
type Testimonial = {
  id: number;
  name: string | null;
  caption: string | null;
  kind: MediaKind;
  mediaUrl: string;
  posterUrl: string | null;
  active: boolean;
  sortOrder: number;
};

function MediaPreview({
  kind,
  url,
  poster,
  className,
}: {
  kind: MediaKind;
  url: string;
  poster?: string | null;
  className?: string;
}) {
  if (!url)
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
      >
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  if (kind === "VIDEO")
    return (
      <video
        src={url}
        poster={poster ?? undefined}
        className={`object-cover ${className}`}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
      />
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="testimoni" className={`object-cover ${className}`} />;
}

export function TestimonialManager({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  function handleDelete(t: Testimonial) {
    if (!confirm("Hapus testimoni ini?")) return;
    startTransition(async () => {
      try {
        await deleteTestimonial(t.id);
        toast.success("Testimoni dihapus.");
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
          <Plus className="h-4 w-4" /> Tambah Testimoni
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Testimoni" : "Tambah Testimoni"}
              </DialogTitle>
            </DialogHeader>
            <TestimonialForm
              key={editing?.id ?? "new"}
              testimonial={editing}
              onDone={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {testimonials.length === 0 ? (
        <p className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
          Belum ada testimoni.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-lg border">
              <div className="relative">
                <MediaPreview
                  kind={t.kind}
                  url={t.mediaUrl}
                  poster={t.posterUrl}
                  className="aspect-[3/4] w-full"
                />
                <div className="absolute left-2 top-2 flex gap-1">
                  <Badge variant={t.kind === "VIDEO" ? "default" : "secondary"}>
                    {t.kind === "VIDEO" ? "Video" : "Foto"}
                  </Badge>
                  {!t.active && <Badge variant="outline">Nonaktif</Badge>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <p className="truncate text-xs text-muted-foreground">
                  {t.caption || t.name || "—"}
                </p>
                <div className="flex shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditing(t);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={pending}
                    onClick={() => handleDelete(t)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialForm({
  testimonial,
  onDone,
}: {
  testimonial: Testimonial | null;
  onDone: () => void;
}) {
  const [kind, setKind] = useState<MediaKind>(testimonial?.kind ?? "PHOTO");
  const [mediaUrl, setMediaUrl] = useState(testimonial?.mediaUrl ?? "");
  const [posterUrl, setPosterUrl] = useState(testimonial?.posterUrl ?? "");
  const [caption, setCaption] = useState(testimonial?.caption ?? "");
  const [name, setName] = useState(testimonial?.name ?? "");
  const [active, setActive] = useState(testimonial?.active ?? true);
  const [sortOrder, setSortOrder] = useState(String(testimonial?.sortOrder ?? 0));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "testimonials");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload gagal.");
      setMediaUrl(data.url);
      if (data.kind) setKind(data.kind);
      toast.success("Media terunggah.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mediaUrl.trim()) {
      toast.error("Upload atau tempel URL media dulu.");
      return;
    }
    const input: TestimonialInput = {
      name: name || null,
      caption: caption || null,
      kind,
      mediaUrl,
      posterUrl: posterUrl || null,
      active,
      sortOrder: Number(sortOrder) || 0,
    };
    setSaving(true);
    try {
      if (testimonial) {
        await updateTestimonial(testimonial.id, input);
        toast.success("Testimoni diperbarui.");
      } else {
        await createTestimonial(input);
        toast.success("Testimoni ditambahkan.");
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
      <div className="flex items-start gap-3">
        <MediaPreview
          kind={kind}
          url={mediaUrl}
          poster={posterUrl}
          className="h-24 w-20 shrink-0 rounded"
        />
        <div className="flex-1 space-y-2">
          <Label htmlFor="t-file">Upload foto (.webp) / video (.webm)</Label>
          <Input
            id="t-file"
            type="file"
            accept="image/*,video/*"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
          {uploading && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Mengunggah…
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Tips: konversi dulu ke WebP/WebM biar ringan. Video diputar otomatis.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="t-url">atau tempel URL media</Label>
        <Input
          id="t-url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="https://…/video.webm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="t-kind">Jenis</Label>
          <select
            id="t-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as MediaKind)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="PHOTO">Foto</option>
            <option value="VIDEO">Video</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="t-sort">Urutan</Label>
          <Input
            id="t-sort"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
      </div>

      {kind === "VIDEO" && (
        <div className="space-y-2">
          <Label htmlFor="t-poster">Poster video (opsional, URL gambar)</Label>
          <Input
            id="t-poster"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://…/poster.webp"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="t-caption">Keterangan (opsional)</Label>
        <Input
          id="t-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Parcel-nya cantik banget!"
        />
      </div>

      <div className="grid grid-cols-2 items-center gap-3">
        <div className="space-y-2">
          <Label htmlFor="t-name">Nama (opsional)</Label>
          <Input
            id="t-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bu Ayu"
          />
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Tampilkan
        </label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Menyimpan…" : testimonial ? "Simpan Perubahan" : "Tambah"}
        </Button>
      </DialogFooter>
    </form>
  );
}
