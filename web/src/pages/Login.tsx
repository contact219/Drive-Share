import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { login, register } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const { applyAuth } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const res = mode === "login" ? await login(email, password) : await register(name, email, password);
      applyAuth(res.user, res.token);
      nav(next);
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
          <h1 className="mt-4 text-2xl font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-slate-400">{mode === "login" ? "Sign in to book your next drive." : "Join Rush to rent and host cars."}</p>
        </div>

        <form onSubmit={submit} className="panel space-y-4 p-7">
          {mode === "register" && (
            <input className="field" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
          <button disabled={busy} className="btn-primary w-full py-3.5 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          {mode === "login" ? "New to Rush? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }} className="font-semibold text-brand-cyan hover:underline">
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
