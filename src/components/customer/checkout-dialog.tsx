"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createBooking } from "@/lib/actions/bookings";

export type CheckoutPayload = {
  kind: "BUNDLE" | "CUSTOM";
  summary: string;
  total: number | null;
  eventDate: string | null;
  waMessage: string;
};

export function CheckoutDialog({
  open,
  onOpenChange,
  payload,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payload: CheckoutPayload | null;
}) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function openWA(message: string) {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    if (!number) {
      toast.error("Nomor WhatsApp admin belum diatur.");
      return;
    }
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payload) return;

    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 9) {
      toast.error("Masukkan nomor WhatsApp yang valid.");
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        name: name || null,
        whatsapp,
        kind: payload.kind,
        summary: payload.summary,
        total: payload.total,
        eventDate: payload.eventDate,
        consent,
      });
    } catch (err) {
      // Jangan blok customer kalau simpan gagal — lanjut ke WA.
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan data, lanjut ke WA."
      );
    } finally {
      setSubmitting(false);
    }

    openWA(payload.waMessage);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lanjut ke WhatsApp</DialogTitle>
          <DialogDescription>
            Isi kontakmu dulu, lalu kami arahkan ke WhatsApp dengan ringkasan
            pesanan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="co-name">Nama (opsional)</Label>
            <Input
              id="co-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="co-wa">Nomor WhatsApp</Label>
            <Input
              id="co-wa"
              type="tel"
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="0812xxxxxxx"
              required
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            Boleh dihubungi untuk info promo &amp; produk baru.
          </label>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Memproses…" : "Lanjut ke WhatsApp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
