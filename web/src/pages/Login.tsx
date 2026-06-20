import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { login, register, socialAuth } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const { applyAuth, signedIn } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  useEffect(() => {
    if (signedIn) nav(next, { replace: true });
  }, [signedIn, next, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const res = mode === "login" ? await login(email, password) : await register(name, email, password);
      applyAuth(res.user, res.token);
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
      setBusy(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setErr(""); setGoogleBusy(true);
      try {
        const res = await socialAuth("google", tokenResponse.access_token);
        applyAuth(res.user, res.token);
      } catch (e: any) {
        setErr(e.message || "Google sign-in failed");
        setGoogleBusy(false);
      }
    },
    onError: () => {
      setErr("Google sign-in was cancelled or failed");
    },
    scope: "email profile",
  });

  return (
    <div className="container-rush flex min-h-[78vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-3xl font-black">R<span className="gradient-text">u</span>sh</Link>
          <h1 className="mt-4 text-2xl font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-slate-400">{mode === "login" ? "Sign in to book your next drive." : "Join Rush to rent and host cars."}</p>
        </div>

        <div className="panel p-7 space-y-4">
          {/* Google sign-in */}
          <button
            type="button"
            onClick={() => { setErr(""); googleLogin(); }}
            disabled={googleBusy || busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition disabled:opacity-60"
          >
            {googleBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">or continue with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Email / password form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <input className="field" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
            <button disabled={busy || googleBusy} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

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
