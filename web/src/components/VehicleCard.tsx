import { Link } from "react-router-dom";
import { Star, Users, Fuel, Cog, Zap } from "lucide-react";
import { Vehicle } from "../lib/api";
import { money, titleCase, cityFrom } from "../lib/format";

export default function VehicleCard({ v }: { v: Vehicle }) {
  const isEV = v.fuelType === "electric";
  return (
    <Link
      to={`/cars/${v.id}`}
      className="group panel overflow-hidden transition duration-200 hover:-translate-y-1.5 hover:border-brand-cyan/40 hover:shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={v.imageUrl}
          alt={v.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 chip bg-ink-900/70 backdrop-blur">{titleCase(v.type)}</span>
        {isEV && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-2.5 py-1 text-xs font-semibold text-brand-cyan ring-1 ring-brand-cyan/30">
            <Zap className="h-3 w-3" /> EV
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold leading-tight">{v.name}</h3>
            <p className="mt-0.5 text-xs text-slate-400">{cityFrom(v.locationAddress)}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-amber">
            <Star className="h-3.5 w-3.5 fill-brand-amber" /> {v.rating}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {v.seats}</span>
          <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {titleCase(v.fuelType)}</span>
          <span className="flex items-center gap-1"><Cog className="h-3.5 w-3.5" /> {titleCase(v.transmission)}</span>
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-3">
          <span><span className="text-lg font-extrabold text-brand-cyan">{money(v.pricePerHour)}</span><span className="text-xs text-slate-400">/hr</span></span>
          <span className="text-xs font-semibold text-slate-300 transition group-hover:text-brand-cyan">View →</span>
        </div>
      </div>
    </Link>
  );
}
