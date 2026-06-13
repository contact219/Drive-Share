import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, XCircle, Loader2, X } from "lucide-react";
import { adminGetVerifications, adminVerifyDecision, Verification } from "../../lib/api";
import { useAuth } from "../../lib/auth";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#0d1117] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-white" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/15 text-red-400",
};

export default function AdminVerificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [rejectTarget, setRejectTarget] = useState<Verification | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notes, setNotes] = useState("");

  const { data: verifications = [], isLoading } = useQuery({ queryKey: ["admin-verifications"], queryFn: adminGetVerifications });

  const displayed = tab === "pending" ? verifications.filter((v) => v.status === "pending") : verifications;

  const decideMut = useMutation({
    mutationFn: (a: { id: string; status: string; notes?: string; reason?: string }) =>
      adminVerifyDecision(a.id, a.status, user!.id, a.notes, a.reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-verifications"] }); setRejectTarget(null); },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Verifications</h1>
          <p className="mt-1 text-sm text-slate-400">Review vehicle listing submissions</p>
        </div>
        <div className="flex gap-2">
          {(["pending", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === t ? "bg-brand-cyan text-ink-900" : "bg-white/5 text-slate-400"}`}>
              {t === "pending" ? `Pending (${verifications.filter((v) => v.status === "pending").length})` : "All"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
      ) : displayed.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 py-16 text-center">
          <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
          <p className="font-semibold">All clear!</p>
          <p className="mt-1 text-sm text-slate-500">No pending verifications.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {displayed.map((v) => (
            <div key={v.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start gap-4">
                {v.vehicle?.imageUrl && (
                  <img src={v.vehicle.imageUrl} alt={v.vehicle?.name} className="h-24 w-32 rounded-xl object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold">{v.vehicle?.name || "Vehicle"}</h3>
                      <p className="text-sm text-slate-400">{v.vehicle?.year} · {v.vehicle?.type}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[v.status] || STATUS_COLORS.pending}`}>
                      {v.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-sm text-slate-400">
                    <p>Host: <span className="text-slate-200">{v.ownerName}</span></p>
                    <p>Email: <span className="text-slate-200">{v.ownerEmail}</span></p>
                  </div>
                  {v.reviewNotes && <p className="mt-2 text-xs text-slate-400">Notes: {v.reviewNotes}</p>}
                  {v.rejectionReason && <p className="mt-1 text-xs text-red-300">Reason: {v.rejectionReason}</p>}
                </div>
              </div>

              {v.status === "pending" && (
                <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                  <button
                    onClick={() => decideMut.mutate({ id: v.id, status: "approved" })}
                    disabled={decideMut.isPending}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                  >
                    <BadgeCheck className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => { setRejectTarget(v); setRejectReason(""); setNotes(""); }}
                    disabled={decideMut.isPending}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <Modal title="Reject vehicle" onClose={() => setRejectTarget(null)}>
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Vehicle: <span className="text-white">{rejectTarget.vehicle?.name}</span></p>
            <textarea rows={3} placeholder="Rejection reason (sent to host)…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="field resize-none" />
            <textarea rows={2} placeholder="Internal notes (optional)…" value={notes} onChange={(e) => setNotes(e.target.value)} className="field resize-none" />
          </div>
          <button
            onClick={() => decideMut.mutate({ id: rejectTarget.id, status: "rejected", notes, reason: rejectReason })}
            disabled={decideMut.isPending || !rejectReason.trim()}
            className="mt-5 w-full rounded-xl bg-red-500/15 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            {decideMut.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Confirm rejection"}
          </button>
        </Modal>
      )}
    </div>
  );
}
