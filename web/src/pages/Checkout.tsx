import { useLocation, useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, ShieldCheck, CreditCard, Loader2, CalendarDays, MapPin } from "lucide-react";
import { createTrip, TripQuote, Vehicle } from "../lib/api";
import { money } from "../lib/format";
import { useAuth } from "../lib/auth";

interface CheckoutState {
  quote: TripQuote;
  start: string;
  end: string;
  vehicle: Vehicle;
  insurance: boolean;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Checkout() {
  const { state } = useLocation() as { state: CheckoutState | null };
  const nav = useNavigate();
  const { user } = useAuth();

  const booking = useMutation({
    mutationFn: () =>
      createTrip({
        userId: user!.id,
        vehicleId: state!.vehicle.id,
        startDate: state!.start,
        endDate: state!.end,
        totalCost: state!.quote.totalCost,
        baseCost: state!.quote.baseCost,
        insuranceCost: state!.quote.insuranceCost,
        serviceFee: state!.quote.serviceFee,
        pickupLocation: state!.vehicle.locationAddress,
      }),
    onSuccess: () => nav("/trips?booked=1"),
  });

  if (!state?.quote || !state?.vehicle) {
    return (
      <div className="container-rush py-20 text-center">
        <p className="text-slate-400">Nothing to check out. <Link to="/cars" className="text-brand-cyan hover:underline">Browse cars</Link></p>
      </div>
    );
  }

  const { quote, vehicle: v, start, end } = state;

  return (
    <div className="container-rush py-10">
      <Link to={`/cars/${v.id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Back to car
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Order summary */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Confirm your trip</h1>
          <p className="mt-2 text-slate-400">Review your booking details before paying.</p>

          <div className="mt-8 panel overflow-hidden">
            <div className="flex gap-4 border-b border-white/10 p-5">
              <img src={v.imageUrl} alt={v.name} className="h-28 w-40 rounded-xl object-cover" />
              <div>
                <h2 className="text-lg font-bold">{v.name}</h2>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {v.locationAddress}
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Trip dates</h3>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-8">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-brand-cyan" />
                  <div>
                    <div className="text-xs text-slate-400">Pickup</div>
                    <div className="font-semibold">{fmt(start)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-brand-cyan" />
                  <div>
                    <div className="text-xs text-slate-400">Return</div>
                    <div className="font-semibold">{fmt(end)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="mt-6 panel p-5">
            <h3 className="font-semibold">Price breakdown</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <Row label={`Trip · ${quote.hours > 0 ? `${quote.hours} hr` : `${quote.days} day${quote.days > 1 ? "s" : ""}`}`} value={money(quote.baseCost)} />
              {Number(quote.insuranceCost) > 0 && <Row label="Insurance protection" value={money(quote.insuranceCost)} />}
              <Row label="Service fee" value={money(quote.serviceFee)} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-base font-bold">
              <span>Total due</span>
              <span className="text-xl text-brand-cyan">{money(quote.totalCost)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-400">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-cyan" />
            Your trip is protected by Rush's rental guarantee. Free cancellation before pickup.
          </div>
        </div>

        {/* Payment panel */}
        <div>
          <div className="panel sticky top-20 p-6">
            <h2 className="font-bold text-lg">Payment</h2>

            {/* PayPal stub — replace with @paypal/react-paypal-js when PAYPAL_CLIENT_ID is set */}
            <div className="mt-5 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 text-sm font-semibold text-slate-300">Online payment coming soon</p>
              <p className="mt-1 text-xs text-slate-500">PayPal checkout will appear here once activated.</p>
            </div>

            {/* Confirm without payment (creates pending trip) */}
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="mb-3 text-xs text-slate-500 text-center">For now, reserve your spot — the host will confirm and contact you for payment.</p>
              {booking.isError && <p className="mb-3 text-sm text-red-300 text-center">Booking failed. Please try again.</p>}
              <button
                onClick={() => booking.mutate()}
                disabled={booking.isPending}
                className="btn-primary w-full py-3.5 disabled:opacity-60"
              >
                {booking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Reserve · ${money(quote.totalCost)}`}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              By reserving you agree to Rush's terms of service. You won't be charged until the host accepts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
