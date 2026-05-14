import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipForward, SkipBack, 
  Music, Heart, Share2, 
  LayoutDashboard, MoreHorizontal, Sparkles, X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { LOCAL_SONGS } from '../data/musicData';

export default function MusicPlayer() {
  const [songs] = useState<any[]>(LOCAL_SONGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = songs[currentIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentSong.url;
      setIsBuffering(true);
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const handleBack = () => {
    setCurrentIndex(prev => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onCanPlay = () => {
    setIsBuffering(false);
  };

  const onWaiting = () => {
    setIsBuffering(true);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedValue = (x / rect.width) * duration;
      audioRef.current.currentTime = clickedValue;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <audio 
        ref={audioRef}
        src={currentSong.url}
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onCanPlay={onCanPlay}
        onWaiting={onWaiting}
        onEnded={handleNext}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-stretch pt-4">
        
        {/* Left: Player Artwork - Bento Style */}
        <div className="w-full lg:w-5/12 space-y-6">
          <motion.div 
            key={currentSong.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card p-6 border-white/50 aspect-square flex flex-col justify-between overflow-hidden group"
          >
            <div className="relative aspect-square w-full rounded-[32px] overflow-hidden shadow-2xl">
              <img 
                 src={currentSong.cover} 
                 referrerPolicy="no-referrer"
                 className={cn(
                   "w-full h-full object-cover transition-all duration-1000",
                   isPlaying ? "scale-105" : "scale-100 grayscale-[0.4]"
                 )}
                 alt="Cover"
                 onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200')}
              />
              {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px]">
                      <div className="flex items-end gap-1.5 px-4 h-12">
                          {[0.1, 0.3, 0.2, 0.4, 0.1].map((delay, i) => (
                              <motion.div 
                                  key={i}
                                  animate={{ height: [10, 40, 20, 48, 10] }}
                                  transition={{ repeat: Infinity, duration: 0.8, delay: delay }}
                                  className="w-1.5 bg-primary rounded-full"
                              />
                          ))}
                      </div>
                  </div>
              )}
            </div>

            <div className="pt-6 flex justify-between items-end">
              <div className="space-y-1 text-left">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mb-1">Now Playing</p>
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight leading-none">{currentSong.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{currentSong.artist}</p>
              </div>
            </div>
          </motion.div>

          <div className="bento-card p-8 space-y-6">
            <div className="space-y-4">
              <div 
                className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer group"
                onClick={handleSeek}
              >
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-primary shadow-lg shadow-primary/20 z-10"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <div className="absolute inset-x-0 top-0 bottom-0 bg-slate-100/50 dark:bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-widest">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8">
                <button onClick={handleBack} className="p-2 text-slate-400 dark:text-slate-500 hover:text-secondary dark:hover:text-white transition-all hover:scale-110 active:scale-90"><SkipBack className="w-6 h-6 fill-current" /></button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-secondary dark:bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-secondary/20 dark:shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  disabled={isBuffering && isPlaying}
                >
                  {isBuffering && isPlaying ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>
                <button onClick={handleNext} className="p-2 text-slate-400 dark:text-slate-500 hover:text-secondary dark:hover:text-white transition-all hover:scale-110 active:scale-90"><SkipForward className="w-6 h-6 fill-current" /></button>
            </div>
          </div>
        </div>

        {/* Right: Playlist */}
        <div className="flex-1 space-y-6 py-2">
           <div className="flex items-center justify-between px-2">
              <div className="space-y-1 text-left">
                <h3 className="font-heading font-bold text-xl leading-none flex items-center gap-2 dark:text-white">
                   Playlist
                </h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">TRENDING // {songs.length} TRACKS</p>
              </div>
              <Music className="w-5 h-5 text-primary opacity-40" />
           </div>

           <div className="space-y-2 overflow-y-auto max-h-[680px] pr-2 custom-scrollbar lg:grid lg:grid-cols-1 gap-2">
               {songs.map((song, i) => (
                <div
                  key={song.id}
                  onClick={() => { setCurrentIndex(i); setIsPlaying(true); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setCurrentIndex(i); setIsPlaying(true); } }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-3xl transition-all group border cursor-pointer",
                    currentIndex === i 
                      ? "bg-secondary dark:bg-primary text-white border-secondary dark:border-primary shadow-lg shadow-secondary/10 dark:shadow-primary/10" 
                      : "bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm text-secondary dark:text-white border-white dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                  )}
                >
                   <div className="relative w-12 h-12 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                      <img 
                       src={song.cover} 
                       referrerPolicy="no-referrer"
                       className="w-full h-full object-cover" 
                       onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200')} 
                    />
                      {currentIndex === i && isPlaying && (
                         <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                            <motion.div 
                               animate={{ scale: [1, 1.3, 1] }} 
                               transition={{ repeat: Infinity, duration: 1 }}
                               className="w-2 h-2 bg-white rounded-full shadow-lg"
                            />
                         </div>
                      )}
                   </div>
                   <div className="flex-1 text-left min-w-0">
                      <p className={cn("text-sm font-bold truncate tracking-tight", currentIndex === i ? "text-white" : "text-slate-900 dark:text-white")}>{song.title}</p>
                      <p className={cn("text-[10px] uppercase font-bold tracking-widest opacity-60", currentIndex === i ? "text-white/60" : "text-slate-400 dark:text-slate-500")}>{song.artist}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
