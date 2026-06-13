import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Heart, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "../lib/auth";

const AVATAR_COLORS = [
  "bg-brand-cyan/20 text-brand-cyan",
  "bg-brand-amber/20 text-brand-amber",
  "bg-emerald-500/20 text-emerald-400",
  "bg-purple-500/20 text-purple-400",
  "bg-rose-500/20 text-rose-400",
  "bg-blue-500/20 text-blue-400",
  "bg-orange-500/20 text-orange-400",
  "bg-green-500/20 text-green-400",
];

function AvatarChip({ name, avatarIndex }: { name: string; avatarIndex?: number }) {
  const color = AVATAR_COLORS[(avatarIndex ?? 0) % AVATAR_COLORS.length];
  return (
    <Link to="/profile" className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black transition hover:ring-2 hover:ring-brand-cyan/50 ${color}`}>
      {(name || "?")[0].toUpperCase()}
    </Link>
  );
}

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
              <Link to="/trips" className="text-sm font-semibold text-slate-200 hover:text-white">Trips</Link>
              <Link to="/host/dashboard" className="text-sm font-semibold text-slate-200 hover:text-white">Host dashboard</Link>
              <Link to="/favorites" title="Saved cars" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white">
                <Heart className="h-4 w-4" />
              </Link>
              <Link to="/messages" title="Messages" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white">
                <MessageSquare className="h-4 w-4" />
              </Link>
              <AvatarChip name={user?.name || ""} avatarIndex={user?.avatarIndex} />
              <button onClick={() => { signOut(); nav("/"); }} className="btn-ghost px-4 py-2 text-xs">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-200 hover:text-white">Sign in</Link>
              <Link to="/host/dashboard" className="btn-primary px-5 py-2.5 text-sm">List your car</Link>
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
              <>
                <Link to="/trips" onClick={() => setOpen(false)} className="btn-ghost flex-1 py-2.5 text-sm">Trips</Link>
                <Link to="/favorites" onClick={() => setOpen(false)} className="btn-ghost flex-1 py-2.5 text-sm"><Heart className="h-3.5 w-3.5" /></Link>
                <Link to="/messages" onClick={() => setOpen(false)} className="btn-ghost flex-1 py-2.5 text-sm"><MessageSquare className="h-3.5 w-3.5" /></Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="btn-ghost flex-1 py-2.5 text-sm">Profile</Link>
                <button onClick={() => { signOut(); setOpen(false); nav("/"); }} className="btn-ghost flex-1 py-2.5 text-sm">Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1 py-2.5 text-sm">Sign in</Link>
                <Link to="/host/dashboard" onClick={() => setOpen(false)} className="btn-primary flex-1 py-2.5 text-sm">List your car</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
