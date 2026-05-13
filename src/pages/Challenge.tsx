import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle2, Circle, Star, Zap, Droplets, Wallet, Footprints, Clock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

export default function Challenge() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(setChallenges);
    
    const saved = localStorage.getItem('completed_challenges');
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const toggleChallenge = (id: string) => {
    const isDone = completed.includes(id);
    let newCompleted;
    if (isDone) {
      newCompleted = completed.filter(c => c !== id);
    } else {
      newCompleted = [...completed, id];
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setCompleted(newCompleted);
    localStorage.setItem('completed_challenges', JSON.stringify(newCompleted));
  };

  const progress = challenges.length > 0 ? (completed.length / challenges.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-4 h-4" />
            <span>Daily Challenges</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Level Up Dirimu</h1>
        <p className="text-slate-500 dark:text-slate-400">Selesaikan misi harian untuk membangun kebiasaan yang lebih baik.</p>
      </div>

      {/* Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 glass rounded-[40px] border border-white dark:border-white/5 shadow-xl flex flex-col md:flex-row items-center gap-8"
      >
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="60" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="none" />
                <motion.circle 
                    cx="64" cy="64" r="60" 
                    className="stroke-primary" 
                    strokeWidth="8" 
                    strokeDasharray="377"
                    initial={{ strokeDashoffset: 377 }}
                    animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
                    transition={{ duration: 1, type: 'spring' }}
                    fill="none" 
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-heading dark:text-white">{Math.round(progress)}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Done</span>
            </div>
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
            <h3 className="text-xl font-heading font-bold dark:text-white">Progress Hari Ini</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Kamu sudah menyelesaikan {completed.length} dari {challenges.length} tantangan. Sedikit lagi menuju Badge Gold!</p>
            <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", i < completed.length ? "bg-amber-100 dark:bg-amber-900/40 text-amber-500" : "bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600")}>
                        <Star className={cn("w-4 h-4", i < completed.length && "fill-current")} />
                    </div>
                ))}
            </div>
        </div>
      </motion.div>

      {/* List */}
      <div className="grid gap-4">
        {challenges.map((challenge, i) => {
          const isDone = completed.includes(challenge.id);
          const icons: any = { Droplets, Wallet, Footprints, Clock, Zap, Sparkles };
          const Icon = icons[challenge.icon] || Zap;

          return (
            <motion.button
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => toggleChallenge(challenge.id)}
              className={cn(
                "group w-full p-6 rounded-3xl border transition-all flex items-center gap-6",
                isDone 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 opacity-75" 
                  : "glass border-white dark:border-white/5 hover:border-primary/40 shadow-sm"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                isDone ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 text-left">
                <h4 className={cn("font-bold text-lg", isDone ? "text-emerald-800 dark:text-emerald-400 line-through" : "text-slate-900 dark:text-white")}>
                    {challenge.title}
                </h4>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{challenge.category}</p>
              </div>

              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 dark:border-white/10"
              )}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-0 group-hover:opacity-100 text-primary" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="p-8 bg-slate-900 dark:bg-slate-800 text-white rounded-[40px] flex items-center justify-between overflow-hidden relative">
          <div className="space-y-2 relative z-10">
              <h4 className="text-lg font-heading font-bold">Terus Berikan yang Terbaik!</h4>
              <p className="text-xs text-white/60 dark:text-slate-400">Disiplin adalah kunci kesuksesan finansial.</p>
          </div>
          <Sparkles className="w-20 h-20 text-white/5 dark:text-white/10 absolute -right-4 -bottom-4 rotate-12" />
          <Link to="/" className="relative z-10 px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase hover:scale-110 transition-all">Pelajari</Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
