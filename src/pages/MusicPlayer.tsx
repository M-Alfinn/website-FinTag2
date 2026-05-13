import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, 
  Music, ListMusic, Heart, Share2, 
  LayoutDashboard, MoreHorizontal, Sparkles, Edit3, X, Save, Trash2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { cn } from '../lib/utils';

export default function MusicPlayer() {
  const Player = ReactPlayer as any;
  const [songs, setSongs] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [editingSong, setEditingSong] = useState<any>(null);
  const playerRef = useRef<any>(null);

  const fetchSongs = () => {
    fetch('/api/music')
      .then(res => res.json())
      .then(setSongs);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    try {
      const response = await fetch(`/api/music/${editingSong.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSong)
      });
      if (response.ok) {
        fetchSongs();
        setEditingSong(null);
      }
    } catch (error) {
      console.error('Update song error:', error);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!confirm('Hapus lagu dari playlist?')) return;
    try {
      const response = await fetch(`/api/music/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSongs();
        if (songs[currentIndex]?.id === id) {
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Delete song error:', error);
    }
  };

  const currentSong = songs[currentIndex];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % songs.length);
    setPlayed(0);
  };

  const handleBack = () => {
    setCurrentIndex(prev => (prev - 1 + songs.length) % songs.length);
    setPlayed(0);
  };

  const handleProgress = (state: any) => {
    setPlayed(state.played);
    if (duration === 0 && playerRef.current) {
      const dur = playerRef.current.getDuration();
      if (dur > 0) setDuration(dur);
    }
  };

  const handleDuration = (dur: number) => {
    setDuration(dur);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  if (!currentSong) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12">
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
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mb-1">Now Playing</p>
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight leading-none">{currentSong.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{currentSong.artist}</p>
              </div>
              <div className="flex gap-2">
                 <button className="w-8 h-8 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:border-rose-100 transition-all">
                    <Heart className="w-4 h-4 fill-current" />
                 </button>
              </div>
            </div>
          </motion.div>

          <div className="bento-card p-8 space-y-6">
            <div className="space-y-4">
              <div 
                className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const clickedValue = x / rect.width;
                  playerRef.current?.seekTo(clickedValue);
                }}
              >
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-primary shadow-lg shadow-primary/20 z-10"
                    animate={{ width: `${played * 100}%` }}
                  />
                  <div className="absolute inset-x-0 top-0 bottom-0 bg-slate-100/50 dark:bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-widest">
                  <span>{formatTime(played * duration)}</span>
                  <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8">
                <button onClick={handleBack} className="p-2 text-slate-400 dark:text-slate-500 hover:text-secondary dark:hover:text-white transition-all hover:scale-110 active:scale-90"><SkipBack className="w-6 h-6 fill-current" /></button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-secondary dark:bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-secondary/20 dark:shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
                <button onClick={handleNext} className="p-2 text-slate-400 dark:text-slate-500 hover:text-secondary dark:hover:text-white transition-all hover:scale-110 active:scale-90"><SkipForward className="w-6 h-6 fill-current" /></button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-white dark:border-white/5">
               <Volume2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
               <input 
                 type="range" 
                 min="0" max="1" step="0.01" 
                 value={volume}
                 onChange={(e) => setVolume(Number(e.target.value))}
                 className="flex-1 accent-primary h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
               />
            </div>
          </div>
        </div>

        {/* Right: Playlist */}
        <div className="flex-1 space-y-6 py-2">
           <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-xl leading-none flex items-center gap-2 dark:text-white">
                   Playlist Mahasiswa
                </h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">TRENDING // {songs.length} TRACKS</p>
              </div>
              <Sparkles className="w-5 h-5 text-primary opacity-40" />
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
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditingSong(song); }}
                        className={cn("p-2 rounded-xl border transition-all", currentIndex === i ? "border-white/20 hover:bg-white/10 text-white" : "border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-primary")}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}
                        className={cn("p-2 rounded-xl border transition-all", currentIndex === i ? "border-white/20 hover:bg-white/10 text-white" : "border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-rose-500")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <div className="bento-card p-6 bg-primary text-white border-transparent overflow-hidden relative group">
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] leading-none mb-1">Coming Soon</p>
                        <h4 className="text-xl font-heading font-bold leading-tight">AI Curated Mix</h4>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Music className="w-5 h-5 text-white" />
                    </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
           </div>
        </div>
      </div>

    <div className="hidden pointer-events-none">
        <Player
          ref={playerRef}
          url={currentSong.url}
          playing={isPlaying}
          volume={volume}
          playsinline
          controls={false}
          config={{
            youtube: {
              playerVars: { 
                autoplay: 1, 
                controls: 0,
                modestbranding: 1,
                rel: 0
              }
            } as any
          }}
          onProgress={handleProgress}
          onReady={(player: any) => {
            const dur = player.getDuration();
            if (dur > 0) setDuration(dur);
          }}
          onEnded={handleNext}
          onError={(e: any) => {
            console.error('Music Player Error:', e);
            // If sound fails, try toggling play to force interaction
            if (isPlaying) {
              setTimeout(() => setIsPlaying(true), 100);
            }
          }}
          width="0"
          height="0"
        />
      </div>
      
      {/* Edit Modal */}
      <AnimatePresence>
        {editingSong && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setEditingSong(null)} 
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.9, opacity: 0, y: 20 }} 
               className="relative w-full max-w-md bg-white dark:bg-slate-800 p-10 rounded-[48px] border border-white dark:border-white/5 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">Edit Lagu</h3>
                <button onClick={() => setEditingSong(null)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateSong} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Judul Lagu</label>
                    <input 
                      type="text" 
                      required
                      value={editingSong.title}
                      onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Artis</label>
                    <input 
                      type="text" 
                      required
                      value={editingSong.artist}
                      onChange={(e) => setEditingSong({ ...editingSong, artist: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">URL Youtube</label>
                    <input 
                      type="text" 
                      required
                      value={editingSong.url}
                      onChange={(e) => setEditingSong({ ...editingSong, url: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Cover Image (URL)</label>
                    <input 
                      type="text" 
                      required
                      value={editingSong.cover}
                      onChange={(e) => setEditingSong({ ...editingSong, cover: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-secondary dark:bg-primary text-white rounded-[28px] font-bold shadow-xl shadow-secondary/20 dark:shadow-primary/20 hover:bg-slate-800 dark:hover:bg-primary-dark transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                  <Save className="w-5 h-5" />
                  Simpan Perubahan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
