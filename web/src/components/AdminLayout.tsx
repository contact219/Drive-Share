import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, Car, Route, ShieldCheck, CreditCard, FileText,
  LogOut, Menu, X, ChevronRight, Settings, ClipboardList, Search, MapPin, MessageSquare,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { adminGetUsers, adminGetVehicles, adminGetTrips } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

const NAV = [
  { label: "Overview", items: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  ]},
  { label: "Management", items: [
    { to: "/admin/users",         label: "Users",         icon: Users },
    { to: "/admin/vehicles",      label: "Vehicles",      icon: Car },
    { to: "/admin/trips",         label: "Trips",         icon: Route },
    { to: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
    { to: "/admin/documents",     label: "Documents",     icon: FileText },
    { to: "/admin/support",       label: "Support",       icon: MessageSquare },
  ]},
  { label: "Finance", items: [
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
  ]},
  { label: "System", items: [
    { to: "/admin/service-areas", label: "Service Areas", icon: MapPin },
    { to: "/admin/config",        label: "Config",        icon: Settings },
    { to: "/admin/audit-log",     label: "Audit Log",     icon: ClipboardList },
  ]},
];

interface SearchResult { type: string; label: string; sub: string; to: string; }

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  const { data: users = [] }    = useQuery({ queryKey: ["admin-users"],    queryFn: adminGetUsers,    enabled: query.length > 1 });
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin-vehicles"], queryFn: adminGetVehicles, enabled: query.length > 1 });
  const { data: trips = [] }    = useQuery({ queryKey: ["admin-trips"],    queryFn: adminGetTrips,    enabled: query.length > 1 });

  const q = query.toLowerCase();
  const results: SearchResult[] = query.length < 2 ? [] : [
    ...users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .map((u) => ({ type: "User", label: u.name, sub: u.email, to: "/admin/users" })),
    ...vehicles.filter((v) => v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q))
      .map((v) => ({ type: "Vehicle", label: v.name, sub: v.locationAddress, to: "/admin/vehicles" })),
    ...trips.filter((t) => t.id.toLowerCase().includes(q) || t.status.toLowerCase().includes(q))
      .map((t) => ({ type: "Trip", label: `Trip #${t.id.slice(0, 6)}`, sub: t.status, to: "/admin/trips" })),
  ].slice(0, 8);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function pick(r: SearchResult) {
    setQuery(""); setOpen(false); nav(r.to);
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search users, vehicles, trips…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-48 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }}>
            <X className="h-3.5 w-3.5 text-slate-500 hover:text-white" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/15 bg-[#0d1117] shadow-2xl">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => pick(r)}
              className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-white/5"
            >
              <span className="mt-0.5 shrink-0 rounded-full bg-brand-cyan/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-cyan">{r.type}</span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-100">{r.label}</div>
                <div className="truncate text-xs text-slate-500">{r.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  const Sidebar = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-grad text-xs font-black text-ink-900">A</div>
        <div>
          <div className="text-sm font-extrabold tracking-tight">Rush Admin</div>
          <div className="text-[10px] text-slate-500">{user?.email}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.label} className="mb-5">
            <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={(item as any).end}
                onClick={onNav}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-cyan/10 text-brand-cyan"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <Link to="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-400 hover:text-slate-200">
          <ChevronRight className="h-4 w-4" /> Back to site
        </Link>
        <button onClick={() => { signOut(); nav("/"); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-400 hover:text-red-300">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0c10]">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#0d1117] lg:flex lg:flex-col">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 border-r border-white/10 bg-[#0d1117]">
            <Sidebar onNav={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar (desktop: search / mobile: hamburger) */}
        <div className="flex h-12 items-center justify-between gap-3 border-b border-white/10 px-4">
          <button onClick={() => setOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-slate-400" />
          </button>
          <span className="text-sm font-bold lg:hidden">Rush Admin</span>
          <div className="hidden lg:flex">
            <GlobalSearch />
          </div>
          <div className="w-8 lg:hidden" />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
