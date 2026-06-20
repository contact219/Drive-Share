import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, MessageSquare, ChevronRight, HelpCircle, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/auth";
import { startSupportThread } from "../lib/api";

const FAQS = [
  { q: "How do I cancel a booking?", a: "Go to My Trips, find the booking, and click Cancel. Cancellations made 24+ hours before pickup are fully refunded." },
  { q: "How long does vehicle verification take?", a: "We review submitted documents within 1–2 business days. You'll see your status update in your Host Dashboard." },
  { q: "What if a renter damages my car?", a: "Rush's host protection covers damage during active trips. File a report from your Host Dashboard within 24 hours of the trip ending." },
  { q: "Can I change my pickup location?", a: "Pickup location is set by the host. Message the host directly through the booking to coordinate." },
  { q: "How do payouts work?", a: "Host payouts are processed 24 hours after trip completion. Allow 3–5 business days for funds to appear." },
];

export default function Support() {
  const { signedIn, user } = useAuth();
  const nav = useNavigate();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!signedIn) { nav("/login?next=/support"); return; }
    setBusy(true); setErr("");
    try {
      const { conversationId } = await startSupportThread(message.trim());
      nav("/messages/" + conversationId);
    } catch (e: any) {
      setErr(e.message || "Failed to send message. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="container-rush py-12">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-cyan/10">
            <MessageSquare className="h-7 w-7 text-brand-cyan" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">How can we help?</h1>
          <p className="mt-2 text-slate-400">Send us a message and we'll get back to you in your inbox.</p>
        </div>

        {/* Contact form */}
        <div className="panel p-7 mb-8">
          <h2 className="mb-4 text-base font-bold">Send a message</h2>
          <form onSubmit={submit} className="space-y-4">
            <textarea
              className="field min-h-[120px] resize-y"
              placeholder="Describe your issue or question…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
            />
            {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
            {!signedIn && (
              <p className="text-sm text-slate-400">
                You need to{" "}
                <Link to="/login?next=/support" className="text-brand-cyan hover:underline">sign in</Link>
                {" "}to send a message. Your reply will appear in your inbox.
              </p>
            )}
            <button
              disabled={busy || !message.trim()}
              className="btn-primary w-full py-3.5 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
            </button>
          </form>
        </div>

        {/* Info strips */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: Clock, label: "Response time", value: "Under 24 hours" },
            { icon: MessageSquare, label: "Replies in", value: "Your inbox" },
            { icon: ShieldCheck, label: "Available", value: "Mon – Fri" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-brand-cyan" />
              <div className="text-xs text-slate-400">{label}</div>
              <div className="mt-0.5 text-sm font-semibold">{value}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-cyan" />
            <h2 className="text-base font-bold">Frequently asked questions</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <ChevronRight className={"h-4 w-4 text-slate-400 transition-transform " + (openFaq === i ? "rotate-90" : "")} />
                </button>
                {openFaq === i && (
                  <div className="border-t border-white/10 px-5 pb-4 pt-3 text-sm text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
