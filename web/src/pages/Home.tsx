import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Car, Truck, Gauge, Bus, Zap, ShieldCheck, Clock, KeyRound, ArrowRight } from "lucide-react";
import { fetchVehicles } from "../lib/api";
import SearchBar from "../components/SearchBar";
import VehicleCard from "../components/VehicleCard";

const CATEGORIES = [
  { type: "sedan", label: "Sedans", icon: Car },
  { type: "suv", label: "SUVs", icon: Truck },
  { type: "sports", label: "Sports", icon: Gauge },
  { type: "van", label: "Vans", icon: Bus },
  { type: "electric", label: "Electric", icon: Zap, fuel: true },
];

export default function Home() {
  const { data: vehicles = [], isLoading } = useQuery({ queryKey: ["vehicles"], queryFn: () => fetchVehicles() });
  const featured = vehicles.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand-cyan/10 blur-3xl" />
          <div className="absolute -left-24 top-32 h-80 w-80 rounded-full bg-brand-violet/10 blur-3xl" />
        </div>
        <div className="container-rush relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fadeUp">
            <span className="chip border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan">Peer-to-peer car sharing</span>
            <h1 className="mt-5 text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl">
              Find your <span className="gradient-text">drive.</span><br />Right around the corner.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-300">
              Rent cars by the hour or day from real hosts nearby. Skip the rental counter — book in
              seconds, unlock with your phone, and go. Every trip insured.
            </p>
            <div className="mt-8 max-w-xl"><SearchBar /></div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-cyan" /> Insured trips</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-cyan" /> Instant booking</span>
              <span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-brand-cyan" /> Verified hosts</span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="animate-floaty panel overflow-hidden p-2 shadow-card">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=70"
                alt="Featured car"
                className="h-[420px] w-full rounded-2xl object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 panel flex items-center justify-between bg-ink-900/80 p-4 backdrop-blur">
                <div>
                  <div className="text-xs text-slate-400">Trending now</div>
                  <div className="font-bold">Porsche 911 Carrera</div>
                </div>
                <div className="text-right"><div className="text-lg font-extrabold text-brand-cyan">$59</div><div className="text-xs text-slate-400">/hr</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-rush">
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              to={c.fuel ? `/cars?fuelType=electric` : `/cars?type=${c.type}`}
              className="group flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 transition hover:border-brand-cyan/40 hover:bg-brand-cyan/5"
            >
              <c.icon className="h-5 w-5 text-brand-cyan" />
              <span className="font-semibold">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-rush py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-brand-cyan">Popular near you</div>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Cars people love</h2>
          </div>
          <Link to="/cars" className="hidden items-center gap-1 text-sm font-semibold text-slate-300 hover:text-brand-cyan sm:flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="panel h-72 animate-pulse bg-white/[0.03]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => <VehicleCard key={v.id} v={v} />)}
          </div>
        )}
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-white/10 bg-ink-850">
        <div className="container-rush py-16">
          <div className="text-sm font-bold uppercase tracking-widest text-brand-cyan">How it works</div>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Three taps to the open road</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: "1", t: "Find your car", d: "Search by location and dates. Compare real cars, prices, and host ratings nearby." },
              { n: "2", t: "Book & verify", d: "Reserve instantly, add your license once, and message your host to arrange pickup." },
              { n: "3", t: "Drive & return", d: "Unlock, enjoy the trip, return on time, and rate your experience. That simple." },
            ].map((s) => (
              <div key={s.n} className="panel p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-grad text-lg font-black text-ink-900">{s.n}</div>
                <h3 className="mt-5 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="container-rush py-16">
        <div className="relative overflow-hidden rounded-3xl border border-brand-amber/30 p-10 sm:p-14"
             style={{ background: "radial-gradient(600px 280px at 85% 0%, rgba(251,191,36,.14), transparent 60%), #0c1018" }}>
          <div className="max-w-xl">
            <div className="text-sm font-bold uppercase tracking-widest text-brand-amber">Become a host</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Your car costs you money every day it sits. <span className="text-brand-amber">Flip that.</span>
            </h2>
            <p className="mt-4 text-slate-300">
              List your vehicle on Rush and turn idle hours into income. You set the price and the
              calendar — we handle booking, payments, verification, and insurance.
            </p>
            <Link to="/host" className="btn-amber mt-7 px-7 py-3">Start hosting</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
