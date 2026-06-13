import { useQuery } from "@tanstack/react-query";
import { Users, Car, Route, DollarSign, Clock, CheckCircle, Activity, ShieldCheck } from "lucide-react";
import { adminGetStats, adminGetVerifications, adminGetTrips } from "../../lib/api";
import { money } from "../../lib/format";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  upcoming: "bg-brand-cyan/15 text-brand-cyan",
  active: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-slate-500/15 text-slate-400",
  cancelled: "bg-red-500/15 text-red-400",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function Dashboard() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: adminGetStats, refetchInterval: 30_000 });
  const { data: verifications = [] } = useQuery({ queryKey: ["admin-verifications"], queryFn: adminGetVerifications });
  const { data: trips = [] } = useQuery({ queryKey: ["admin-trips"], queryFn: adminGetTrips });

  const pending = verifications.filter((v) => v.status === "pending");
  const recentTrips = [...trips].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">Platform overview at a glance.</p>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={stats?.totalUsers ?? "—"} color="cyan" />
        <StatCard icon={Car} label="Vehicles" value={stats ? `${stats.availableVehicles} / ${stats.totalVehicles}` : "—"} sub="available" color="amber" />
        <StatCard icon={Route} label="Active trips" value={stats?.activeTrips ?? "—"} sub={`${stats?.upcomingTrips ?? 0} upcoming`} color="emerald" />
        <StatCard icon={DollarSign} label="Total revenue" value={stats ? money(stats.totalRevenue) : "—"} sub={`${stats?.completedTrips ?? 0} completed trips`} color="purple" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Recent trips */}
        <div>
          <h2 className="mb-4 text-base font-bold">Recent bookings</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                  <th className="px-4 py-3">Trip ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No trips yet</td></tr>
                ) : recentTrips.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[t.status] || STATUS_COLORS.pending}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{fmt(t.startDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-cyan">{money(t.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending verifications */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">Pending verifications</h2>
            {pending.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-ink-900">{pending.length}</span>
            )}
          </div>
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="rounded-2xl border border-white/10 p-6 text-center text-sm text-slate-500">
                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-emerald-400" /> All clear — no pending reviews
              </div>
            ) : pending.slice(0, 5).map((v) => (
              <div key={v.id} className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
                <div className="flex items-start gap-3">
                  {v.vehicle?.imageUrl && (
                    <img src={v.vehicle.imageUrl} alt="" className="h-12 w-16 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sm">{v.vehicle?.name || "Vehicle"}</p>
                    <p className="text-xs text-slate-400">{v.ownerName}</p>
                    <a href="/admin/verifications" className="mt-1 text-xs text-brand-cyan hover:underline">Review →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  const colors: Record<string, string> = {
    cyan: "text-brand-cyan bg-brand-cyan/10",
    amber: "text-brand-amber bg-brand-amber/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className={`inline-flex rounded-xl p-2 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-2xl font-black">{value}</div>
      <div className="text-xs text-slate-400">{label}{sub && <> · {sub}</>}</div>
    </div>
  );
}
