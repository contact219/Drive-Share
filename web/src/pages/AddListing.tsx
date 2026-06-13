import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, ImagePlus, Loader2, Check } from "lucide-react";
import { getOwnerProfile, createListing, uploadVehicleImage, VehicleInput } from "../lib/api";

const TYPES = ["sedan", "suv", "sports", "van", "truck", "convertible", "coupe"];
const FUELS = ["gas", "electric", "hybrid", "diesel"];
const TRANS = ["automatic", "manual"];
const FEATURES = ["Bluetooth", "Backup Camera", "Apple CarPlay", "Android Auto", "Heated Seats", "Sunroof", "Navigation", "All-Wheel Drive", "Premium Sound", "Third Row", "USB Charger", "Child Seat"];

export default function AddListing() {
  const nav = useNavigate();
  const { data: profile, isLoading } = useQuery({ queryKey: ["owner-profile"], queryFn: getOwnerProfile });

  const [f, setF] = useState({
    name: "", brand: "", model: "", year: new Date().getFullYear(),
    type: "sedan", seats: 5, fuelType: "gas", transmission: "automatic",
    pricePerHour: "", locationAddress: "",
  });
  const [features, setFeatures] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  const toggleFeature = (x: string) => setFeatures((s) => (s.includes(x) ? s.filter((i) => i !== x) : [...s, x]));

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try { setImageUrl(await uploadVehicleImage(file)); }
    catch { setErr("Image upload failed. Use a JPG, PNG, or WebP under 10MB."); }
    finally { setUploading(false); }
  };

  const m = useMutation({
    mutationFn: () => {
      const data: VehicleInput = {
        name: f.name || `${f.brand} ${f.model}`.trim(),
        brand: f.brand, model: f.model, year: Number(f.year), type: f.type,
        pricePerHour: String(f.pricePerHour), imageUrl, seats: Number(f.seats),
        fuelType: f.fuelType, transmission: f.transmission, features,
        locationAddress: f.locationAddress,
      };
      return createListing(profile!.id, data);
    },
    onSuccess: () => nav("/host/dashboard"),
    onError: () => setErr("Couldn't create the listing. Check the fields and try again."),
  });

  if (isLoading) return <div className="container-rush py-20"><div className="panel h-96 animate-pulse bg-white/[0.03]" /></div>;
  if (!profile) { nav("/host/dashboard"); return null; }

  const valid = f.brand && f.model && f.pricePerHour && f.locationAddress && imageUrl;

  const submit = (e: React.FormEvent) => { e.preventDefault(); setErr(""); if (valid) m.mutate(); else setErr("Please complete the required fields and add a photo."); };

  return (
    <div className="container-rush max-w-3xl py-8">
      <Link to="/host/dashboard" className="mb-5 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <h1 className="text-3xl font-black tracking-tight">List your car</h1>
      <p className="mt-1 text-sm text-slate-400">New listings are reviewed by our team before they go live.</p>

      <form onSubmit={submit} className="mt-7 space-y-7">
        {/* Photo */}
        <Section title="Photo">
          <label className="group relative flex aspect-[16/9] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] hover:border-brand-cyan/50">
            {imageUrl ? (
              <img src={imageUrl} alt="Car" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-slate-400">
                {uploading ? <Loader2 className="mx-auto h-7 w-7 animate-spin text-brand-cyan" /> : <ImagePlus className="mx-auto h-7 w-7" />}
                <div className="mt-2 text-sm">{uploading ? "Uploading…" : "Upload a photo of your car"}</div>
                <div className="text-xs text-slate-500">JPG, PNG, or WebP · up to 10MB</div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
        </Section>

        {/* Details */}
        <Section title="Car details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Make / brand" required><input className="field" value={f.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Tesla" /></Field>
            <Field label="Model" required><input className="field" value={f.model} onChange={(e) => set("model", e.target.value)} placeholder="Model 3" /></Field>
            <Field label="Listing title"><input className="field" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder={`${f.brand} ${f.model}`.trim() || "e.g. Tesla Model 3"} /></Field>
            <Field label="Year" required><input type="number" className="field" value={f.year} onChange={(e) => set("year", e.target.value)} /></Field>
            <Field label="Type"><Select value={f.type} onChange={(v) => set("type", v)} options={TYPES} /></Field>
            <Field label="Seats"><input type="number" min={1} className="field" value={f.seats} onChange={(e) => set("seats", e.target.value)} /></Field>
            <Field label="Fuel"><Select value={f.fuelType} onChange={(v) => set("fuelType", v)} options={FUELS} /></Field>
            <Field label="Transmission"><Select value={f.transmission} onChange={(v) => set("transmission", v)} options={TRANS} /></Field>
          </div>
        </Section>

        {/* Pricing & location */}
        <Section title="Pricing & location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price per hour (USD)" required>
              <div className="flex items-center gap-2 field">
                <span className="text-slate-400">$</span>
                <input type="number" min={1} step="0.5" className="w-full bg-transparent outline-none" value={f.pricePerHour} onChange={(e) => set("pricePerHour", e.target.value)} placeholder="18" />
              </div>
            </Field>
            <Field label="Pickup location" required><input className="field" value={f.locationAddress} onChange={(e) => set("locationAddress", e.target.value)} placeholder="123 Main St, Austin, TX" /></Field>
          </div>
        </Section>

        {/* Features */}
        <Section title="Features">
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((x) => (
              <button type="button" key={x} onClick={() => toggleFeature(x)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
                  features.includes(x) ? "border-brand-cyan/60 bg-brand-cyan/15 text-brand-cyan" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                }`}>
                {features.includes(x) && <Check className="h-3.5 w-3.5" />} {x}
              </button>
            ))}
          </div>
        </Section>

        {err && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{err}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={m.isPending} className="btn-primary px-7 py-3.5 disabled:opacity-60">
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for review"}
          </button>
          <Link to="/host/dashboard" className="btn-ghost px-6 py-3.5">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}{required && <span className="text-brand-cyan"> *</span>}</span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
    </select>
  );
}
