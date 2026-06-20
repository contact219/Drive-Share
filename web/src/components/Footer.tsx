import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink-850">
      <div className="container-rush grid grid-cols-2 gap-8 py-12 lg:grid-cols-4 lg:gap-10 lg:py-14">
        <div className="col-span-2 lg:col-span-1">
          <div className="text-2xl font-black">R<span className="gradient-text">u</span>sh</div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Peer-to-peer car sharing. Rent from trusted local hosts by the day — or list your
            car and turn idle time into income.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-bold text-white">Rent</div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/cars" className="hover:text-white">Browse cars</Link></li>
            <li><Link to="/cars?type=suv" className="hover:text-white">SUVs</Link></li>
            <li><Link to="/cars?type=sports" className="hover:text-white">Sports cars</Link></li>
            <li><Link to="/cars?fuelType=electric" className="hover:text-white">Electric</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-bold text-white">Host</div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/host" className="hover:text-white">List your car</Link></li>
            <li><Link to="/host" className="hover:text-white">How hosting works</Link></li>
            <li><Link to="/host" className="hover:text-white">Host protection</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-bold text-white">Company</div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
            <li><a href="/terms" className="hover:text-white">Terms</a></li>
            <li><a href="/support" className="hover:text-white">Contact Support</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-rush flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <span>© 2026 Rush Enterprise. All rights reserved.</span>
          <span>Made for the road.</span>
        </div>
      </div>
    </footer>
  );
}
