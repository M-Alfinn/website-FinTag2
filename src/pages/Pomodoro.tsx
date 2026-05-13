import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Brain, Coffee, 
  Target, Zap, Bell, ChevronRight, LayoutDashboard, Clock, Sparkles, Settings2, X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

type Mode = 'focus' | 'short' | 'long' | 'custom';

const MODES: Record<Mode, { title: string; time: number; icon: any; color: string }> = {
  focus: { title: 'Focus Station', time: 25, icon: Brain, color: '#10B981' },
  short: { title: 'Quick Break', time: 5, icon: Coffee, color: '#3B82F6' },
  long: { title: 'Deep Rest', time: 15, icon: Target, color: '#6366F1' },
  custom: { title: 'Custom Timer', time: 10, icon: Clock, color: '#EC4899' },
};

export default function Pomodoro() {
  const [mode, setMode] = useState<Mode>('focus');
  const [customMinutes, setCustomMinutes] = useState(10);
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    confetti();
    if (Notification.permission === 'granted') {
      new Notification('Waktu Selesai!', { body: `Sesi ${MODES[mode].title} telah berakhir.` });
    }
    if (mode === 'focus') setSessions(s => s + 1);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    const defaultTime = mode === 'custom' ? customMinutes * 60 : MODES[mode].time * 60;
    if (timeLeft < defaultTime) {
      setIsConfirmingReset(true);
    } else {
      executeReset();
    }
  };

  const executeReset = () => {
    setIsActive(false);
    const defaultTime = mode === 'custom' ? customMinutes * 60 : MODES[mode].time * 60;
    setTimeLeft(defaultTime);
    setIsConfirmingReset(false);
  };

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    const defaultTime = newMode === 'custom' ? customMinutes * 60 : MODES[newMode].time * 60;
    setTimeLeft(defaultTime);
  };

  const handleCustomTimeChange = (val: number) => {
    const newVal = Math.max(1, Math.min(300, val));
    setCustomMinutes(newVal);
    if (mode === 'custom' && !isActive) {
      setTimeLeft(newVal * 60);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentTotal = mode === 'custom' ? customMinutes * 60 : MODES[mode].time * 60;
  const progress = (timeLeft / currentTotal) * 100;

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center space-y-12 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl lg:text-5xl font-heading font-bold text-secondary dark:text-white tracking-tighter uppercase">Focus Station</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Optimalkan // Produktivitas // Mahasiswa</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-stretch w-full">
        {/* Timer Display - Bento Style */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-12 xl:col-span-7 flex flex-col items-center gap-8 bento-card p-12 border-white/50 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100/50 dark:bg-white/5">
                <motion.div 
                   className="h-full bg-primary"
                   animate={{ width: `${100 - progress}%` }}
                />
            </div>

            <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-[20px] border border-slate-100 dark:border-white/5 overflow-x-auto no-scrollbar">
                {(['focus', 'short', 'long', 'custom'] as Mode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => changeMode(m)}
                        className={cn(
                            "px-5 py-2.5 rounded-[18px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                            mode === m 
                                ? "bg-secondary dark:bg-primary text-white shadow-md shadow-secondary/20" 
                                : "text-slate-400 dark:text-slate-500 hover:text-secondary dark:hover:text-white"
                        )}
                    >
                        {m === 'focus' ? 'Focus' : m === 'short' ? 'Break' : m === 'long' ? 'Long' : 'Custom'}
                    </button>
                ))}
            </div>

            <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-slate-50 dark:border-slate-800/50" />
                <svg className="w-full h-full -rotate-90 relative z-10">
                    <motion.circle 
                        cx="144" cy="144" r="136" 
                        className="stroke-primary" 
                        strokeWidth="8" 
                        strokeDasharray="854"
                        initial={{ strokeDashoffset: 854 }}
                        animate={{ strokeDashoffset: 854 - (854 * (100 - progress)) / 100 }}
                        fill="none" 
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-heading font-bold text-secondary dark:text-white tracking-tighter leading-none mb-1">
                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-[0.4em]">{mode} active</span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 w-full max-w-md px-4">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-100 hover:text-primary hover:border-primary/20 transition-all bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center group shrink-0"
                  title="Custom Time"
                >
                    <Settings2 className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform" />
                </button>
                <button 
                    onClick={toggleTimer}
                    className={cn(
                        "flex-1 py-4 lg:py-5 rounded-[24px] lg:rounded-[28px] font-bold text-lg lg:text-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group",
                        isActive ? "bg-slate-900 dark:bg-slate-800 text-white" : "bg-primary text-white shadow-primary/20"
                    )}
                >
                    {isActive ? <Pause className="w-5 h-5 lg:w-6 lg:h-6 fill-current" /> : <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-current shadow-lg" />}
                    <span className="text-xs lg:text-sm uppercase tracking-widest text-white">{isActive ? 'Pause' : 'Start Focus'}</span>
                </button>
                <button 
                    onClick={resetTimer}
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-100 hover:text-rose-500 hover:border-rose-100 transition-all bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0"
                    title="Reset Timer"
                >
                    <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
            </div>
        </motion.div>

        {/* Stats & Tips */}
        <div className="lg:col-span-12 xl:col-span-5 grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bento-card p-6 space-y-4 flex flex-col justify-between">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Sesi Selesai</p>
                        <p className="text-4xl font-heading font-bold text-secondary dark:text-white">{sessions}</p>
                    </div>
                </div>
                <div className="bento-card p-6 space-y-4 flex flex-col justify-between">
                    <div className="w-10 h-10 bg-secondary/5 dark:bg-white/5 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-secondary dark:text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Menit</p>
                        <p className="text-4xl font-heading font-bold text-secondary dark:text-white">{sessions * MODES.focus.time}</p>
                    </div>
                </div>
            </div>

            <div className="bento-card p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-xl dark:text-white flex items-center gap-2">
                        Focus Tips
                    </h3>
                    <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-4">
                    {[
                        "Simpan smartphone di laci.",
                        "Gunakan headset noise-cancelling.",
                        "Siapkan air minum di meja.",
                        "Stretching singkat saat break."
                    ].map((tip, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 group">
                            <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-[10px] group-hover:bg-primary group-hover:text-white transition-all">
                                {i + 1}
                            </div>
                            {tip}
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full p-2 bg-secondary dark:bg-slate-900 text-white rounded-[32px] flex items-center justify-between group overflow-hidden relative shadow-lg border border-white/5">
                <div className="flex items-center gap-4 pl-6 py-4">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Cek Progress</p>
                        <h4 className="text-base font-heading font-bold uppercase leading-none">Statistik Belajar</h4>
                    </div>
                </div>
                <div className="bg-primary p-4 rounded-2xl mr-1 group-hover:translate-x-1 transition-transform">
                   <ChevronRight className="w-5 h-5" />
                </div>
            </button>
        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 glass p-10 rounded-[48px] border border-white dark:border-white/10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">Custom Time</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Duration (minutes)</label>
                      <span className="text-2xl font-heading font-bold text-secondary dark:text-primary">{customMinutes}m</span>
                    </div>
                    <div className="flex items-center gap-4 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-white/5">
                      <input 
                        type="number" 
                        min="1" 
                        max="300"
                        value={customMinutes}
                        onChange={(e) => handleCustomTimeChange(parseInt(e.target.value) || 0)}
                        className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-heading font-bold text-xl focus:outline-none focus:border-secondary transition-all"
                        placeholder="0"
                      />
                      <div className="pr-4 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">Min</div>
                    </div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center font-medium">Ketikkan durasi fokus yang Anda inginkan (maks 300 menit).</p>
                  </div>
              </div>

              <button 
                onClick={() => {
                    setIsSettingsOpen(false);
                    changeMode('custom');
                }}
                className="w-full py-5 bg-secondary dark:bg-primary text-white rounded-[28px] font-bold shadow-xl shadow-secondary/10 dark:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold uppercase tracking-widest text-sm"
              >
                Gunakan Custom
              </button>
            </motion.div>
          </div>
        )}

        {isConfirmingReset && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsConfirmingReset(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm glass p-8 rounded-[40px] border border-white dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl space-y-6 text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-900/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto transition-all">
                <RotateCcw className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Reset Timer?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Kembalikan waktu fokus ke awal? Progress sesi ini akan hilang.</p>
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={() => setIsConfirmingReset(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Batal</button>
                <button onClick={executeReset} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 shadow-xl shadow-rose-500/20 transition-all font-bold">Ya, Reset</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
