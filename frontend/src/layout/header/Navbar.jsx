import React, { useState, useMemo } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';

const Navbar = () => {
  const { pathname, hash } = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);

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

  const isLight = !isDark;

  const navLinks = useMemo(() => [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Library', path: '/#library', icon: Music },
    { label: 'Community', path: '/community', icon: Users },
    {
      label: 'Studio',
      path: isAuthenticated ? '/dashboard' : '/login',
      icon: LayoutDashboard,
    },
    {
      label: user?.role === 'admin' ? 'Admin' : 'Profile',
      path: isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/profile') : '/register',
      icon: user?.role === 'admin' ? Bell : User,
    },
  ], [isAuthenticated, user?.role]);

  const isActiveLink = (path) => {
    if (path.includes('#')) {
      const [basePath, anchor] = path.split('#');
      return pathname === (basePath || '/') && hash === `#${anchor}`;
    }

    return pathname === path;
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
              const active = isActiveLink(item.path);
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
                    to={user?.role === 'admin' ? '/admin' : '/profile'}
                    className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all
                    ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
                    title={user?.role === 'admin' ? 'Admin dashboard' : 'Profile'}
                  >
                    {user?.role === 'admin' ? <Bell size={18} /> : <User size={18} />}
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
                  to="/register"
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
                  <>
                    <Link
                      to={user?.role === 'admin' ? '/admin' : '/profile'}
                      onClick={() => setMobileOpen(false)}
                      className={`text-2xl font-black p-4 rounded-3xl transition-all flex items-center justify-between
                      ${(user?.role === 'admin' ? pathname === '/admin' : pathname === '/profile') ? 'bg-indigo-600 text-white' : isLight ? 'text-slate-800 hover:bg-slate-50' : 'text-slate-300 hover:bg-white/5'}`}
                    >
                      {user?.role === 'admin' ? 'Admin' : 'Profile'}
                      {user?.role === 'admin' ? <Bell size={20} className="opacity-50" /> : <User size={20} className="opacity-50" />}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className={`text-2xl font-black p-4 rounded-3xl transition-all flex items-center justify-between text-left w-full
                      ${isLight ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10'}`}
                    >
                      Logout
                      <LogOut size={20} className="opacity-50" />
                    </button>
                  </>
                )}
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`text-2xl font-black p-4 rounded-3xl transition-all flex items-center justify-between
                    ${isActiveLink(item.path) ? 'bg-indigo-600 text-white' : isLight ? 'text-slate-800 hover:bg-slate-50' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    {item.label}
                    <item.icon size={20} className="opacity-50" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-10 border-t border-black/5 dark:border-white/5">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-3xl bg-gradient-to-r from-indigo-600 to-sky-600 py-5 text-center text-lg font-black text-white shadow-2xl shadow-indigo-500/30"
                >
                  {isAuthenticated ? 'Open Studio' : 'Start Free'}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
