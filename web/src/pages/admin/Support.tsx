import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { getConversations } from "../../lib/api";
import { useAuth } from "../../lib/auth";

function fmt(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminSupportPage() {
  const { user } = useAuth();

  const { data: convos = [], isLoading } = useQuery({
    queryKey: ["admin-support-convos", user?.id],
    queryFn: () => getConversations(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30_000,
  });

  const supportConvos = convos.filter((c) => c.otherParticipantId !== undefined);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Support Inbox</h1>
          <p className="mt-1 text-sm text-slate-400">Messages sent to support by users. Reply in the conversation.</p>
        </div>
        <span className="rounded-full bg-brand-cyan/10 px-3 py-1 text-xs font-semibold text-brand-cyan">
          {supportConvos.length} conversation{supportConvos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
      ) : supportConvos.length === 0 ? (
        <div className="rounded-2xl border border-white/10 py-16 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="font-semibold text-slate-300">No support messages yet</p>
          <p className="mt-1 text-sm text-slate-500">When users contact support, their messages will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Last message</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {supportConvos.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.otherParticipantName}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <p className="truncate text-slate-400 text-xs">{c.lastMessagePreview || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmt(c.lastMessageAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={"/messages/" + c.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-cyan/10 px-3 py-1.5 text-xs font-semibold text-brand-cyan hover:bg-brand-cyan/20 transition">
                      <ExternalLink className="h-3 w-3" /> Reply
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
