import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Mail, Loader2 } from "lucide-react";
import { adminGetTrips, adminSendBookingEmail, setTripStatus, Trip } from "../../lib/api";
import { money } from "../../lib/format";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  upcoming: "bg-brand-cyan/15 text-brand-cyan",
  active: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-slate-500/15 text-slate-300",
  cancelled: "bg-red-500/15 text-red-400",
};

const ALL_STATUSES = ["pending", "upcoming", "active", "completed", "cancelled"];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminTripsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const { data: trips = [], isLoading } = useQuery({ queryKey: ["admin-trips"], queryFn: adminGetTrips });

  const filtered = trips.filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchSearch = t.id.includes(search) || t.vehicleId.includes(search) || t.userId.includes(search);
    return matchStatus && (search ? matchSearch : true);
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusMut = useMutation({
    mutationFn: (a: { id: string; status: string }) => setTripStatus(a.id, a.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-trips"] }),
  });

  const emailMut = useMutation({
    mutationFn: (id: string) => adminSendBookingEmail(id),
    onSuccess: (_, id) => { setEmailSent(id); setTimeout(() => setEmailSent(null), 3000); },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Trips</h1>
          <p className="mt-1 text-sm text-slate-400">{trips.length} total bookings</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-brand-cyan text-ink-900" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Search by trip / user / vehicle ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="field pl-9" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No trips found</td></tr>
              ) : sorted.map((t) => (
                <tr key={t.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      onChange={(e) => statusMut.mutate({ id: t.id, status: e.target.value })}
                      className="rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-cyan/50"
                    >
                      {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{fmt(t.startDate)} → {fmt(t.endDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-cyan">{money(t.totalCost)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => emailMut.mutate(t.id)}
                        disabled={emailMut.isPending}
                        title="Resend booking confirmation email"
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          emailSent === t.id ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-400 hover:bg-white/15 hover:text-white"
                        }`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {emailSent === t.id ? "Sent!" : "Email"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
