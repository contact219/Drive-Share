import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Car, Route, ShieldCheck, CreditCard, FileText,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { useAuth } from "../lib/auth";

const NAV = [
  { label: "Overview", items: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  ]},
  { label: "Management", items: [
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/vehicles", label: "Vehicles", icon: Car },
    { to: "/admin/trips", label: "Trips", icon: Route },
    { to: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
    { to: "/admin/documents", label: "Documents", icon: FileText },
  ]},
  { label: "Finance", items: [
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
  ]},
];

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
        <NavLink to="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-400 hover:text-slate-200">
          <ChevronRight className="h-4 w-4" /> Back to site
        </NavLink>
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
        {/* Mobile topbar */}
        <div className="flex h-12 items-center gap-3 border-b border-white/10 px-4 lg:hidden">
          <button onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5 text-slate-400" />
          </button>
          <span className="text-sm font-bold">Rush Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
