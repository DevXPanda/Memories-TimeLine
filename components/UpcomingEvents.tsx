"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, Bell, Trash2, Plus, X, Clock, PartyPopper, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_TYPES = [
  { value: "birthday",   label: "Birthday",    emoji: "🎂" },
  { value: "anniversary",label: "Anniversary", emoji: "💑" },
  { value: "trip",       label: "Trip/Date",   emoji: "✈️" },
  { value: "other",      label: "Other",       emoji: "✨" },
];

export default function UpcomingEvents() {
  const { userId } = useAuth();
  const events = useQuery((api as any).events.list, { userId: userId || undefined });
  const removeEvent = useMutation((api as any).events.remove);
  const createEvent = useMutation((api as any).events.create);

  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "birthday",
    notes: "",
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    setLoading(true);
    try {
      await createEvent({ userId: userId!, ...formData });
      setShowAdd(false);
      setFormData({ title: "", date: "", type: "birthday", notes: "" });
    } finally {
      setLoading(false);
    }
  };

  const getDetailedTimeLeft = (dateStr: string, type: string) => {
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    if (type === "birthday" || type === "anniversary") {
      eventDate.setFullYear(now.getFullYear());
      if (eventDate.getTime() < now.getTime() && 
          (now.getDate() !== eventDate.getDate() || now.getMonth() !== eventDate.getMonth())) {
        eventDate.setFullYear(now.getFullYear() + 1);
      }
    }

    const diff = eventDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const isToday = now.getDate() === eventDate.getDate() && now.getMonth() === eventDate.getMonth();

    return { days, hours, mins, secs, isToday, total: diff };
  };

  const sortedEvents = (events as any[])?.map((e: any) => ({
    ...e,
    timer: getDetailedTimeLeft(e.date, e.type)
  })).sort((a: any, b: any) => a.timer.total - b.timer.total).filter((e: any) => e.timer.total > -86400000).slice(0, 3);

  if (!events) return <div className="h-32 shimmer rounded-3xl mb-12" />;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center glass shadow-sm" style={{ border: "1px solid var(--border-glass)" }}>
             <Bell className="w-5 h-5 animate-swing" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
              Upcoming Moments
            </h2>
            <p className="text-xs font-medium opacity-60" style={{ color: "var(--text-muted)" }}>Don't miss a single highlight</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all glass hover:shadow-md border"
          style={{ borderColor: "var(--border-glass)", color: "var(--primary)" }}>
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {sortedEvents?.length === 0 ? (
        <div className="glass-strong rounded-[32px] p-12 text-center border-dashed border-2 flex flex-col items-center gap-4 bg-white/30"
          style={{ borderColor: "var(--border-glass-strong)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center glass mb-2" style={{ color: "var(--primary-soft)" }}>
            <Calendar className="w-6 h-6 opacity-20" />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No upcoming events scheduled. Add your first memory-to-be! ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedEvents?.map((ev: any) => (
            <div key={ev._id} className={`glass-strong group relative p-6 rounded-[32px] transition-all hover:scale-[1.02] border ${ev.timer.isToday ? 'shadow-xl' : ''}`}
              style={{ 
                borderColor: ev.timer.isToday ? 'var(--primary)' : 'var(--border-glass)',
                background: ev.timer.isToday ? 'var(--primary-blush)' : 'var(--bg-glass-strong)'
              }}>
              
              <button onClick={() => userId && removeEvent({ id: ev._id, userId })}
                className="absolute top-4 right-4 p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-white/50 transition-all z-10"
                style={{ color: "var(--text-light)" }}>
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-3xl shrink-0 shadow-sm glass border border-white/20 ${ev.timer.isToday ? 'animate-pulse' : ''}`}
                    style={{ background: ev.timer.isToday ? 'var(--primary)' : 'var(--primary-blush)' }}>
                    {EVENT_TYPES.find(t => t.value === ev.type)?.emoji || "✨"}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold truncate text-lg" style={{ color: "var(--primary-deep)" }}>
                      {ev.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-bold uppercase tracking-widest opacity-40" style={{ color: "var(--text-muted)" }}>
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ev.date).toLocaleDateString("en-IN", { day:'numeric', month:'short', year:'numeric'})}
                    </div>
                  </div>
                </div>

                <div className={`mt-auto p-4 rounded-2xl glass-strong border border-white/20 ${ev.timer.isToday ? 'shadow-lg' : ''}`}>
                  {ev.timer.isToday ? (
                    <div className="text-center animate-heartbeat">
                      <p className="text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2" style={{ color: "var(--primary)" }}>
                        <PartyPopper className="w-5 h-5" /> Today is the day!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <TimerUnit value={ev.timer.days}  label="Days"  color="var(--primary)" />
                      <TimerUnit value={ev.timer.hours} label="Hrs"   color="var(--text-main)" />
                      <TimerUnit value={ev.timer.mins}  label="Mins"  color="var(--text-main)" />
                      <TimerUnit value={ev.timer.secs}  label="Secs"  color="var(--text-main)" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="glass-strong w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border"
               style={{ borderColor: "var(--border-glass-strong)" }}
            >
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--border-glass-strong)" }}>
                <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                  <Clock className="w-5 h-5" style={{ color: "var(--primary)" }} /> Schedule Moment
                </h3>
                <button onClick={() => setShowAdd(false)} className="p-2 rounded-full hover:bg-white/50 transition-colors" style={{ color: "var(--text-light)" }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 ml-1" style={{ color: "var(--text-main)" }}>Event Title</label>
                  <input required className="input-rose" placeholder="e.g. Our Anniversary 💑" 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 ml-1" style={{ color: "var(--text-main)" }}>Date</label>
                    <input required type="date" className="input-rose" 
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 ml-1" style={{ color: "var(--text-main)" }}>Event Type</label>
                    <div className="relative">
                      <select className="input-rose pr-8 appearance-none" 
                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 ml-1" style={{ color: "var(--text-main)" }}>Private Notes</label>
                  <textarea className="input-rose min-h-[100px] resize-none" placeholder="Surprise plan or notes for each other..." 
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-4 mt-4 rounded-2xl justify-center font-bold text-base shadow-xl">
                  {loading ? "Scheduling..." : "Create Moment ❤️"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimerUnit({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-bold leading-none" style={{ color }}>{value.toString().padStart(2, '0')}</span>
      <span className="text-[10px] uppercase font-bold tracking-tighter opacity-40 mt-1" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function ChevronDownIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  );
}
