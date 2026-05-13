import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Wallet, ShoppingBag, Gamepad2, Trophy, Music, 
  Map, Clock, LayoutDashboard, Menu, X, Github, Sun, Moon
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const mainMenuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Tracker', path: '/tracker', icon: Wallet },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Music', path: '/music', icon: Music },
  ];

  const adminMenu = { name: 'Admin', path: '/admin', icon: LayoutDashboard };

  const extraMenuItems = [
    { name: 'AR Guide', path: '/ar', icon: Map },
    { name: 'Games', path: '/games', icon: Gamepad2 },
    { name: 'Challenge', path: '/challenge', icon: Trophy },
    { name: 'Pomodoro', path: '/pomodoro', icon: Clock },
  ];

  const allMenuItems = [...mainMenuItems, ...extraMenuItems, adminMenu];

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 relative">
      <div className="noise-overlay" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 px-6 lg:px-12 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 z-50 transition-all">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:rotate-6 transition-all">F</div>
          <span className="font-heading font-black text-2xl tracking-tighter text-slate-900 dark:text-white transition-colors">
            FinTag
          </span>
        </Link>

        {/* Desktop Menu - Simplified */}
        <div className="hidden lg:flex items-center gap-1 ml-12">
          {mainMenuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                location.pathname === item.path 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-white/5"
              )}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Desktop Extra Items on XL */}
          <div className="hidden xl:flex items-center gap-1 ml-2">
            {extraMenuItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  location.pathname === item.path 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" 
                    : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Menu Seperator */}
          <div className="hidden lg:flex items-center border-l border-slate-200 dark:border-white/10 ml-2 pl-2 mr-2">
            <Link 
              to={adminMenu.path}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                location.pathname === adminMenu.path 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                  : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-white/5"
              )}
            >
              {adminMenu.name}
            </Link>
          </div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:scale-110 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link 
            to="/tracker" 
            className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            TRACK NOW
          </Link>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-white"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 lg:hidden glass-dark text-white p-8 pt-24 flex flex-col overflow-y-auto"
          >
            <div className="flex-1 flex flex-col justify-start gap-4 sm:gap-6">
              {allMenuItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    to={item.path}
                    className={cn(
                      "flex items-center gap-4 text-3xl font-heading font-black py-2 transition-all uppercase tracking-tighter",
                      location.pathname === item.path ? "text-primary ml-4" : "text-white/60 hover:text-white"
                    )}
                  >
                    <item.icon className="w-8 h-8" />
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-white/10">
              <p className="text-white/40 text-sm mb-4">Tim Kelompok 3 Technopreneurship UNIMED 2026</p>
              <div className="flex gap-4">
                <Github className="w-5 h-5 text-white/60" />
                <ShoppingBag className="w-5 h-5 text-white/60" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 md:py-24 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
            {/* Logo and About */}
            <div className="md:col-span-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 dark:bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 dark:shadow-primary/20">
                  <span className="text-white font-black text-lg">F</span>
                </div>
                <span className="font-heading font-bold text-2xl dark:text-white tracking-tighter uppercase">FinTag</span>
              </div>
              <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                Next-generation financial tracker untuk mahasiswa produktif. Tap, track, dan kuasai keuanganmu dalam hitungan detik. Kelola budget harianmu dengan gaya.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Product</h4>
                <div className="flex flex-col gap-4">
                  <Link to="/tracker" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Tracking</Link>
                  <Link to="/shop" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Shop</Link>
                  <Link to="/music" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Music Hub</Link>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Quick Links</h4>
                <div className="flex flex-col gap-4">
                  <Link to="/games" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Mini Games</Link>
                  <Link to="/ar" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">AR Guide</Link>
                  <Link to="/admin" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Admin Panel</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
              © 2026 Technopreneurship UNIMED // KELOMPOK 3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
