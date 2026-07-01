import { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ChevronLeft, ShieldCheck, Loader2, CalendarDays, MapPin, AlertCircle } from "lucide-react";
import { createTrip, getPayPalClientId, createPayPalOrder, capturePayPalOrder, TripQuote, Vehicle } from "../lib/api";
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

  const { data: ppData, isError: ppError } = useQuery({
    queryKey: ["paypal-client-id"],
    queryFn: getPayPalClientId,
    retry: false,
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
              <Row label={`Trip · ${Number(quote.hours) > 0 ? `${quote.hours} hr` : `${quote.days} day${Number(quote.days) > 1 ? "s" : ""}`}`} value={money(quote.baseCost)} />
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
            <h2 className="text-lg font-bold">Payment</h2>
            <p className="mt-1 text-sm text-slate-400">Secure checkout powered by PayPal.</p>

            <div className="mt-5">
              {ppData?.clientId ? (
                <PayPalScriptProvider options={{ clientId: ppData.clientId, currency: "USD" }}>
                  <PayPalCheckout
                    userId={user!.id}
                    vehicle={v}
                    quote={quote}
                    start={start}
                    end={end}
                    onSuccess={() => nav("/trips?booked=1")}
                  />
                </PayPalScriptProvider>
              ) : ppError ? (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" /> PayPal unavailable right now. Please try again later.
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayPalCheckout({
  userId, vehicle, quote, start, end, onSuccess,
}: {
  userId: string; vehicle: Vehicle; quote: TripQuote; start: string; end: string; onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  // Store trip+payment IDs created during createOrder so onApprove can capture them
  const pendingRef = useRef<{ tripId: string; paymentId: string } | null>(null);

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 48 }}
        createOrder={async () => {
          setError(null);
          try {
            // 1. Create pending trip
            const trip = await createTrip({
              userId,
              vehicleId: vehicle.id,
              startDate: start,
              endDate: end,
              totalCost: quote.totalCost,
              baseCost: quote.baseCost,
              insuranceCost: quote.insuranceCost,
              serviceFee: quote.serviceFee,
              pickupLocation: vehicle.locationAddress,
              status: "pending",
            });
            // 2. Create PayPal order tied to trip
            const pp = await createPayPalOrder(trip.id);
            pendingRef.current = { tripId: trip.id, paymentId: pp.paymentId };
            return pp.orderId;
          } catch (e: any) {
            setError(e.message || "Failed to create order. Please try again.");
            throw e;
          }
        }}
        onApprove={async (data) => {
          try {
            const { tripId, paymentId } = pendingRef.current!;
            await capturePayPalOrder(data.orderID, paymentId, tripId);
            onSuccess();
          } catch (e: any) {
            setError(e.message || "Payment captured but confirmation failed. Contact support.");
          }
        }}
        onError={(err) => {
          console.error("PayPal error", err);
          setError("Payment failed. Please try again or use a different payment method.");
        }}
        onCancel={() => setError(null)}
      />

      <p className="mt-4 text-center text-xs text-slate-500">
        By paying you agree to Rush's terms of service.
      </p>
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
