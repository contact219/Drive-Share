import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Heart, MessageSquare, LogOut, Car, Route, LayoutDashboard, User, Info, Home, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { getUnreadNotificationCount } from "../lib/api";

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

function AvatarChip({ name, avatarIndex, avatarUrl, size = "sm" }: { name: string; avatarIndex?: number; avatarUrl?: string | null; size?: "sm" | "md" }) {
  const color = AVATAR_COLORS[(avatarIndex ?? 0) % AVATAR_COLORS.length];
  const dim = size === "md" ? "h-11 w-11 text-base" : "h-9 w-9 text-sm";
  if (avatarUrl) {
    return (
      <Link to="/profile" className={"block rounded-full overflow-hidden ring-2 ring-transparent hover:ring-brand-cyan/50 transition shrink-0 " + dim}>
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </Link>
    );
  }
  return (
    <Link to="/profile" className={"flex items-center justify-center rounded-full font-black transition hover:ring-2 hover:ring-brand-cyan/50 shrink-0 " + dim + " " + color}>
      {(name || "?")[0].toUpperCase()}
    </Link>
  );
}

function NavBell() {
  const { signedIn } = useAuth();
  const { data } = useQuery({ queryKey: ["notif-count"], queryFn: getUnreadNotificationCount, enabled: signedIn, refetchInterval: 30_000 });
  const count = data?.count ?? 0;
  return (
    <Link to="/notifications" title="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white">
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-cyan text-[9px] font-black text-black">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { signedIn, user, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navLinks = [
    { to: "/cars", label: "Browse Cars", icon: Car },
    { to: "/#how", label: "How It Works", icon: Info },
    { to: "/host", label: "Become a Host", icon: Home },
  ];

  const authLinks = signedIn ? [
    { to: "/trips", label: "My Trips", icon: Route },
    { to: "/favorites", label: "Saved Cars", icon: Heart },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/host/dashboard", label: "Host Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: User },
  ] : [];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
        <nav className="container-rush flex h-14 items-center justify-between md:h-16">
          <Link to="/" className="text-2xl font-black tracking-tight">R<span className="gradient-text">u</span>sh</Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-slate-300 transition hover:text-white">{l.label}</Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {signedIn ? (
              <>
                <Link to="/trips" className="text-sm font-semibold text-slate-200 hover:text-white">Trips</Link>
                <Link to="/host/dashboard" className="text-sm font-semibold text-slate-200 hover:text-white">Host</Link>
                <Link to="/favorites" title="Saved cars" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"><Heart className="h-4 w-4" /></Link>
                <Link to="/messages" title="Messages" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"><MessageSquare className="h-4 w-4" /></Link>
                <NavBell />
                <AvatarChip name={user?.name || ""} avatarIndex={user?.avatarIndex} avatarUrl={user?.avatarUrl} />
                <button onClick={() => { signOut(); nav("/"); }} className="btn-ghost px-4 py-2 text-xs"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-200 hover:text-white">Sign in</Link>
                <Link to="/host/dashboard" className="btn-primary px-5 py-2.5 text-sm">List your car</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {signedIn && <NavBell />}
            {signedIn && <AvatarChip name={user?.name || ""} avatarIndex={user?.avatarIndex} avatarUrl={user?.avatarUrl} />}
            <button onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 active:bg-white/10">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(320px,100vw)] border-l border-white/10 bg-ink-850 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Link to="/" className="text-xl font-black">R<span className="gradient-text">u</span>sh</Link>
              <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 active:bg-white/10"><X className="h-5 w-5" /></button>
            </div>

            {signedIn && user && (
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <AvatarChip name={user.name} avatarIndex={user.avatarIndex} avatarUrl={user.avatarUrl} size="md" />
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Explore</div>
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-200 transition active:bg-white/10 hover:bg-white/5">
                  {l.icon && <l.icon className="h-4 w-4 shrink-0 text-brand-cyan" />}{l.label}
                </Link>
              ))}
              {authLinks.length > 0 && (
                <>
                  <div className="mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">My Account</div>
                  {authLinks.map((l) => (
                    <Link key={l.to} to={l.to} className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-200 transition active:bg-white/10 hover:bg-white/5">
                      {l.icon && <l.icon className="h-4 w-4 shrink-0 text-slate-400" />}{l.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            <div className="border-t border-white/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 space-y-2">
              {signedIn ? (
                <button onClick={() => { signOut(); nav("/"); }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-red-400 active:bg-red-500/10 hover:bg-red-500/5">
                  <LogOut className="h-4 w-4 shrink-0" /> Sign out
                </button>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="btn-ghost flex-1 py-3 text-sm">Sign in</Link>
                  <Link to="/host/dashboard" className="btn-primary flex-1 py-3 text-sm">List your car</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
