import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { fetchVehicles, VehicleFilters } from "../lib/api";
import VehicleCard from "../components/VehicleCard";
import { titleCase } from "../lib/format";

const TYPES = ["sedan", "suv", "sports", "van"];
const FUELS = ["electric", "gas", "hybrid"];
const TRANS = ["automatic", "manual"];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const [sort, setSort] = useState("recommended");

  const filters: VehicleFilters = useMemo(() => ({
    type: params.get("type") || undefined,
    fuelType: params.get("fuelType") || undefined,
    transmission: params.get("transmission") || undefined,
    minSeats: params.get("minSeats") ? Number(params.get("minSeats")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
  }), [params]);

  const { data = [], isLoading } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => fetchVehicles(filters),
  });

  const vehicles = useMemo(() => {
    const arr = [...data];
    if (sort === "price-low") arr.sort((a, b) => Number(a.pricePerHour) - Number(b.pricePerHour));
    if (sort === "price-high") arr.sort((a, b) => Number(b.pricePerHour) - Number(a.pricePerHour));
    if (sort === "rating") arr.sort((a, b) => Number(b.rating) - Number(a.rating));
    return arr;
  }, [data, sort]);

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k); else next.set(k, v);
    setParams(next);
  };
  const clearAll = () => setParams(new URLSearchParams());
  const activeCount = ["type", "fuelType", "transmission", "minSeats", "maxPrice"].filter((k) => params.get(k)).length;

  const Filters = () => (
    <div className="space-y-7">
      <FilterGroup label="Vehicle type">
        {TYPES.map((t) => (
          <Pill key={t} active={params.get("type") === t} onClick={() => setParam("type", params.get("type") === t ? undefined : t)}>{titleCase(t)}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Fuel">
        {FUELS.map((f) => (
          <Pill key={f} active={params.get("fuelType") === f} onClick={() => setParam("fuelType", params.get("fuelType") === f ? undefined : f)}>{titleCase(f)}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Transmission">
        {TRANS.map((t) => (
          <Pill key={t} active={params.get("transmission") === t} onClick={() => setParam("transmission", params.get("transmission") === t ? undefined : t)}>{titleCase(t)}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Minimum seats">
        {["2", "4", "5", "7"].map((s) => (
          <Pill key={s} active={params.get("minSeats") === s} onClick={() => setParam("minSeats", params.get("minSeats") === s ? undefined : s)}>{s}+</Pill>
        ))}
      </FilterGroup>
      <div>
        <div className="mb-2 text-sm font-semibold text-slate-200">Max price / hour</div>
        <input
          type="number" min={1} placeholder="Any"
          defaultValue={params.get("maxPrice") || ""}
          onBlur={(e) => setParam("maxPrice", e.target.value || undefined)}
          className="field"
        />
      </div>
      {activeCount > 0 && (
        <button onClick={clearAll} className="text-sm font-semibold text-brand-cyan hover:underline">Clear all filters</button>
      )}
    </div>
  );

  return (
    <div className="container-rush py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Browse cars</h1>
          <p className="mt-1 text-sm text-slate-400">{isLoading ? "Searching…" : `${vehicles.length} cars available`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDrawer(true)} className="btn-ghost px-4 py-2.5 text-sm lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="field w-auto py-2.5">
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="panel sticky top-20 p-6"><Filters /></div>
        </aside>

        <div>
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="panel h-72 animate-pulse bg-white/[0.03]" />)}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="panel flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-semibold">No cars match these filters</p>
              <p className="mt-1 text-sm text-slate-400">Try widening your search.</p>
              <button onClick={clearAll} className="btn-ghost mt-5 px-5 py-2.5 text-sm">Clear filters</button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((v) => <VehicleCard key={v.id} v={v} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-ink-850 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setDrawer(false)}><X className="h-5 w-5" /></button>
            </div>
            <Filters />
            <button onClick={() => setDrawer(false)} className="btn-primary mt-7 w-full py-3">Show {vehicles.length} cars</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 text-sm font-semibold text-slate-200">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active ? "border-brand-cyan/60 bg-brand-cyan/15 text-brand-cyan" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
}
