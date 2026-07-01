import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { adminGetVehicles, adminUpdateVehicle, adminDeleteVehicle, Vehicle } from "../../lib/api";
import { money, titleCase, cityFrom } from "../../lib/format";

export default function AdminVehiclesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: vehicles = [], isLoading } = useQuery({ queryKey: ["admin-vehicles"], queryFn: adminGetVehicles });

  const filtered = vehicles.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.locationAddress?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAvail = useMutation({
    mutationFn: (v: Vehicle) => adminUpdateVehicle(v.id, { isAvailable: !v.isAvailable }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vehicles"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminDeleteVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vehicles"] }),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Vehicles</h1>
          <p className="mt-1 text-sm text-slate-400">{vehicles.length} total · {vehicles.filter((v) => v.isAvailable).length} available</p>
        </div>
      </div>

      <div className="mt-5 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Search vehicles…" value={search} onChange={(e) => setSearch(e.target.value)} className="field pl-9" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No vehicles found</td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={v.imageUrl} alt={v.name} className="h-10 w-14 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-xs text-slate-500">{v.year} · {v.seats} seats</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{titleCase(v.type)}</td>
                  <td className="px-4 py-3 text-slate-400">{cityFrom(v.locationAddress)}</td>
                  <td className="px-4 py-3 font-semibold text-brand-cyan">{money(v.pricePerHour)}/hr</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${v.isAvailable ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-400"}`}>
                      {v.isAvailable ? "Available" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleAvail.mutate(v)}
                        title={v.isAvailable ? "Hide vehicle" : "Make available"}
                        className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/15 hover:text-white"
                      >
                        {v.isAvailable ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${v.name}?`)) deleteMut.mutate(v.id); }}
                        className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
