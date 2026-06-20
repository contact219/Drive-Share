import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, CalendarDays, User, BadgeCheck, XCircle, MessageSquare, Car,
} from "lucide-react";
import { getOwnerProfile, getOwnerBookings, setTripStatus, HostBooking } from "../lib/api";
import { useAuth } from "../lib/auth";
import { money, titleCase } from "../lib/format";

type Tab = "pending" | "upcoming" | "past" | "all";

const STATUS_TONE: Record<string, string> = {
  pending:   "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  upcoming:  "bg-brand-cyan/15 text-brand-cyan ring-brand-cyan/30",
  active:    "bg-brand-cyan/15 text-brand-cyan ring-brand-cyan/30",
  completed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  cancelled: "bg-white/5 text-slate-400 ring-white/15",
};

function fmtRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
  return `${new Date(start).toLocaleString(undefined, opts)} → ${new Date(end).toLocaleString(undefined, opts)}`;
}

export default function HostBookings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [declining, setDeclining] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["owner-profile"],
    queryFn: getOwnerProfile,
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["owner-bookings", profile?.id],
    queryFn: () => getOwnerBookings(profile!.id),
    enabled: !!profile?.id,
    refetchInterval: 30_000,
  });

  const mut = useMutation({
    mutationFn: (a: { id: string; status: string }) => setTripStatus(a.id, a.status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings", profile?.id] });
      setDeclining(null);
    },
  });

  if (profileLoading) {
    return <div className="container-rush py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>;
  }

  if (!profile) {
    return (
      <div className="container-rush py-20 text-center">
        <p className="text-slate-400">Set up your host profile first.</p>
        <Link to="/host/dashboard" className="btn-primary mt-4 inline-block px-8 py-3">Go to dashboard</Link>
      </div>
    );
  }

  const pending   = bookings.filter((b) => b.status === "pending");
  const upcoming  = bookings.filter((b) => b.status === "upcoming" || b.status === "active");
  const past      = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const tabMap: Record<Tab, HostBooking[]> = { pending, upcoming, past, all: bookings };
  const visible = tabMap[tab];

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "pending",  label: "Needs action", count: pending.length },
    { key: "upcoming", label: "Upcoming",      count: upcoming.length },
    { key: "past",     label: "Past" },
    { key: "all",      label: "All",           count: bookings.length },
  ];

  return (
    <div className="container-rush py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-brand-cyan">Host</div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Bookings</h1>
        </div>
        <Link to="/host/dashboard" className="text-sm text-slate-400 hover:text-white">← Dashboard</Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={"flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition " +
              (tab === t.key ? "bg-white/10 text-white" : "text-slate-400 hover:text-white")}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={"rounded-full px-1.5 py-0.5 text-[10px] font-black " +
                (t.key === "pending" ? "bg-amber-400 text-black" : "bg-white/15 text-white")}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 py-16 text-center">
          <Car className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="font-semibold text-slate-300">No {tab === "all" ? "" : tab + " "}bookings</p>
          {tab === "pending" && <p className="mt-1 text-sm text-slate-500">New booking requests will appear here.</p>}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((b) => (
            <BookingCard
              key={b.id}
              b={b}
              busy={mut.isPending}
              confirmingDecline={declining === b.id}
              onAccept={() => mut.mutate({ id: b.id, status: "upcoming" })}
              onDeclineClick={() => setDeclining(b.id)}
              onDeclineConfirm={() => mut.mutate({ id: b.id, status: "cancelled" })}
              onDeclineCancel={() => setDeclining(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  b, busy, confirmingDecline,
  onAccept, onDeclineClick, onDeclineConfirm, onDeclineCancel,
}: {
  b: HostBooking;
  busy: boolean;
  confirmingDecline: boolean;
  onAccept: () => void;
  onDeclineClick: () => void;
  onDeclineConfirm: () => void;
  onDeclineCancel: () => void;
}) {
  const statusLabel = b.status === "upcoming" ? "Accepted" : titleCase(b.status);

  return (
    <div className={"panel p-5 flex flex-col gap-4 " + (b.status === "pending" ? "ring-1 ring-amber-400/20" : "")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold">{(b as any).vehicle?.name || "Vehicle"}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <User className="h-3.5 w-3.5 shrink-0" />
            {b.renterName}
          </div>
        </div>
        <span className={"shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 " + (STATUS_TONE[b.status] || STATUS_TONE.upcoming)}>
          {statusLabel}
        </span>
      </div>

      {/* Dates */}
      <div className="flex items-start gap-2 text-xs text-slate-400">
        <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
        <span>{fmtRange(String(b.startDate), String(b.endDate))}</span>
      </div>

      {/* Payout */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-xs text-slate-400">Payout</span>
        <span className="text-sm font-extrabold text-brand-cyan">{money(b.totalCost)}</span>
      </div>

      {/* Actions */}
      {b.status === "pending" && !confirmingDecline && (
        <div className="flex gap-2">
          <button
            onClick={onDeclineClick}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 py-2.5 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition"
          >
            <XCircle className="h-4 w-4" /> Decline
          </button>
          <button
            onClick={onAccept}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-grad py-2.5 text-sm font-bold text-ink-900 hover:opacity-90 disabled:opacity-50 transition"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><BadgeCheck className="h-4 w-4" /> Accept</>}
          </button>
        </div>
      )}

      {/* Decline confirmation */}
      {b.status === "pending" && confirmingDecline && (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-center">
          <p className="mb-3 text-sm text-red-300 font-semibold">Decline this booking?</p>
          <div className="flex gap-2">
            <button onClick={onDeclineCancel} className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-slate-400 hover:text-white transition">Cancel</button>
            <button
              onClick={onDeclineConfirm}
              disabled={busy}
              className="flex-1 rounded-lg bg-red-500/20 py-2 text-xs font-bold text-red-300 hover:bg-red-500/30 disabled:opacity-50 transition"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "Yes, decline"}
            </button>
          </div>
        </div>
      )}

      {/* Message link for non-pending */}
      {b.status !== "pending" && (
        <Link
          to="/messages"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
        >
          <MessageSquare className="h-3.5 w-3.5" /> Message renter
        </Link>
      )}
    </div>
  );
}
