import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, User, Upload, Trash2, ExternalLink, FileText, ShieldCheck, Camera } from "lucide-react";
import { updateProfile, getUserDocuments, uploadUserDocument, deleteUserDocument, uploadAvatar, UserOwnDocument } from "../lib/api";
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

const DOC_TYPES = [
  { key: "drivers_license",   label: "Driver License",     desc: "Front and back of your valid driver license" },
  { key: "insurance_card",    label: "Insurance Card",     desc: "Proof of current auto insurance" },
  { key: "proof_of_identity", label: "Proof of Identity",  desc: "Passport or government-issued ID" },
];

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/15 text-red-400",
};

function DocRow({ doc, onDelete, deleting }: { doc: UserOwnDocument; onDelete: () => void; deleting: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate text-xs text-slate-300">{doc.fileName || "Document"}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (STATUS_COLORS[doc.verificationStatus] ?? STATUS_COLORS.pending)}>
          {doc.verificationStatus}
        </span>
        {doc.documentUrl && (
          <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer"
            className="text-slate-500 hover:text-brand-cyan transition" title="View document">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <button onClick={onDelete} disabled={deleting} title="Remove"
          className="text-slate-600 hover:text-red-400 transition disabled:opacity-40">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function DocSection({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string>("");

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["user-docs", userId],
    queryFn: () => getUserDocuments(userId),
  });

  const deleteMut = useMutation({
    mutationFn: (docId: string) => deleteUserDocument(docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-docs", userId] }),
  });

  const handleFileChange = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type)) {
      setUploadErr("Only JPG, PNG, WebP, or PDF files are accepted."); return;
    }
    if (file.size > 10 * 1024 * 1024) { setUploadErr("File must be under 10 MB."); return; }
    setUploadErr("");
    setUploading(docType);
    try {
      await uploadUserDocument(userId, docType, file);
      qc.invalidateQueries({ queryKey: ["user-docs", userId] });
      if (fileRefs.current[docType]) fileRefs.current[docType]!.value = "";
    } catch (err: any) {
      setUploadErr(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  const docsByType = DOC_TYPES.map(dt => ({
    ...dt,
    records: docs.filter(d => d.documentType === dt.key),
  }));

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-brand-cyan" />
        <h2 className="text-lg font-bold">Verification documents</h2>
      </div>
      <p className="mb-5 text-sm text-slate-400">
        Upload your documents to get verified. Accepted formats: JPG, PNG, WebP, PDF (max 10 MB each).
      </p>
      {uploadErr && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{uploadErr}</div>
      )}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
      ) : (
        <div className="space-y-4">
          {docsByType.map(dt => (
            <div key={dt.key} className="panel p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{dt.label}</div>
                  <div className="text-xs text-slate-400">{dt.desc}</div>
                </div>
                <label className={"flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition " + (uploading === dt.key ? "opacity-50 pointer-events-none" : "bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20")}>
                  {uploading === dt.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Upload
                  <input type="file" className="sr-only" accept=".jpg,.jpeg,.png,.webp,.pdf"
                    ref={el => { fileRefs.current[dt.key] = el; }}
                    onChange={e => handleFileChange(dt.key, e)} />
                </label>
              </div>
              {dt.records.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 py-4 text-center text-xs text-slate-500">No document uploaded yet</div>
              ) : (
                <div className="space-y-2">
                  {dt.records.map(doc => (
                    <DocRow key={doc.id} doc={doc} onDelete={() => deleteMut.mutate(doc.id)} deleting={deleteMut.isPending} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, patchUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarIndex, setAvatarIndex] = useState(user?.avatarIndex ?? 0);
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarErr, setAvatarErr] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);


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
    patchUser({ avatarIndex: idx });
    await updateProfile(user!.id, { name, phone });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) { setAvatarErr("JPG, PNG or WebP only."); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarErr("Photo must be under 5 MB."); return; }
    setAvatarErr(""); setAvatarUploading(true);
    try {
      const { url } = await uploadAvatar(file);
      patchUser({ avatarUrl: url });
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    } catch { setAvatarErr("Upload failed. Please try again."); }
    finally { setAvatarUploading(false); }
  };

  const color = AVATAR_COLORS[avatarIndex % AVATAR_COLORS.length];
  const currentAvatar = user?.avatarUrl;
  const initial = (name || user?.name || "?")[0].toUpperCase();

  return (
    <div className="container-rush py-10">
      <div className="mx-auto max-w-xl">
        <div className="text-sm font-bold uppercase tracking-widest text-brand-cyan">Account</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Your profile</h1>
        <div className="mt-8 flex items-center gap-5">
          <div className="relative shrink-0">
            {currentAvatar ? (
              <img src={currentAvatar} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10" />
            ) : (
              <div className={"flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black ring-2 " + color.bg + " " + color.text + " " + color.ring + "/40"}>
                {initial}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-cyan text-ink-900 shadow-lg hover:bg-brand-cyan/80 transition">
              {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              <input ref={avatarInputRef} type="file" className="sr-only" accept=".jpg,.jpeg,.png,.webp" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{currentAvatar ? "Profile photo" : "Avatar color"}</p>
            {avatarErr && <p className="text-xs text-red-400 mt-1">{avatarErr}</p>}
            {!currentAvatar && (
              <div className="mt-2 flex gap-2">
                {AVATAR_COLORS.map((c, i) => (
                  <button key={i} onClick={() => handleAvatarPick(i)}
                    className={"h-7 w-7 rounded-full transition " + c.bg + (i === avatarIndex ? " ring-2 ring-offset-2 ring-offset-ink-900 " + c.ring : " opacity-60 hover:opacity-100")}
                    aria-label={"Color " + (i + 1)} />
                ))}
              </div>
            )}
            {currentAvatar && (
              <button onClick={async () => {
                try { await updateProfile(user!.id, { avatarUrl: null }); patchUser({ avatarUrl: null }); }
                catch { setAvatarErr("Failed to remove photo."); }
              }} className="mt-2 text-xs text-slate-500 hover:text-red-400 transition">Remove photo</button>
            )}
          </div>
        </div>
        <div className="mt-8 panel p-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Full name</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="field" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</span>
              <input type="email" value={user?.email || ""} disabled className="field opacity-50 cursor-not-allowed" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. (214) 555-0100" className="field" />
            </label>
          </div>
          {save.isError && <p className="mt-4 text-sm text-red-300">Could not save changes. Please try again.</p>}
          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()} className="btn-primary px-6 py-2.5 disabled:opacity-60">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <Check className="h-4 w-4" /> Saved!
              </span>
            )}
          </div>
        </div>
        {user && <DocSection userId={user.id} />}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User className="h-4 w-4" />
            <span>Member since account creation</span>
          </div>
          {user?.isAdmin && (
            <a href="/admin" className="mt-3 block text-sm text-brand-cyan hover:underline">Admin panel</a>
          )}
        </div>
      </div>
    </div>
  );
}
