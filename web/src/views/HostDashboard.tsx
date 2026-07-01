import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Car, DollarSign, TrendingUp, Loader2, Play, Pause, Trash2, Clock, BadgeCheck, XCircle, CalendarDays, User } from "lucide-react";
import {
  getOwnerProfile, createOwnerProfile, getOwnerListings,
  updateListingStatus, deleteListing, OwnerListing,
  getOwnerBookings, HostBooking, setTripStatus,
} from "../lib/api";
import { useAuth } from "../lib/auth";
import { money, titleCase, cityFrom } from "../lib/format";

export default function HostDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ["owner-profile"], queryFn: getOwnerProfile });

  if (isLoading) return <Loading />;
  if (!profile) return <Onboard userId={user!.id} onDone={() => qc.invalidateQueries({ queryKey: ["owner-profile"] })} />;

  return <Dashboard profileId={profile.id} earnings={profile.totalEarnings} responseRate={profile.responseRate} />;
}

function Loading() {
  return <div className="container-rush py-20"><div className="panel h-64 animate-pulse bg-white/[0.03]" /></div>;
}

function Onboard({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [bio, setBio] = useState("");
  const m = useMutation({
    mutationFn: () => createOwnerProfile(userId, bio),
    onSuccess: onDone,
  });
  return (
    <div className="container-rush flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-lg panel p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-grad text-ink-900"><Car className="h-7 w-7" /></div>
        <h1 className="mt-5 text-2xl font-extrabold">Become a Rush host</h1>
        <p className="mt-2 text-sm text-slate-400">Tell renters a bit about yourself. You can list your first car right after.</p>
        <textarea
          value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
          placeholder="e.g. Austin local, I keep my cars spotless and reply fast."
          className="field mt-6 resize-none text-left"
        />
        {m.isError && <p className="mt-3 text-sm text-red-300">Couldn't create your host profile. Try again.</p>}
        <button onClick={() => m.mutate()} disabled={m.isPending} className="btn-primary mt-5 w-full py-3.5 disabled:opacity-60">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create host profile"}
        </button>
      </div>
    </div>
  );
}

function Dashboard({ profileId, earnings, responseRate }: { profileId: string; earnings?: string; responseRate?: string }) {
  const qc = useQueryClient();
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["owner-listings", profileId],
    queryFn: () => getOwnerListings(profileId),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["owner-bookings", profileId],
    queryFn: () => getOwnerBookings(profileId),
  });
  const bookingMut = useMutation({
    mutationFn: (a: { id: string; status: string }) => setTripStatus(a.id, a.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-bookings", profileId] }),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["owner-listings", profileId] });
  const statusMut = useMutation({ mutationFn: (a: { id: string; status: string }) => updateListingStatus(a.id, a.status), onSuccess: refresh });
  const delMut = useMutation({ mutationFn: (id: string) => deleteListing(id), onSuccess: refresh });

  const active = listings.filter((l) => l.listingStatus === "active").length;

  return (
    <div className="container-rush py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-bold uppercase tracking-widest text-brand-cyan">Host dashboard</div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Your cars</h1>
        </div>
        <Link to="/host/new" className="btn-primary px-5 py-2.5 text-sm"><Plus className="h-4 w-4" /> Add a car</Link>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat icon={Car} label="Listings" value={String(listings.length)} sub={`${active} live`} />
        <Stat icon={DollarSign} label="Total earnings" value={money(earnings || 0)} sub="paid out" />
        <Stat icon={TrendingUp} label="Response rate" value={`${Math.round(Number(responseRate || 100))}%`} sub="last 30 days" />
      </div>

      <div className="mt-9">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="panel h-40 animate-pulse bg-white/[0.03]" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="panel flex flex-col items-center justify-center py-20 text-center">
            <Car className="h-10 w-10 text-slate-500" />
            <p className="mt-4 text-lg font-semibold">No cars listed yet</p>
            <p className="mt-1 text-sm text-slate-400">List your first car and start earning.</p>
            <Link to="/host/new" className="btn-primary mt-5 px-5 py-2.5 text-sm"><Plus className="h-4 w-4" /> Add a car</Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {listings.map((l) => (
              <ListingRow key={l.id} l={l}
                busy={statusMut.isPending || delMut.isPending}
                onActivate={() => statusMut.mutate({ id: l.id, status: "active" })}
                onPause={() => statusMut.mutate({ id: l.id, status: "paused" })}
                onDelete={() => { if (confirm("Delete this listing?")) delMut.mutate(l.id); }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-200">Incoming bookings <span className="text-sm font-normal text-slate-500">({bookings.length})</span></h2>
          <Link to="/host/bookings" className="flex items-center gap-1.5 text-sm font-semibold text-brand-cyan hover:opacity-80 transition">
            {bookings.filter(b => b.status === "pending").length > 0 && (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-black">{bookings.filter(b => b.status === "pending").length} new</span>
            )}
            Manage all →
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="mt-4 panel p-6 text-sm text-slate-400">No bookings yet. They'll appear here when renters reserve your cars.</div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {bookings.map((b) => (
              <BookingRow key={b.id} b={b} busy={bookingMut.isPending}
                onAccept={() => bookingMut.mutate({ id: b.id, status: "upcoming" })}
                onDecline={() => { if (confirm("Decline this booking?")) bookingMut.mutate({ id: b.id, status: "cancelled" }); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingRow({ b, busy, onAccept, onDecline }: {
  b: HostBooking; busy: boolean; onAccept: () => void; onDecline: () => void;
}) {
  const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const tones: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
    upcoming: "bg-brand-cyan/15 text-brand-cyan ring-brand-cyan/30",
    completed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
    cancelled: "bg-white/5 text-slate-400 ring-white/15",
  };
  const label = b.status === "upcoming" ? "Accepted" : titleCase(b.status);
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="font-bold">{b.vehicle?.name || "Vehicle"}</div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[b.status] || tones.upcoming}`}>{label}</span>
      </div>
      <div className="mt-2 space-y-1 text-xs text-slate-400">
        <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {b.renterName}</div>
        <div className="flex items-start gap-1.5"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" /><div><div>{fmt(b.startDate)}</div><div>{fmt(b.endDate)}</div></div></div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-sm"><span className="text-slate-400">Payout </span><span className="font-extrabold text-brand-cyan">{money(b.totalCost)}</span></span>
        {b.status === "pending" && (
          <div className="flex items-center gap-2">
            <button onClick={onDecline} disabled={busy} className="inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50">
              <XCircle className="h-3.5 w-3.5" /> Decline
            </button>
            <button onClick={onAccept} disabled={busy} className="inline-flex items-center gap-1 rounded-full bg-brand-grad px-3 py-1.5 text-xs font-bold text-ink-900 hover:opacity-90 disabled:opacity-50">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />} Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="panel p-3 sm:p-5">
      <Icon className="h-4 w-4 text-brand-cyan sm:h-5 sm:w-5" />
      <div className="mt-2 text-lg font-black sm:mt-3 sm:text-2xl">{value}</div>
      <div className="text-[10px] leading-tight text-slate-400 sm:text-xs">{label}<br className="sm:hidden" /><span className="hidden sm:inline"> · </span>{sub}</div>
    </div>
  );
}

function ListingRow({ l, busy, onActivate, onPause, onDelete }: {
  l: OwnerListing; busy: boolean; onActivate: () => void; onPause: () => void; onDelete: () => void;
}) {
  const v = l.vehicle;
  const verified = l.verificationStatus === "approved";
  const rejected = l.verificationStatus === "rejected";
  const live = l.listingStatus === "active";

  return (
    <div className="panel flex gap-4 overflow-hidden p-4">
      <img src={v?.imageUrl} alt={v?.name} className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-36" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-bold">{v?.name || "Vehicle"}</h3>
            <p className="text-xs text-slate-400">{v ? `${titleCase(v.type)} · ${cityFrom(v.locationAddress)}` : ""}</p>
          </div>
          <span className="shrink-0 text-sm font-extrabold text-brand-cyan">{v ? `${money(v.pricePerHour)}/day` : ""}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {live ? <Badge tone="green" icon={BadgeCheck}>Live</Badge> : <Badge tone="slate" icon={Pause}>{titleCase(l.listingStatus)}</Badge>}
          {l.verificationStatus === "pending" && <Badge tone="amber" icon={Clock}>In review</Badge>}
          {verified && <Badge tone="cyan" icon={BadgeCheck}>Verified</Badge>}
          {rejected && <Badge tone="red" icon={XCircle}>Not approved</Badge>}
        </div>
        {rejected && l.verificationNotes && <p className="mt-1.5 text-xs text-red-300">{l.verificationNotes}</p>}
        {l.verificationStatus === "pending" && <p className="mt-1.5 text-xs text-slate-400">We're reviewing your car. You can publish once it's approved.</p>}

        <div className="mt-auto flex items-center gap-2 pt-3">
          {live ? (
            <button onClick={onPause} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs"><Pause className="h-3.5 w-3.5" /> Pause</button>
          ) : (
            <button onClick={onActivate} disabled={busy || !verified}
              className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40" title={verified ? "" : "Available after verification"}>
              <Play className="h-3.5 w-3.5" /> {verified ? "Publish" : "Awaiting review"}
            </button>
          )}
          <button onClick={onDelete} disabled={busy} className="ml-auto inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ tone, icon: Icon, children }: { tone: "green" | "amber" | "cyan" | "red" | "slate"; icon: any; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    green: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
    amber: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
    cyan: "bg-brand-cyan/15 text-brand-cyan ring-brand-cyan/30",
    red: "bg-red-500/15 text-red-300 ring-red-400/30",
    slate: "bg-white/5 text-slate-300 ring-white/15",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>
      <Icon className="h-3 w-3" /> {children}
    </span>
  );
}
