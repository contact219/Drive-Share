import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, Users, Fuel, Cog, Calendar, MapPin, ShieldCheck, Check, ChevronLeft, BadgeCheck } from "lucide-react";
import { fetchVehicle, fetchReviews } from "../lib/api";
import { money, titleCase, cityFrom } from "../lib/format";
import { useAuth } from "../lib/auth";

export default function VehicleDetail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { signedIn } = useAuth();
  const { data: v, isLoading } = useQuery({ queryKey: ["vehicle", id], queryFn: () => fetchVehicle(id) });
  const { data: reviews = [] } = useQuery({ queryKey: ["reviews", id], queryFn: () => fetchReviews(id) });

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const hours = useMemo(() => {
    if (!start || !end) return 0;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return ms > 0 ? Math.ceil(ms / 3.6e6) : 0;
  }, [start, end]);

  if (isLoading || !v) {
    return <div className="container-rush py-20"><div className="panel h-96 animate-pulse bg-white/[0.03]" /></div>;
  }

  const rate = Number(v.pricePerHour);
  const subtotal = hours * rate;
  const serviceFee = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + serviceFee;

  const book = () => {
    if (!signedIn) { nav("/login?next=" + encodeURIComponent(`/cars/${id}`)); return; }
    alert("Booking & payment flow is coming in the next release. Your selection is saved.");
  };

  return (
    <div className="container-rush py-8">
      <Link to="/cars" className="mb-5 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Back to cars
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <img src={v.imageUrl} alt={v.name} className="aspect-[16/9] w-full object-cover" />
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">{v.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-brand-amber">
                  <Star className="h-4 w-4 fill-brand-amber" /> {v.rating}
                  <span className="font-normal text-slate-400">({v.reviewCount} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400"><MapPin className="h-4 w-4" /> {cityFrom(v.locationAddress)}</span>
              </div>
            </div>
            <span className="chip border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan">{titleCase(v.type)}</span>
          </div>

          {/* Specs */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Spec icon={Users} label="Seats" value={String(v.seats)} />
            <Spec icon={Fuel} label="Fuel" value={titleCase(v.fuelType)} />
            <Spec icon={Cog} label="Transmission" value={titleCase(v.transmission)} />
            <Spec icon={Calendar} label="Year" value={String(v.year)} />
          </div>

          {/* Features */}
          {v.features?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">Features</h2>
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {v.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <Check className="h-4 w-4 text-brand-cyan" /> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host trust */}
          <div className="mt-8 panel flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-grad text-lg font-black text-ink-900">
              {v.brand?.[0] || "R"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold">Verified host <BadgeCheck className="h-4 w-4 text-brand-cyan" /></div>
              <div className="text-sm text-slate-400">Identity & vehicle documents confirmed by Rush</div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">Reviews</h2>
            {reviews.length === 0 ? (
              <div className="mt-4 panel p-6 text-sm text-slate-400">
                No reviews yet — be the first to drive and review this car.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="panel p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{r.userName || "Rush driver"}</span>
                      <span className="flex items-center gap-1 text-sm text-brand-amber"><Star className="h-3.5 w-3.5 fill-brand-amber" /> {r.rating}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking widget */}
        <aside>
          <div className="panel sticky top-20 p-6 shadow-card">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-brand-cyan">{money(rate)}</span>
              <span className="text-slate-400">/ hour</span>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Trip start</span>
                <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="field [color-scheme:dark]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Trip end</span>
                <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="field [color-scheme:dark]" />
              </label>
            </div>

            {hours > 0 && (
              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                <Row label={`${money(rate)} × ${hours} hr`} value={money(subtotal)} />
                <Row label="Service fee" value={money(serviceFee)} />
                <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3 text-base font-bold">
                  <span>Total</span><span className="text-brand-cyan">{money(total)}</span>
                </div>
              </div>
            )}

            <button onClick={book} disabled={hours === 0} className="btn-primary mt-5 w-full py-3.5 disabled:opacity-50 disabled:hover:translate-y-0">
              {hours === 0 ? "Select your dates" : "Continue to book"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-cyan" /> Insurance included · You won't be charged yet
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="panel p-4">
      <Icon className="h-5 w-5 text-brand-cyan" />
      <div className="mt-2 text-xs text-slate-400">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between text-slate-300"><span>{label}</span><span>{value}</span></div>;
}
