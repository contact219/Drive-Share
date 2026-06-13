import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Send, Loader2 } from "lucide-react";
import { getConversations, getMessages, sendMessage } from "../lib/api";
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

export default function Messages() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Find this conversation from the list to get participant info
  const { data: convs = [] } = useQuery({
    queryKey: ["conversations", user!.id],
    queryFn: () => getConversations(user!.id),
  });
  const conv = convs.find((c) => c.id === id);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => getMessages(id),
    refetchInterval: 8_000,
    enabled: !!id,
  });

  // Scroll to bottom when messages load or new one arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMut = useMutation({
    mutationFn: () => sendMessage(id, text.trim()),
    onSuccess: (msg) => {
      setText("");
      qc.setQueryData(["messages", id], (old: typeof messages) => [...(old || []), msg]);
      qc.invalidateQueries({ queryKey: ["conversations", user!.id] });
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !sendMut.isPending) sendMut.mutate();
  };

  const otherName = conv?.otherParticipantName || "Host";
  const otherAvatarIdx = (conv?.otherParticipantAvatar ?? 0) % AVATAR_BG.length;

  return (
    <div className="container-rush py-6">
      <div className="mx-auto flex max-w-2xl flex-col" style={{ height: "calc(100vh - 140px)" }}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <Link to="/messages" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${AVATAR_BG[otherAvatarIdx]}`}>
            {otherName[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold leading-none">{otherName}</p>
            {conv?.vehicleName && <p className="mt-0.5 text-xs text-slate-400">{conv.vehicleName}</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
              No messages yet. Start the conversation below.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => {
                const isMe = m.senderId === user!.id;
                const avatarColor = AVATAR_BG[(m.senderAvatar ?? 0) % AVATAR_BG.length];
                return (
                  <div key={m.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                    {!isMe && (
                      <div className={`mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${avatarColor}`}>
                        {m.senderName[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMe
                          ? "rounded-br-sm bg-brand-grad text-ink-900"
                          : "rounded-bl-sm bg-white/10 text-slate-100"
                      }`}
                    >
                      {m.content}
                      <div className={`mt-1 text-[10px] ${isMe ? "text-ink-900/60 text-right" : "text-slate-500"}`}>
                        {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            className="field flex-1"
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMut.isPending}
            className="btn-primary aspect-square px-3.5 disabled:opacity-50"
            aria-label="Send"
          >
            {sendMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
