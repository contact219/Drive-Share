import { Link } from "react-router-dom";
import { DollarSign, ShieldCheck, CalendarRange, Check } from "lucide-react";

export default function Host() {
  return (
    <div>
      <section className="container-rush py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-brand-amber">Become a host</div>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Turn your car into <span className="text-brand-amber">income.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              List your vehicle on Rush and earn from the hours it would otherwise sit parked. You stay
              in control of pricing, availability, and who drives — Rush handles the rest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/host/dashboard" className="btn-amber px-7 py-3">Get started</Link>
              <a href="#how-host" className="btn-ghost px-7 py-3">How it works</a>
            </div>
          </div>
          <div className="panel p-8 text-center">
            <div className="text-sm uppercase tracking-widest text-slate-400">Potential monthly income</div>
            <div className="mt-2 text-6xl font-black text-brand-amber">$500+</div>
            <div className="mt-2 text-sm text-slate-400">for a single well-booked vehicle in a busy market*</div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-left">
              {[
                { icon: DollarSign, t: "You price it" },
                { icon: CalendarRange, t: "You schedule it" },
                { icon: ShieldCheck, t: "We insure it" },
              ].map((x) => (
                <div key={x.t} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <x.icon className="h-5 w-5 text-brand-amber" />
                  <div className="mt-2 text-xs font-semibold">{x.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-host" className="border-y border-white/10 bg-ink-850">
        <div className="container-rush py-16">
          <h2 className="text-3xl font-extrabold tracking-tight">Hosting in three steps</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: "1", t: "List your vehicle", d: "Add photos, set your price and availability. Your listing goes live after a quick verification." },
              { n: "2", t: "Approve trips", d: "Accept bookings that fit your schedule and chat with renters right in the app." },
              { n: "3", t: "Get paid", d: "Automatic payouts land after every completed trip. No invoicing, no chasing." },
            ].map((s) => (
              <div key={s.n} className="panel p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-amber text-lg font-black text-ink-900">{s.n}</div>
                <h3 className="mt-5 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 panel p-7">
            <div className="font-bold">Every trip on Rush includes</div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {["Insurance protection during trips", "Identity-verified renters", "24/7 trip support", "Secure in-app payments & payouts"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-200"><Check className="h-4 w-4 text-brand-amber" /> {f}</div>
              ))}
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500">*Earnings vary by vehicle, location, pricing, and demand. No income is guaranteed.</p>
        </div>
      </section>
    </div>
  );
}
