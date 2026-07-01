import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-rush flex min-h-[78vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-3xl font-black">R<span className="gradient-text">u</span>sh</Link>
          <h1 className="mt-4 text-2xl font-extrabold">Forgot your password?</h1>
          <p className="mt-1 text-sm text-slate-400">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="panel p-7">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-semibold">Check your email</p>
              <p className="text-sm text-slate-400">If <span className="text-white">{email}</span> is registered, a password reset link is on its way. It expires in 1 hour.</p>
              <p className="text-xs text-slate-500">Didn't get it? Check your spam folder, or{" "}
                <button className="text-brand-cyan hover:underline" onClick={() => setSent(false)}>try again</button>.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <input
                className="field"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
              <button disabled={busy} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
