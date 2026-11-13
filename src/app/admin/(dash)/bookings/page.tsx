import { getBookings } from "@/lib/actions/bookings";
import { BookingList } from "@/components/admin/booking-list";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const bookings = await getBookings();

  const total = bookings.length;
  const consented = bookings.filter((b) => b.consent).length;
  const bundle = bookings.filter((b) => b.kind === "BUNDLE").length;

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold">Booking</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Nomor WhatsApp & ringkasan pesanan yang masuk dari customer. Bahan untuk
        follow-up dan broadcast.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Booking" value={String(total)} />
        <StatTile label="Izin Promo" value={String(consented)} />
        <StatTile label="Bundle" value={String(bundle)} />
        <StatTile label="Custom" value={String(total - bundle)} />
      </div>

      <BookingList
        bookings={bookings.map((b) => ({
          id: b.id,
          name: b.name,
          whatsapp: b.whatsapp,
          kind: b.kind,
          summary: b.summary,
          total: b.total,
          eventDate: b.eventDate,
          consent: b.consent,
          createdAt: b.createdAt.toISOString(),
        }))}
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
