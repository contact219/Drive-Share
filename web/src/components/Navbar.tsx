import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { signedIn, user, signOut } = useAuth();
  const nav = useNavigate();

  const links = [
    { to: "/cars", label: "Browse cars" },
    { to: "/#how", label: "How it works" },
    { to: "/host", label: "Become a host" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/75 backdrop-blur-xl">
      <nav className="container-rush flex h-16 items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tight">
          R<span className="gradient-text">u</span>sh
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-slate-300 transition hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {signedIn ? (
            <>
              <span className="flex items-center gap-2 text-sm text-slate-300">
                <User className="h-4 w-4 text-brand-cyan" /> {user?.name?.split(" ")[0]}
              </span>
              <button onClick={() => { signOut(); nav("/"); }} className="btn-ghost px-4 py-2 text-xs">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-200 hover:text-white">Sign in</Link>
              <Link to="/host" className="btn-primary px-5 py-2.5 text-sm">List your car</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink-850 px-5 py-4 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2.5 text-slate-200">
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3">
            {signedIn ? (
              <button onClick={() => { signOut(); setOpen(false); nav("/"); }} className="btn-ghost flex-1 py-2.5 text-sm">Sign out</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1 py-2.5 text-sm">Sign in</Link>
                <Link to="/host" onClick={() => setOpen(false)} className="btn-primary flex-1 py-2.5 text-sm">List your car</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
