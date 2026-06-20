import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllNotificationsRead, type AppNotification } from "../lib/api";
import { useAuth } from "../lib/auth";

const TYPE_ICON: Record<string, string> = {
  booking_request: "📋",
  booking_accepted: "✅",
  booking_declined: "❌",
  booking_cancelled: "🚫",
  trip_completed: "🏁",
  new_message: "💬",
  document_approved: "✅",
  document_rejected: "❌",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const { signedIn } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: notifs = [], isLoading } = useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: signedIn,
    refetchInterval: 30_000,
  });

  const markOne = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
  });

  const handleClick = (n: AppNotification) => {
    if (!n.isRead) markOne.mutate(n.id);
    if (n.link) nav(n.link);
  };

  if (!signedIn) {
    return (
      <div className="container-rush py-20 text-center">
        <Bell className="mx-auto mb-4 h-12 w-12 text-slate-600" />
        <p className="text-slate-400">Sign in to view your notifications.</p>
        <Link to="/login?next=/notifications" className="btn-primary mt-6 inline-block px-8 py-3">Sign in</Link>
      </div>
    );
  }

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="container-rush py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
            {unread > 0 && <p className="mt-1 text-sm text-slate-400">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition"
            >
              {markAll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : notifs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 py-20 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            <p className="font-semibold text-slate-300">You're all caught up</p>
            <p className="mt-1 text-sm text-slate-500">Notifications about bookings, messages, and more will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/10 overflow-hidden">
            {notifs.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={"flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03] " + (!n.isRead ? "bg-brand-cyan/[0.04]" : "")}
              >
                <span className="mt-0.5 text-xl leading-none">{TYPE_ICON[n.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className={"text-sm font-semibold " + (!n.isRead ? "text-white" : "text-slate-300")}>{n.title}</p>
                  <p className="mt-0.5 text-sm text-slate-400 leading-snug">{n.body}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="text-xs text-slate-500 whitespace-nowrap">{fmtDate(n.createdAt)}</span>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand-cyan" />}
                  {n.isRead && <Check className="h-3.5 w-3.5 text-slate-600" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
