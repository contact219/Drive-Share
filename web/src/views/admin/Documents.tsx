import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, XCircle, Loader2, X, FileText, Users, ChevronDown, ChevronRight, Plus } from "lucide-react";
import {
  adminGetUsers, adminGetDocuments, adminGetUserDocuments,
  adminReviewDocument, adminCreateDocument,
  UserDocument, AdminUser,
} from "../../lib/api";
import { useAuth } from "../../lib/auth";

const DOC_TYPES = [
  { key: "drivers_license",       label: "Driver's License",        hint: "Required for all renters" },
  { key: "proof_of_insurance",    label: "Proof of Insurance",      hint: "Required for all renters" },
  { key: "vehicle_registration",  label: "Vehicle Registration",    hint: "Required for hosts" },
  { key: "vin_number",            label: "VIN Number / Photo",      hint: "Required for hosts" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/15 text-red-400",
};

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

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

function DocRow({ doc, onApprove, onReject, busy }: {
  doc: UserDocument; onApprove: () => void; onReject: () => void; busy: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      <div className="min-w-0">
        {doc.fileName && <div className="text-xs font-semibold text-slate-200 truncate">{doc.fileName}</div>}
        <div className="text-xs text-slate-400">Submitted {fmt(doc.createdAt)}</div>
        {doc.reviewNotes && <div className="mt-0.5 text-xs text-slate-500 truncate">{doc.reviewNotes}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[doc.verificationStatus] || STATUS_COLORS.pending}`}>
          {doc.verificationStatus}
        </span>
        {doc.documentUrl && (
          <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-400 hover:text-white">View</a>
        )}
        {doc.verificationStatus === "pending" && (
          <>
            <button onClick={onApprove} disabled={busy}
              className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50">
              <BadgeCheck className="inline h-3.5 w-3.5 mr-1" />Approve
            </button>
            <button onClick={onReject} disabled={busy}
              className="rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50">
              <XCircle className="inline h-3.5 w-3.5 mr-1" />Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function UserDocPanel({ user, reviewerId }: { user: AdminUser; reviewerId: string }) {
  const [open, setOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ doc: UserDocument; type: string } | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const qc = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["admin-user-docs", user.id],
    queryFn: () => adminGetUserDocuments(user.id),
    enabled: open,
  });

  const reviewMut = useMutation({
    mutationFn: (a: { id: string; status: string; notes?: string }) =>
      adminReviewDocument(a.id, a.status, reviewerId, a.notes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-user-docs", user.id] }); setRejectTarget(null); },
  });

  const createMut = useMutation({
    mutationFn: (docType: string) => adminCreateDocument(user.id, docType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-user-docs", user.id] }),
  });

  const docsByType = DOC_TYPES.map((dt) => ({
    ...dt,
    records: docs.filter((d) => d.documentType === dt.key),
  }));

  const pendingCount = docs.filter((d) => d.verificationStatus === "pending").length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-cyan/15 text-xs font-bold text-brand-cyan">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-sm">{user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-300">{pendingCount} pending</span>
          )}
          {open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
          ) : docsByType.map((dt) => (
            <div key={dt.key}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold">{dt.label}</span>
                  <span className="ml-2 text-xs text-slate-500">{dt.hint}</span>
                </div>
                <button
                  onClick={() => createMut.mutate(dt.key)}
                  disabled={createMut.isPending}
                  title="Add record"
                  className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/15 hover:text-white disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {dt.records.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-500">
                  No documents submitted
                </div>
              ) : (
                <div className="space-y-2">
                  {dt.records.map((doc) => (
                    <DocRow
                      key={doc.id} doc={doc}
                      busy={reviewMut.isPending}
                      onApprove={() => reviewMut.mutate({ id: doc.id, status: "approved" })}
                      onReject={() => { setRejectTarget({ doc, type: dt.label }); setRejectNotes(""); }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <Modal title={`Reject: ${rejectTarget.type}`} onClose={() => setRejectTarget(null)}>
          <p className="mb-3 text-sm text-slate-400">User: <span className="text-white">{user.name}</span></p>
          <textarea rows={3} placeholder="Notes for rejection…" value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)} className="field resize-none" />
          <button
            onClick={() => reviewMut.mutate({ id: rejectTarget.doc.id, status: "rejected", notes: rejectNotes })}
            disabled={reviewMut.isPending}
            className="mt-4 w-full rounded-xl bg-red-500/15 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            {reviewMut.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Confirm rejection"}
          </button>
        </Modal>
      )}
    </div>
  );
}

export default function AdminDocumentsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"users" | "queue">("queue");
  const [search, setSearch] = useState("");

  const { data: allDocs = [], isLoading: docsLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: adminGetDocuments,
    enabled: tab === "queue",
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminGetUsers,
    enabled: tab === "users",
  });

  const pendingCount = allDocs.filter((d) => d.verificationStatus === "pending").length;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-slate-400">Identity & vehicle document verification</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab("queue")} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === "queue" ? "bg-brand-cyan text-ink-900" : "bg-white/5 text-slate-400"}`}>
            Queue {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button onClick={() => setTab("users")} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === "users" ? "bg-brand-cyan text-ink-900" : "bg-white/5 text-slate-400"}`}>
            <Users className="inline mr-1 h-3 w-3" />By User
          </button>
        </div>
      </div>

      {tab === "queue" && (
        docsLoading ? (
          <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : allDocs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 py-16 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-500" />
            <p className="font-semibold">No documents submitted yet</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allDocs.map((d) => (
                  <AdminDocRow key={d.id} doc={d} reviewerId={user!.id} />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === "users" && (
        <div className="mt-5 space-y-3">
          <input
            type="text" placeholder="Search users…" value={search}
            onChange={(e) => setSearch(e.target.value)} className="field"
          />
          {usersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No users found</div>
          ) : (
            filteredUsers.map((u) => (
              <UserDocPanel key={u.id} user={u} reviewerId={user!.id} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AdminDocRow({ doc, reviewerId }: { doc: UserDocument; reviewerId: string }) {
  const qc = useQueryClient();
  const [showReject, setShowReject] = useState(false);
  const [notes, setNotes] = useState("");

  const reviewMut = useMutation({
    mutationFn: (a: { id: string; status: string; notes?: string }) =>
      adminReviewDocument(a.id, a.status, reviewerId, a.notes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-documents"] }); setShowReject(false); },
  });

  const docLabel = DOC_TYPES.find((d) => d.key === doc.documentType)?.label || doc.documentType.replace(/_/g, " ");

  return (
    <>
      <tr className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
        <td className="px-4 py-3">
          <div className="font-medium">{doc.userName}</div>
          <div className="text-xs text-slate-500">{doc.userEmail}</div>
        </td>
        <td className="px-4 py-3">
          <div className="text-slate-300 capitalize">{docLabel}</div>
          {doc.fileName && <div className="text-xs text-slate-500 truncate max-w-[160px]">{doc.fileName}</div>}
        </td>
        <td className="px-4 py-3 text-slate-400">{fmt(doc.createdAt)}</td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[doc.verificationStatus] || STATUS_COLORS.pending}`}>
            {doc.verificationStatus}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            {doc.documentUrl && (
              <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white">View</a>
            )}
            {doc.verificationStatus === "pending" && (
              <>
                <button onClick={() => reviewMut.mutate({ id: doc.id, status: "approved" })} disabled={reviewMut.isPending}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50">
                  <BadgeCheck className="h-3.5 w-3.5" /> Approve
                </button>
                <button onClick={() => { setShowReject(true); setNotes(""); }} disabled={reviewMut.isPending}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50">
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {showReject && (
        <tr className="border-b border-white/[0.05]">
          <td colSpan={5} className="px-4 pb-3">
            <div className="flex gap-2">
              <textarea rows={2} placeholder="Rejection notes…" value={notes} onChange={(e) => setNotes(e.target.value)}
                className="field flex-1 resize-none text-xs" />
              <div className="flex flex-col gap-1.5">
                <button onClick={() => reviewMut.mutate({ id: doc.id, status: "rejected", notes })} disabled={reviewMut.isPending}
                  className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50">
                  {reviewMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
                </button>
                <button onClick={() => setShowReject(false)} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
