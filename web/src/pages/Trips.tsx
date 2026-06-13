import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, CreditCard, MapPin, CalendarDays, Loader2, Car } from "lucide-react";
import { getMyTrips, cancelTrip, Trip } from "../lib/api";
import { money } from "../lib/format";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function Trips() {
  const [params, setParams] = useSearchParams();
  const justBooked = params.get("booked") === "1";
  const qc = useQueryClient();
  const { data: trips = [], isLoading } = useQuery({ queryKey: ["my-trips"], queryFn: getMyTrips });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelTrip(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-trips"] }),
  });

  const upcoming = trips.filter((t) => ["pending", "upcoming", "confirmed", "active"].includes(t.status));
  const past = trips.filter((t) => t.status === "completed");
  const cancelled = trips.filter((t) => t.status === "cancelled");

  return (
    <div className="container-rush py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Your trips</h1>

      {justBooked && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
          <div>
            <div className="font-semibold text-emerald-200">Reservation requested!</div>
            <div className="text-sm text-emerald-200/80">Complete payment to confirm your trip — the payment step is coming soon.</div>
          </div>
          <button onClick={() => { params.delete("booked"); setParams(params); }} className="ml-auto text-sm text-emerald-200/70 hover:text-white">Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 grid gap-5"><div className="panel h-40 animate-pulse bg-white/[0.03]" /></div>
      ) : trips.length === 0 ? (
        <div className="mt-8 panel flex flex-col items-center justify-center py-20 text-center">
          <Car className="h-10 w-10 text-slate-500" />
          <p className="mt-4 text-lg font-semibold">No trips yet</p>
          <p className="mt-1 text-sm text-slate-400">Find a car and book your first drive.</p>
          <Link to="/cars" className="btn-primary mt-5 px-5 py-2.5 text-sm">Browse cars</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <Group title="Upcoming" trips={upcoming} onCancel={(id) => cancel.mutate(id)} canceling={cancel.isPending} />
          <Group title="Past" trips={past} />
          <Group title="Cancelled" trips={cancelled} muted />
        </div>
      )}
    </div>
  );
}

function Group({ title, trips, onCancel, canceling, muted }: {
  title: string; trips: Trip[]; onCancel?: (id: string) => void; canceling?: boolean; muted?: boolean;
}) {
  if (trips.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-slate-200">{title} <span className="text-sm font-normal text-slate-500">({trips.length})</span></h2>
      <div className="grid gap-5 md:grid-cols-2">
        {trips.map((t) => <TripCard key={t.id} t={t} onCancel={onCancel} canceling={canceling} muted={muted} />)}
      </div>
    </section>
  );
}

function TripCard({ t, onCancel, canceling, muted }: { t: Trip; onCancel?: (id: string) => void; canceling?: boolean; muted?: boolean }) {
  const v = t.vehicle;
  const pending = t.status === "pending";
  return (
    <div className={`panel overflow-hidden ${muted ? "opacity-60" : ""}`}>
      <div className="flex gap-4 p-4">
        {v?.imageUrl && <img src={v.imageUrl} alt={v?.name} className="h-24 w-32 shrink-0 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link to={v ? `/cars/${v.id}` : "#"} className="truncate font-bold hover:text-brand-cyan">{v?.name || "Vehicle"}</Link>
            <StatusBadge status={t.status} />
          </div>
          <div className="mt-2 space-y-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {fmt(t.startDate)} → {fmt(t.endDate)}</div>
            <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {t.pickupLocation}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
        <span className="text-sm"><span className="text-slate-400">Total </span><span className="font-extrabold text-brand-cyan">{money(t.totalCost)}</span></span>
        <div className="flex items-center gap-2">
          {pending && (
            <button disabled title="Payment coming soon" className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
              <CreditCard className="h-3.5 w-3.5" /> Pay now (soon)
            </button>
          )}
          {onCancel && (t.status === "pending" || t.status === "upcoming") && (
            <button onClick={() => { if (confirm("Cancel this trip?")) onCancel(t.id); }} disabled={canceling}
              className="inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20">
              {canceling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: string; icon: any; label: string }> = {
    pending: { tone: "bg-amber-500/15 text-amber-300 ring-amber-400/30", icon: Clock, label: "Payment pending" },
    upcoming: { tone: "bg-brand-cyan/15 text-brand-cyan ring-brand-cyan/30", icon: CalendarDays, label: "Upcoming" },
    confirmed: { tone: "bg-brand-cyan/15 text-brand-cyan ring-brand-cyan/30", icon: CheckCircle2, label: "Confirmed" },
    active: { tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30", icon: Car, label: "Active" },
    completed: { tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30", icon: CheckCircle2, label: "Completed" },
    cancelled: { tone: "bg-white/5 text-slate-400 ring-white/15", icon: Clock, label: "Cancelled" },
  };
  const s = map[status] || map.upcoming;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.tone}`}>
      <s.icon className="h-3 w-3" /> {s.label}
    </span>
  );
}
