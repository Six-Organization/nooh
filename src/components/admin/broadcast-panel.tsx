"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Users, AlertTriangle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  sendBroadcast,
  type BroadcastContact,
  type BroadcastResult,
} from "@/lib/actions/broadcast";

export function BroadcastPanel({
  audience,
  enabled,
}: {
  audience: BroadcastContact[];
  enabled: boolean;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);

  async function copyNumbers() {
    try {
      await navigator.clipboard.writeText(
        audience.map((a) => a.whatsapp).join(", ")
      );
      toast.success(`${audience.length} nomor disalin.`);
    } catch {
      toast.error("Gagal menyalin.");
    }
  }

  async function send() {
    if (!message.trim()) {
      toast.error("Tulis pesan dulu.");
      return;
    }
    if (
      !confirm(
        `Kirim broadcast ke ${audience.length} nomor ber-consent sekarang?`
      )
    )
      return;
    setSending(true);
    setResult(null);
    try {
      const r = await sendBroadcast(message);
      setResult(r);
      toast.success(`Terkirim ${r.sent} dari ${r.total}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengirim.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      {!enabled && (
        <div className="flex items-start gap-2 rounded-lg border border-[color:var(--border-warning,#854f0b)] bg-[color:var(--bg-warning,rgba(133,79,11,0.12))] p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-hi)]" />
          <div>
            <p className="font-medium">Broadcast belum aktif.</p>
            <p className="text-muted-foreground">
              Set <code>FONNTE_TOKEN</code> di environment (daftar di Fonnte →
              salin token device). Kamu tetap bisa menyusun pesan & menyalin
              nomor untuk kirim manual.
            </p>
          </div>
        </div>
      )}

      <Card className="gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[color:var(--gold-hi)]" />
            <span className="font-medium">
              {audience.length} nomor ber-consent
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={copyNumbers}>
            <Copy className="h-4 w-4" /> Salin nomor
          </Button>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bc-msg" className="text-sm font-medium">
            Pesan broadcast
          </label>
          <textarea
            id="bc-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Halo! Ada koleksi parcel baru untuk Galungan. Cek di…"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Hanya dikirim ke nomor yang memberi izin promo. Jangan spam — risiko
            nomor WA terblokir.
          </p>
        </div>

        <Button
          onClick={send}
          disabled={sending || !enabled || audience.length === 0}
          className="w-fit"
        >
          <Send className="h-4 w-4" />
          {sending ? "Mengirim…" : "Kirim Broadcast"}
        </Button>

        {result && (
          <div className="rounded-md border p-3 text-sm">
            <p>
              Terkirim{" "}
              <span className="font-medium text-[color:var(--gold-hi)]">
                {result.sent}
              </span>{" "}
              · gagal{" "}
              <span className="font-medium text-destructive">
                {result.failed}
              </span>{" "}
              dari {result.total}.
            </p>
            {result.errors.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {result.errors.slice(0, 3).join(" · ")}
              </p>
            )}
          </div>
        )}
      </Card>

      {audience.length > 0 && (
        <details className="rounded-lg border p-3 text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            Lihat daftar nomor
          </summary>
          <ul className="mt-2 space-y-1">
            {audience.map((a) => (
              <li key={a.whatsapp} className="text-xs">
                {a.whatsapp}
                {a.name ? ` — ${a.name}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
