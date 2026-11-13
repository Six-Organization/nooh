"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, MessageCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rupiah } from "@/lib/format";
import { deleteBooking } from "@/lib/actions/bookings";

export type BookingRow = {
  id: number;
  name: string | null;
  whatsapp: string;
  kind: string;
  summary: string;
  total: number | null;
  eventDate: string | null;
  consent: boolean;
  createdAt: string;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingList({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(b: BookingRow) {
    if (!confirm(`Hapus booking dari ${b.name ?? b.whatsapp}?`)) return;
    startTransition(async () => {
      try {
        await deleteBooking(b.id);
        toast.success("Booking dihapus.");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menghapus.");
      }
    });
  }

  async function copyConsented() {
    const nums = Array.from(
      new Set(bookings.filter((b) => b.consent).map((b) => b.whatsapp))
    );
    if (nums.length === 0) {
      toast.error("Belum ada nomor dengan izin dihubungi.");
      return;
    }
    try {
      await navigator.clipboard.writeText(nums.join(", "));
      toast.success(`${nums.length} nomor disalin.`);
    } catch {
      toast.error("Gagal menyalin.");
    }
  }

  if (bookings.length === 0)
    return (
      <p className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
        Belum ada booking masuk.
      </p>
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={copyConsented}>
          <Copy className="h-4 w-4" /> Salin nomor (izin promo)
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Ringkasan</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Acara</TableHead>
                <TableHead>Promo</TableHead>
                <TableHead className="w-20 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateTime(b.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {b.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://wa.me/${b.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[color:var(--gold-hi)] hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {b.whatsapp}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.kind === "BUNDLE" ? "default" : "outline"}>
                      {b.kind === "BUNDLE" ? "Bundle" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[260px] text-xs text-muted-foreground">
                    {b.summary}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {b.total != null ? rupiah(b.total) : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {b.eventDate ?? "—"}
                  </TableCell>
                  <TableCell>
                    {b.consent ? (
                      <Badge variant="secondary">Ya</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => handleDelete(b)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
