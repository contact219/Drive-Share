import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, Users, Fuel, Cog, Calendar, MapPin, ShieldCheck, Check, ChevronLeft, BadgeCheck, Loader2 } from "lucide-react";
import { fetchVehicle, fetchReviews, quoteTrip, createTrip } from "../lib/api";
import { money, titleCase, cityFrom } from "../lib/format";
import { useAuth } from "../lib/auth";

export default function VehicleDetail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { signedIn, user } = useAuth();
  const { data: v, isLoading } = useQuery({ queryKey: ["vehicle", id], queryFn: () => fetchVehicle(id) });
  const { data: reviews = [] } = useQuery({ queryKey: ["reviews", id], queryFn: () => fetchReviews(id) });

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [insurance, setInsurance] = useState(true);

  const datesValid = !!start && !!end && new Date(end) > new Date(start);
  const toISO = (s: string) => new Date(s).toISOString();

  const { data: quote, isFetching: quoting } = useQuery({
    queryKey: ["quote", id, start, end, insurance],
    queryFn: () => quoteTrip(id, toISO(start), toISO(end), insurance),
    enabled: datesValid,
  });

  const booking = useMutation({
    mutationFn: () => createTrip({
      userId: user!.id, vehicleId: id, startDate: toISO(start), endDate: toISO(end),
      totalCost: quote!.totalCost, baseCost: quote!.baseCost, insuranceCost: quote!.insuranceCost,
      serviceFee: quote!.serviceFee, pickupLocation: v!.locationAddress,
    }),
    onSuccess: () => nav("/trips?booked=1"),
  });

  if (isLoading || !v) {
    return <div className="container-rush py-20"><div className="panel h-96 animate-pulse bg-white/[0.03]" /></div>;
  }

  const rate = Number(v.pricePerHour);

  const book = () => {
    if (!signedIn) { nav("/login?next=" + encodeURIComponent(`/cars/${id}`)); return; }
    if (datesValid && quote?.available) booking.mutate();
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
              <label className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-3 text-sm">
                <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="h-4 w-4 accent-cyan-400" />
                <span className="text-slate-200">Add insurance protection</span>
              </label>
            </div>

            {datesValid && quote?.available === false && (
              <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-300">Not available for those dates. Try a different window.</p>
            )}

            {datesValid && quote && quote.available && (
              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                <Row label={`Trip (${quote.hours} hr)`} value={money(quote.baseCost)} />
                {Number(quote.insuranceCost) > 0 && <Row label="Insurance" value={money(quote.insuranceCost)} />}
                <Row label="Service fee" value={money(quote.serviceFee)} />
                <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3 text-base font-bold">
                  <span>Total</span><span className="text-brand-cyan">{money(quote.totalCost)}</span>
                </div>
              </div>
            )}

            {booking.isError && <p className="mt-4 text-sm text-red-300">Couldn't complete the booking. Please try again.</p>}

            <button onClick={book} disabled={(signedIn && (!datesValid || quoting || !quote?.available)) || booking.isPending}
              className="btn-primary mt-5 w-full py-3.5 disabled:opacity-50 disabled:hover:translate-y-0">
              {booking.isPending ? <Loader2 className="h-4 w-4 animate-spin" />
                : !signedIn ? "Sign in to book"
                : !datesValid ? "Select your dates"
                : quoting ? "Checking…"
                : "Reserve this car"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-cyan" /> You won't be charged yet — payment is the final step at checkout
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
