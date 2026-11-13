import { getBroadcastAudience } from "@/lib/actions/broadcast";
import { BroadcastPanel } from "@/components/admin/broadcast-panel";

export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const audience = await getBroadcastAudience();
  const enabled = Boolean(process.env.FONNTE_TOKEN);

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Broadcast WA</h1>
      <p className="mb-6 max-w-[60ch] text-sm text-muted-foreground">
        Kirim pesan ke nomor customer yang memberi izin promo (dari Booking).
        Pakai gateway Fonnte. Kirim hanya saat kamu tekan tombol — tidak otomatis.
      </p>

      <BroadcastPanel audience={audience} enabled={enabled} />
    </div>
  );
}
