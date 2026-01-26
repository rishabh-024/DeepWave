import React, { useState, useCallback, useMemo, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from "react-router-dom";
import { LogOut, ArrowLeft, Sparkles, Activity, Award, Target } from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";
import StatCard from "./Stats/StatCard";

const AdminPanel = React.lazy(() => import("../../admin/AdminPanel"));

import MoodLogger from "./MoodLogger";
import MoodHistory from "./MoodHistory";
import TherapySession from "./TherapySession";

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center p-8 bg-slate-800/30 rounded-2xl h-64">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      <div
        className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"
        style={{ animationDirection: "reverse", animationDuration: "1s" }}
      />
    </div>
  </div>
));

const FloatingOrbs = memo(() => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute top-1/4 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite]" />
    <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_reverse]" />
  </div>
));

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading: dataLoading } = useDashboardData();
  const [activeSession, setActiveSession] = useState(null);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const handleMoodLogged = useCallback((sessionData) => {
    setActiveSession(sessionData);
  }, []);

  const handleSessionEnd = useCallback(() => {
    setActiveSession(null);
  }, []);

  const handlePlayTrack = useCallback((track) => {
    console.log("Playing track:", track);
  }, []);

  const welcomeMessage = useMemo(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    return `${greeting}, ${user?.name ?? "User"}`;
  }, [user?.name]);

  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white relative isolate overflow-x-hidden">
      <FloatingOrbs />
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-500/30">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                {welcomeMessage}
              </h1>
              <p className="text-white/60">Let’s take a moment for your well-being.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white/5 backdrop-blur-xl rounded-full hover:bg-white/10 transition-all border border-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Library
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-red-500/10 text-red-300 rounded-full hover:bg-red-500/20 transition-all border border-red-500/30"
            >
              <LogOut className="h-4 w-4" /> Logout
            </motion.button>
          </div>
        </motion.header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Activity} label="Moods Logged" value={data?.mindTrends?.totalLogs || 0} trend={data?.mindTrends?.moodShift} color="purple" />
          <StatCard icon={Sparkles} label="Calm Score" value={data?.mindTrends?.calmScore || 0} trend="+5 this week" color="blue" />
          <StatCard icon={Award} label="Streak" value={`${data?.mindTrends?.longestStreak || 0}`} trend="days" color="green" />
          <StatCard icon={Target} label="Weekly Avg" value={data?.mindTrends?.weeklyAverage || 0} trend="moods/day" color="pink" />
        </section>

        {/* Main Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Instant render instead of lazy Suspense */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSession ? "session" : "logger"}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeSession ? (
                    <TherapySession
                      sessionData={activeSession}
                      onEndSession={handleSessionEnd}
                      onPlayTrack={handlePlayTrack}
                    />
                  ) : (
                    <MoodLogger onMoodLogged={handleMoodLogged} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Lazy-load Admin Panel only */}
            {isAdmin && (
              <React.Suspense fallback={<LoadingFallback />}>
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                  <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
                  <AdminPanel />
                </div>
              </React.Suspense>
            )}
          </div>

          {/* Mood History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
          >
            <MoodHistory />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;