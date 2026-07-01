import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { resetPassword } from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setErr("Passwords don't match"); return; }
    if (password.length < 8) { setErr("Password must be at least 8 characters"); return; }
    setErr(""); setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (e: any) {
      setErr(e.message || "Failed to reset password");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="container-rush flex min-h-[78vh] items-center justify-center py-12">
        <div className="w-full max-w-md text-center panel p-8 space-y-4">
          <p className="text-red-400 font-semibold">Invalid reset link</p>
          <p className="text-sm text-slate-400">This link is missing a reset token. Please request a new one.</p>
          <Link to="/forgot-password" className="btn-primary inline-block px-6 py-2.5 text-sm">Get a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-rush flex min-h-[78vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-3xl font-black">R<span className="gradient-text">u</span>sh</Link>
          <h1 className="mt-4 text-2xl font-extrabold">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-400">Choose a strong password for your account.</p>
        </div>

        <div className="panel p-7">
          {done ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold">Password updated!</p>
              <p className="text-sm text-slate-400">Your password has been reset. You can now sign in with your new password.</p>
              <Link to="/login" className="btn-primary inline-block px-6 py-2.5 text-sm">Go to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <input
                className="field"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                minLength={8}
              />
              <input
                className="field"
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
              {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
              <button disabled={busy} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset password"}
              </button>
            </form>
          )}
        </div>

        {!done && (
          <p className="mt-5 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
