import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ShieldCheck, Trash2, KeyRound, Loader2, X } from "lucide-react";
import {
  adminGetUsers, adminCreateUser, adminUpdateUser,
  adminResetPassword, adminDeleteUser, AdminUser,
} from "../../lib/api";

function Badge({ admin }: { admin: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
      admin ? "bg-brand-cyan/15 text-brand-cyan" : "bg-white/5 text-slate-400"
    }`}>
      {admin && <ShieldCheck className="h-3 w-3" />} {admin ? "Admin" : "User"}
    </span>
  );
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

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [newPwd, setNewPwd] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", isAdmin: false });
  const [err, setErr] = useState("");

  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: adminGetUsers });

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const createMut = useMutation({
    mutationFn: () => adminCreateUser(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); setShowCreate(false); setForm({ name: "", email: "", password: "", isAdmin: false }); setErr(""); },
    onError: (e: any) => setErr(e.message),
  });

  const toggleAdmin = useMutation({
    mutationFn: (u: AdminUser) => adminUpdateUser(u.id, { isAdmin: !u.isAdmin }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const resetPwd = useMutation({
    mutationFn: () => adminResetPassword(resetTarget!.id, newPwd),
    onSuccess: () => { setResetTarget(null); setNewPwd(""); },
    onError: (e: any) => setErr(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminDeleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-400">{users.length} accounts registered</p>
        </div>
        <button onClick={() => { setShowCreate(true); setErr(""); }} className="btn-primary px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Add user
        </button>
      </div>

      <div className="mt-5 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text" placeholder="Search by name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field pl-9"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No users found</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3"><Badge admin={u.isAdmin} /></td>
                  <td className="px-4 py-3 text-slate-400">{u.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleAdmin.mutate(u)}
                        title={u.isAdmin ? "Remove admin" : "Make admin"}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${u.isAdmin ? "bg-white/10 text-slate-300 hover:bg-white/20" : "bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20"}`}
                      >
                        {u.isAdmin ? "Demote" : "Make admin"}
                      </button>
                      <button
                        onClick={() => { setResetTarget(u); setNewPwd(""); setErr(""); }}
                        title="Reset password"
                        className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/15 hover:text-white"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${u.name}?`)) deleteMut.mutate(u.id); }}
                        className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create user modal */}
      {showCreate && (
        <Modal title="Add user" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <input className="field" placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <input className="field" placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <input className="field" placeholder="Password (min 8 chars)" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <label className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm((f) => ({ ...f, isAdmin: e.target.checked }))} className="accent-cyan-400" />
              Grant admin access
            </label>
          </div>
          {err && <p className="mt-3 text-sm text-red-300">{err}</p>}
          <button
            onClick={() => createMut.mutate()}
            disabled={createMut.isPending || !form.name || !form.email || form.password.length < 8}
            className="btn-primary mt-5 w-full py-3 disabled:opacity-60"
          >
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create user"}
          </button>
        </Modal>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <Modal title={`Reset password — ${resetTarget.name}`} onClose={() => setResetTarget(null)}>
          <input className="field" placeholder="New password (min 8 chars)" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          {err && <p className="mt-3 text-sm text-red-300">{err}</p>}
          <button
            onClick={() => resetPwd.mutate()}
            disabled={resetPwd.isPending || newPwd.length < 8}
            className="btn-primary mt-5 w-full py-3 disabled:opacity-60"
          >
            {resetPwd.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset password"}
          </button>
        </Modal>
      )}
    </div>
  );
}
