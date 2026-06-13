import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Check, User } from "lucide-react";
import { updateProfile } from "../lib/api";
import { useAuth } from "../lib/auth";

const AVATAR_COLORS = [
  { bg: "bg-brand-cyan/20", text: "text-brand-cyan", ring: "ring-brand-cyan" },
  { bg: "bg-brand-amber/20", text: "text-brand-amber", ring: "ring-brand-amber" },
  { bg: "bg-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-400" },
  { bg: "bg-purple-500/20", text: "text-purple-400", ring: "ring-purple-400" },
  { bg: "bg-rose-500/20", text: "text-rose-400", ring: "ring-rose-400" },
  { bg: "bg-blue-500/20", text: "text-blue-400", ring: "ring-blue-400" },
  { bg: "bg-orange-500/20", text: "text-orange-400", ring: "ring-orange-400" },
  { bg: "bg-green-500/20", text: "text-green-400", ring: "ring-green-400" },
];

export default function Profile() {
  const { user, patchUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarIndex, setAvatarIndex] = useState(user?.avatarIndex ?? 0);
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: () => updateProfile(user!.id, { name, phone }),
    onSuccess: (updated) => {
      patchUser({ ...updated, avatarIndex });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleAvatarPick = async (idx: number) => {
    setAvatarIndex(idx);
    // optimistically update avatar in context; full save on form submit
    patchUser({ avatarIndex: idx });
    await updateProfile(user!.id, { name, phone });
  };

  const color = AVATAR_COLORS[avatarIndex % AVATAR_COLORS.length];
  const initial = (name || user?.name || "?")[0].toUpperCase();

  return (
    <div className="container-rush py-10">
      <div className="mx-auto max-w-xl">
        <div className="text-sm font-bold uppercase tracking-widest text-brand-cyan">Account</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Your profile</h1>

        {/* Avatar */}
        <div className="mt-8 flex items-center gap-5">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black ring-2 ${color.bg} ${color.text} ${color.ring}/40`}>
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Avatar color</p>
            <div className="mt-2 flex gap-2">
              {AVATAR_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleAvatarPick(i)}
                  className={`h-7 w-7 rounded-full transition ${c.bg} ${i === avatarIndex ? `ring-2 ring-offset-2 ring-offset-ink-900 ${c.ring}` : "opacity-60 hover:opacity-100"}`}
                  aria-label={`Color ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 panel p-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="field"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</span>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="field opacity-50 cursor-not-allowed"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (214) 555-0100"
                className="field"
              />
            </label>
          </div>

          {save.isError && (
            <p className="mt-4 text-sm text-red-300">Couldn't save changes. Please try again.</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending || !name.trim()}
              className="btn-primary px-6 py-2.5 disabled:opacity-60"
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <Check className="h-4 w-4" /> Saved!
              </span>
            )}
          </div>
        </div>

        {/* Account info */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User className="h-4 w-4" />
            <span>Member since account creation</span>
          </div>
          {user?.isAdmin && (
            <a href="/admin" className="mt-3 block text-sm text-brand-cyan hover:underline">
              Admin panel →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
