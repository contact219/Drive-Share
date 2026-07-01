import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, RotateCcw, Loader2 } from "lucide-react";
import { adminGetPayments, adminRefundPayment, Payment } from "../../lib/api";
import { money } from "../../lib/format";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  completed: "bg-emerald-500/15 text-emerald-400",
  refunded: "bg-purple-500/15 text-purple-400",
  failed: "bg-red-500/15 text-red-400",
};

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: payments = [], isLoading } = useQuery({ queryKey: ["admin-payments"], queryFn: adminGetPayments });

  const filtered = payments.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = !search || p.id.includes(search) || p.tripId.includes(search) || p.userId.includes(search);
    return matchStatus && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const refundMut = useMutation({
    mutationFn: (id: string) => adminRefundPayment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payments"] }),
  });

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((s, p) => s + parseFloat(p.amount || "0"), 0);
  const totalRefunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + parseFloat(p.amount || "0"), 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payments</h1>
          <p className="mt-1 text-sm text-slate-400">{payments.length} transactions</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-slate-400">Completed revenue</div>
          <div className="mt-1 text-2xl font-black text-brand-cyan">{money(totalRevenue)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-slate-400">Total refunded</div>
          <div className="mt-1 text-2xl font-black text-purple-400">{money(totalRefunded)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-slate-400">Net revenue</div>
          <div className="mt-1 text-2xl font-black text-emerald-400">{money(totalRevenue - totalRefunded)}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="field pl-9" />
        </div>
        {["all", "pending", "completed", "refunded", "failed"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-brand-cyan text-ink-900" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Platform fee</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No payments found</td></tr>
              ) : sorted.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-slate-300">{fmt(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[p.status] || STATUS_COLORS.pending}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-cyan">{money(p.amount)}</td>
                  <td className="px-4 py-3 text-right text-slate-400">{p.platformFee ? money(p.platformFee) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "completed" && (
                      <button
                        onClick={() => { if (confirm("Issue refund and cancel trip?")) refundMut.mutate(p.id); }}
                        disabled={refundMut.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Refund
                      </button>
                    )}
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
