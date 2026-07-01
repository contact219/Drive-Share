import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Car } from "lucide-react";
import { getConversations } from "../lib/api";
import { useAuth } from "../lib/auth";

const AVATAR_BG = [
  "bg-brand-cyan/20 text-brand-cyan",
  "bg-brand-amber/20 text-brand-amber",
  "bg-emerald-500/20 text-emerald-400",
  "bg-purple-500/20 text-purple-400",
  "bg-rose-500/20 text-rose-400",
  "bg-blue-500/20 text-blue-400",
  "bg-orange-500/20 text-orange-400",
  "bg-green-500/20 text-green-400",
];

function timeAgo(iso?: string) {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function Conversations() {
  const { user } = useAuth();
  const { data: convs = [], isLoading } = useQuery({
    queryKey: ["conversations", user!.id],
    queryFn: () => getConversations(user!.id),
    refetchInterval: 30_000,
  });

  return (
    <div className="container-rush py-10">
      <div className="mx-auto max-w-2xl">
        <div className="text-sm font-bold uppercase tracking-widest text-brand-cyan">Inbox</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Messages</h1>

        {isLoading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="panel h-20 animate-pulse bg-white/[0.03]" />
            ))}
          </div>
        ) : convs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <MessageSquare className="h-8 w-8 text-slate-500" />
            </div>
            <p className="mt-4 text-lg font-semibold">No messages yet</p>
            <p className="mt-1 text-sm text-slate-400">Messages from hosts and renters will appear here.</p>
            <Link to="/cars" className="btn-primary mt-5 px-6 py-2.5">Browse cars</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-2">
            {convs.map((c) => {
              const colorIdx = (c.otherParticipantAvatar ?? 0) % AVATAR_BG.length;
              const initial = (c.otherParticipantName || "?")[0].toUpperCase();
              return (
                <Link
                  key={c.id}
                  to={`/messages/${c.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition hover:border-brand-cyan/30 hover:bg-white/[0.06]"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black ${AVATAR_BG[colorIdx]}`}>
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate">{c.otherParticipantName}</span>
                      <span className="shrink-0 text-xs text-slate-500">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    {c.vehicleName && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Car className="h-3 w-3" /> {c.vehicleName}
                      </div>
                    )}
                    <p className="mt-0.5 truncate text-sm text-slate-400">{c.lastMessagePreview || "No messages yet"}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan px-1.5 text-xs font-bold text-ink-900">
                      {c.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
