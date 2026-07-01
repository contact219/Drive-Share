import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { getFavorites, removeFavorite, fetchVehicles, Vehicle } from "../lib/api";
import { useAuth } from "../lib/auth";
import VehicleCard from "../components/VehicleCard";

export default function Favorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: favorites = [], isLoading: favLoading } = useQuery({
    queryKey: ["favorites", user!.id],
    queryFn: () => getFavorites(user!.id),
  });

  const { data: allVehicles = [], isLoading: vLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => fetchVehicles(),
  });

  const favSet = new Set(favorites.map((f) => f.vehicleId));
  const favVehicles: Vehicle[] = allVehicles.filter((v) => favSet.has(v.id));

  const removeMut = useMutation({
    mutationFn: (vehicleId: string) => removeFavorite(user!.id, vehicleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites", user!.id] }),
  });

  const isLoading = favLoading || vLoading;

  return (
    <div className="container-rush py-10">
      <div className="text-sm font-bold uppercase tracking-widest text-brand-cyan">Account</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Saved cars</h1>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="panel aspect-[4/3] animate-pulse bg-white/[0.03]" />
          ))}
        </div>
      ) : favVehicles.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <Heart className="h-8 w-8 text-slate-500" />
          </div>
          <p className="mt-4 text-lg font-semibold">No saved cars yet</p>
          <p className="mt-1 text-sm text-slate-400">Tap the heart on any car to save it here.</p>
          <Link to="/cars" className="btn-primary mt-5 px-6 py-2.5">Browse cars</Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-400">{favVehicles.length} saved car{favVehicles.length > 1 ? "s" : ""}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favVehicles.map((v) => (
              <VehicleCard
                key={v.id}
                v={v}
                isFavorited={true}
                onToggleFavorite={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeMut.mutate(v.id);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
