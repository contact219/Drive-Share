import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, XCircle, Loader2, X, FileText } from "lucide-react";
import { adminGetDocuments, adminReviewDocument, UserDocument } from "../../lib/api";
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

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminDocumentsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [rejectTarget, setRejectTarget] = useState<UserDocument | null>(null);
  const [notes, setNotes] = useState("");

  const { data: docs = [], isLoading } = useQuery({ queryKey: ["admin-documents"], queryFn: adminGetDocuments });

  const displayed = tab === "pending" ? docs.filter((d) => d.verificationStatus === "pending") : docs;

  const reviewMut = useMutation({
    mutationFn: (a: { id: string; status: string; notes?: string }) =>
      adminReviewDocument(a.id, a.status, user!.id, a.notes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-documents"] }); setRejectTarget(null); },
  });

  const pendingCount = docs.filter((d) => d.verificationStatus === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-slate-400">User identity & license verification queue</p>
        </div>
        <div className="flex gap-2">
          {(["pending", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === t ? "bg-brand-cyan text-ink-900" : "bg-white/5 text-slate-400"}`}>
              {t === "pending" ? `Pending (${pendingCount})` : "All"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
      ) : displayed.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <p className="font-semibold">No documents</p>
          <p className="mt-1 text-sm text-slate-500">{tab === "pending" ? "No pending reviews." : "No documents submitted yet."}</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Document type</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((d) => (
                <tr key={d.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{d.userName}</div>
                    <div className="text-xs text-slate-500">{d.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{d.documentType.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-slate-400">{fmt(d.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[d.verificationStatus] || STATUS_COLORS.pending}`}>
                      {d.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {d.documentUrl && (
                        <a href={d.documentUrl} target="_blank" rel="noopener noreferrer"
                          className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white">
                          View
                        </a>
                      )}
                      {d.verificationStatus === "pending" && (
                        <>
                          <button
                            onClick={() => reviewMut.mutate({ id: d.id, status: "approved" })}
                            disabled={reviewMut.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                          >
                            <BadgeCheck className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => { setRejectTarget(d); setNotes(""); }}
                            disabled={reviewMut.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectTarget && (
        <Modal title="Reject document" onClose={() => setRejectTarget(null)}>
          <p className="mb-3 text-sm text-slate-400">User: <span className="text-white">{rejectTarget.userName}</span> · {rejectTarget.documentType}</p>
          <textarea rows={3} placeholder="Review notes / reason for rejection…" value={notes} onChange={(e) => setNotes(e.target.value)} className="field resize-none" />
          <button
            onClick={() => reviewMut.mutate({ id: rejectTarget.id, status: "rejected", notes })}
            disabled={reviewMut.isPending}
            className="mt-5 w-full rounded-xl bg-red-500/15 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            {reviewMut.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Confirm rejection"}
          </button>
        </Modal>
      )}
    </div>
  );
}
