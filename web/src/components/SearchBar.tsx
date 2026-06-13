import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CalendarDays, Search } from "lucide-react";

export default function SearchBar() {
  const nav = useNavigate();
  const [where, setWhere] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); nav(`/cars${where ? `?q=${encodeURIComponent(where)}` : ""}`); }}
      className="panel flex flex-col gap-3 p-3 shadow-card sm:flex-row sm:items-center sm:gap-2"
    >
      <label className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
        <MapPin className="h-4 w-4 shrink-0 text-brand-cyan" />
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder="City, airport, or address"
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
        />
      </label>
      <label className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
        <CalendarDays className="h-4 w-4 shrink-0 text-brand-cyan" />
        <input type="date" defaultValue={today} className="bg-transparent text-sm text-slate-200 outline-none [color-scheme:dark]" />
      </label>
      <button type="submit" className="btn-primary px-6 py-3">
        <Search className="h-4 w-4" /> Search
      </button>
    </form>
  );
}
