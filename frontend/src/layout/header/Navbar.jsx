import React, { useState, useEffect, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Music,
  LayoutDashboard,
  Bell,
  LogOut,
  Users,
  User,
  ChevronDown,
  BookOpen,
  Trophy,
  LifeBuoy,
  Instagram,
  Twitter,
  Youtube,
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const { pathname } = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const [isLight, setIsLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  const { scrollY } = useScroll();
  const width = useTransform(scrollY, [0, 120], ['100%', '92%']);
  const top = useTransform(scrollY, [0, 120], ['0px', '16px']);
  const radius = useTransform(scrollY, [0, 120], ['0px', '24px']);
  const padding = useTransform(scrollY, [0, 120], ['1.25rem', '0.75rem']);
  const logoScale = useTransform(scrollY, [0, 120], [1, 0.88]);

  const springConfig = { stiffness: 350, damping: 35 };
  const smoothWidth = useSpring(width, springConfig);
  const smoothTop = useSpring(top, springConfig);
  const smoothRadius = useSpring(radius, springConfig);
  const smoothPadding = useSpring(padding, springConfig);
  const smoothLogoScale = useSpring(logoScale, springConfig);

  const navLinks = useMemo(() => [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Library', path: '/library', icon: Music },
    { label: 'Studio', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Updates', path: '/updates', icon: Bell },
  ], []);

  const communityItems = [
    { title: "Journal", desc: "Mindfulness tips & stories", icon: BookOpen, path: "/blog" },
    { title: "Challenges", desc: "Join wave sessions with others", icon: Trophy, path: "/playoffs" },
    { title: "Support", desc: "Help center & guidance", icon: LifeBuoy, path: "/help" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const light = stored === 'light' || (!stored && prefersLight);
    setIsLight(light);
    document.documentElement.classList.toggle('light', light);
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle('light', next);
    localStorage.setItem('theme', next ? 'light' : 'dark');
  };

  return (
    <>
      <motion.nav
        style={{
          width: smoothWidth,
          top: smoothTop,
          borderRadius: smoothRadius,
          paddingTop: smoothPadding,
          paddingBottom: smoothPadding,
        }}
        className={`fixed left-1/2 -translate-x-1/2 z-50 border backdrop-blur-3xl transition-colors duration-500
        ${isLight
          ? 'bg-white/70 border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.06)]'
          : 'bg-slate-950/40 border-white/5 shadow-2xl shadow-indigo-500/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex-shrink-0">
            <motion.div style={{ scale: smoothLogoScale }}>
              <Logo isLight={isLight} size={40} />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
            {navLinks.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative px-5 py-2 text-sm font-bold rounded-full transition-all duration-300 group
                  ${active ? 'text-white' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 shadow-lg shadow-indigo-500/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon size={16} className={active ? 'text-white' : 'text-indigo-500/70 group-hover:text-indigo-500'} />
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Community Dropdown */}
            <div className="relative" onMouseEnter={() => setCommunityOpen(true)} onMouseLeave={() => setCommunityOpen(false)}>
              <button className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-full transition-all ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                <Users size={16} className="text-indigo-500/70" />
                Community
                <motion.span animate={{ rotate: communityOpen ? 180 : 0 }}><ChevronDown size={14} /></motion.span>
              </button>
              <AnimatePresence>
                {communityOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute left-0 mt-3 w-80 rounded-3xl border p-4 shadow-2xl backdrop-blur-2xl ${isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-white/10 shadow-black/50'}`}
                  >
                    <div className="space-y-1">
                      {communityItems.map((item) => (
                        <Link key={item.title} to={item.path} className={`flex gap-4 p-3 rounded-2xl transition-all ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}>
                          <item.icon size={20} className="text-indigo-500 mt-1" />
                          <div>
                            <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</div>
                            <div className="text-xs text-slate-500">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className={`my-4 h-px ${isLight ? 'bg-slate-200' : 'bg-white/5'}`} />
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect</span>
                      <div className="flex gap-3">
                        <Instagram size={14} className="cursor-pointer text-slate-500 hover:text-indigo-500" />
                        <Twitter size={14} className="cursor-pointer text-slate-500 hover:text-indigo-500" />
                        <Youtube size={14} className="cursor-pointer text-slate-500 hover:text-indigo-500" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9, rotate: 180 }}
              onClick={toggleTheme}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${isLight ? 'bg-slate-100 border-slate-200 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              {isLight ? <Moon size={18} className="text-indigo-600" /> : <Sun size={18} className="text-amber-400" />}
            </motion.button>

            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile"
                    className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all
                    ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
                    title="Profile"
                  >
                    <User size={18} />
                  </Link>
                  <button
                    onClick={logout}
                    className={`flex items-center justify-center w-11 h-11 rounded-2xl border transition-all
                    ${isLight ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'}`}
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles size={16} />
                  Get Started
                </Link>
              )}
            </div>

            <button onClick={() => setMobileOpen(true)} className="lg:hidden w-11 h-11 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-500 active:scale-90 transition-all">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className={`absolute right-0 top-0 h-full w-full max-w-sm p-8 flex flex-col shadow-2xl ${isLight ? 'bg-white' : 'bg-slate-900'}`}
            >
              <div className="flex justify-between items-center mb-12">
                <Logo isLight={isLight} size={36} />
                <button onClick={() => setMobileOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5"><X size={24} className="text-indigo-500" /></button>
              </div>

              <nav className="flex flex-col gap-4 flex-1">
                {isAuthenticated && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={`text-2xl font-black p-4 rounded-3xl transition-all flex items-center justify-between
                    ${pathname === '/profile' ? 'bg-indigo-600 text-white' : isLight ? 'text-slate-800 hover:bg-slate-50' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    Profile
                    <User size={20} className="opacity-50" />
                  </Link>
                )}
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`text-2xl font-black p-4 rounded-3xl transition-all flex items-center justify-between
                    ${pathname === item.path ? 'bg-indigo-600 text-white' : isLight ? 'text-slate-800 hover:bg-slate-50' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    {item.label}
                    <item.icon size={20} className="opacity-50" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-10 border-t border-black/5 dark:border-white/5">
                <button className="w-full py-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-black text-lg shadow-2xl shadow-indigo-500/30">Upgrade to Pro</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;